#!/usr/bin/env python3
"""
Rebuilds web/public/data/tweets.json and web/public/images/* from the original
2012 MySQL dump (downloads/mesenlladel15m.sql, unzipped from mesenlladel15m.sql.zip)
and the locally-cached profile images (MesEnllaDel15M-ORIGINAL/vis/data).

Replaces the old live MySQL query in Tweets.pde with a one-time static export.
No DB credentials involved -- this only reads flat files.
"""
import re
import json
import os
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SQL_ZIP = os.path.join(ROOT, "MesEnllaDel15M-ORIGINAL", "downloads", "mesenlladel15m.sql.zip")
IMG_SRC_DIR = os.path.join(ROOT, "MesEnllaDel15M-ORIGINAL", "vis", "data")
AUDIO_SRC_DIR = os.path.join(ROOT, "MesEnllaDel15M-ORIGINAL", "vis", "audio")

OUT_DATA = os.path.join(ROOT, "web", "public", "data", "tweets.json")
OUT_IMG_DIR = os.path.join(ROOT, "web", "public", "images")
OUT_AUDIO_DIR = os.path.join(ROOT, "web", "public", "audio")

RANGE_START = "2011-05-13 00:00:00"
RANGE_END = "2011-06-12 23:59:59"
HASHTAGS = ("#acampadabcn", "#tomalacalle")


def parse_tuples(values_blob):
    tuples = []
    i, n = 0, len(values_blob)
    while i < n:
        if values_blob[i] == '(':
            fields, cur = [], []
            i += 1
            in_str = False
            while i < n:
                c = values_blob[i]
                if in_str:
                    if c == "'":
                        if i + 1 < n and values_blob[i + 1] == "'":
                            cur.append("'")
                            i += 2
                            continue
                        in_str = False
                        i += 1
                        continue
                    elif c == "\\" and i + 1 < n:
                        cur.append(values_blob[i + 1])
                        i += 2
                        continue
                    else:
                        cur.append(c)
                        i += 1
                        continue
                else:
                    if c == "'":
                        in_str = True
                        i += 1
                        continue
                    elif c == ',':
                        fields.append(''.join(cur).strip())
                        cur = []
                        i += 1
                        continue
                    elif c == ')':
                        fields.append(''.join(cur).strip())
                        tuples.append(fields)
                        i += 1
                        break
                    else:
                        cur.append(c)
                        i += 1
                        continue
            continue
        i += 1
    return tuples


def to_null(v):
    return None if v == "NULL" else v


def main():
    import zipfile
    import tempfile

    with tempfile.TemporaryDirectory() as tmp:
        with zipfile.ZipFile(SQL_ZIP) as z:
            sql_name = next(n for n in z.namelist() if n.endswith(".sql"))
            z.extract(sql_name, tmp)
            sql_path = os.path.join(tmp, sql_name)

        with open(sql_path, "r", encoding="utf-8", errors="replace") as f:
            sql = f.read()

        def blobs_for(table):
            pat = re.compile(r"INSERT INTO `" + table + r"`[^V]*VALUES\s*(.*?);\n", re.DOTALL)
            return pat.findall(sql)

        tweet_rows = []
        for blob in blobs_for("tweets"):
            for t in parse_tuples(blob):
                if len(t) != 7:
                    continue
                created_at, id_, source, text, tweet_lang, user, retweet_count = t
                tweet_rows.append({
                    "id": id_,
                    "created_at": to_null(created_at),
                    "text": to_null(text),
                    "retweet_count": int(retweet_count) if retweet_count != "NULL" else 0,
                    "user": to_null(user),
                })

        m = re.search(r"CREATE TABLE IF NOT EXISTS `users` \((.*?)\n\) ENGINE", sql, re.DOTALL)
        cols = [mm.group(1) for mm in (re.match(r"`(\w+)`", l.strip().rstrip(','))
                                        for l in m.group(1).splitlines()) if mm]

        users = {}
        for blob in blobs_for("users"):
            for t in parse_tuples(blob):
                if len(t) != len(cols):
                    continue
                row = dict(zip(cols, [to_null(x) for x in t]))
                users[row["id"]] = row

    print(f"parsed {len(tweet_rows)} tweets, {len(users)} users", file=sys.stderr)

    filtered = [t for t in tweet_rows if t["created_at"] and RANGE_START <= t["created_at"] <= RANGE_END]
    print(f"{len(filtered)} tweets in range {RANGE_START}..{RANGE_END}", file=sys.stderr)

    existing_images = {}
    if os.path.isdir(IMG_SRC_DIR):
        for fn in os.listdir(IMG_SRC_DIR):
            stem, ext = os.path.splitext(fn)
            if ext.lower() in (".jpg", ".jpeg", ".png", ".gif") and stem.isdigit():
                existing_images[stem] = fn

    os.makedirs(OUT_IMG_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(OUT_DATA), exist_ok=True)

    out_tweets = []
    used_users = set()
    for t in filtered:
        hashtag = None
        text = t["text"] or ""
        lower = text.lower()
        for h in HASHTAGS:
            if h in lower:
                hashtag = h.lstrip("#")
                break
        if hashtag is None:
            continue  # original only drew tweets containing one of these tags

        u = users.get(t["user"])
        has_image = t["user"] in existing_images
        image_ext = os.path.splitext(existing_images[t["user"]])[1].lstrip(".").lower() if has_image else None
        out_tweets.append({
            "id": t["id"],
            "created_at": t["created_at"],
            "text": text,
            "retweet_count": t["retweet_count"],
            "user": t["user"],
            "screen_name": u["screen_name"] if u else None,
            "name": u["name"] if u else None,
            "hashtag": hashtag,
            "image_ext": image_ext,
        })
        if has_image:
            used_users.add(t["user"])

    print(f"{len(out_tweets)} tweets kept (contain tracked hashtag)", file=sys.stderr)
    print(f"{len(used_users)} distinct users have a cached profile image", file=sys.stderr)

    with open(OUT_DATA, "w", encoding="utf-8") as f:
        json.dump(out_tweets, f, ensure_ascii=False, separators=(",", ":"))

    copied = 0
    for uid in used_users:
        src = os.path.join(IMG_SRC_DIR, existing_images[uid])
        ext = os.path.splitext(existing_images[uid])[1].lower()
        dst = os.path.join(OUT_IMG_DIR, f"{uid}{ext}")
        if not os.path.exists(dst):
            shutil.copyfile(src, dst)
            copied += 1
    print(f"copied {copied} new profile images to {OUT_IMG_DIR}", file=sys.stderr)

    for banner in ("acampadabcn.jpeg", "toma_la_calle2.jpeg"):
        src = os.path.join(IMG_SRC_DIR, banner)
        if os.path.exists(src):
            shutil.copyfile(src, os.path.join(OUT_IMG_DIR, banner))

    if os.path.isdir(AUDIO_SRC_DIR):
        # Only the numbered clips (1.mp3-16.mp3) are used by the interaction-driven
        # audio player; the lettered ambient tracks (a.mp3-f.mp3, ~290MB) belonged to
        # the original's always-on ambient loop, which this rebuild replaced, so they
        # are not copied (and must not be re-added without updating src/audio.js too).
        os.makedirs(OUT_AUDIO_DIR, exist_ok=True)
        n = 0
        for fn in os.listdir(AUDIO_SRC_DIR):
            stem = os.path.splitext(fn)[0]
            if fn.lower().endswith(".mp3") and stem.isdigit():
                dst = os.path.join(OUT_AUDIO_DIR, fn)
                if not os.path.exists(dst):
                    shutil.copyfile(os.path.join(AUDIO_SRC_DIR, fn), dst)
                    n += 1
        print(f"copied {n} new audio files to {OUT_AUDIO_DIR}", file=sys.stderr)

    out_bytes = os.path.getsize(OUT_DATA)
    print(f"wrote {OUT_DATA} ({out_bytes/1024:.0f} KB)", file=sys.stderr)


if __name__ == "__main__":
    main()
