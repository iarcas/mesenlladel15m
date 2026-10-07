#!/usr/bin/env python3
"""
Build-time pass: for every shortened URL that resolved successfully (results.tsv),
fetch the destination page, pull <title>/og:title + og:image, classify it, and
apply an automatic relevance + liveness filter. Writes link_previews.json keyed
by the ORIGINAL shortened URL (what's actually in the tweet text).
"""
import re
import json
import sys
import time
import urllib.request
import urllib.error
from urllib.parse import urlparse

KEYWORDS = [
    "15m", "15-m", "15 m", "indignad", "acampada", "acampad", "democracia real",
    "spanishrevolution", "spanish revolution", "nolesvotes", "tomalacalle",
    "toma la calle", "movimiento 15", "moviment 15", "asamblea popular",
    "democracia ya", "yeswecamp", "occupy", "puerta del sol", "plaza catalunya",
    "indignados", "indignats",
]

UA = "Mozilla/5.0 (compatible; mesenlladel15m-archival/1.0; +static-site-rebuild)"


def fetch(url, timeout=7):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        ctype = resp.headers.get("Content-Type", "")
        if "text/html" not in ctype:
            return None, ctype
        raw = resp.read(200_000)  # cap: we only need <head>
        charset = "utf-8"
        m = re.search(rb'charset=["\']?([\w-]+)', raw[:2000])
        if m:
            try:
                charset = m.group(1).decode("ascii")
            except Exception:
                pass
        try:
            return raw.decode(charset, errors="replace"), ctype
        except LookupError:
            return raw.decode("utf-8", errors="replace"), ctype


def extract_meta(html):
    def og(prop):
        m = re.search(
            rf'<meta[^>]+property=["\']og:{prop}["\'][^>]+content=["\']([^"\']+)["\']',
            html, re.I,
        )
        if m:
            return m.group(1)
        m = re.search(
            rf'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:{prop}["\']',
            html, re.I,
        )
        return m.group(1) if m else None

    title = og("title")
    if not title:
        m = re.search(r"<title[^>]*>([^<]+)</title>", html, re.I)
        title = m.group(1).strip() if m else None
    image = og("image")
    return title, image


NOT_FOUND_RE = re.compile(
    r"\b(page not found|404|error 40|no encontrad|no existe|not found|pagina no disponible)\b",
    re.I,
)


def is_relevant(text):
    low = (text or "").lower()
    return any(k in low for k in KEYWORDS)


def is_real_headline(title, domain):
    if not title:
        return False
    t = title.strip()
    if len(t) < 10:
        return False
    if NOT_FOUND_RE.search(t):
        return False
    bare = domain.lower()
    norm = t.lower().strip(" -|")
    if norm == bare or norm == bare.replace("www.", ""):
        return False
    return True


def main():
    results_path = sys.argv[1]
    out_path = sys.argv[2]

    entries = []
    with open(results_path, encoding="utf-8") as f:
        for line in f:
            parts = line.rstrip("\n").split("\t")
            if len(parts) != 4:
                continue
            orig, final, code, ctype = parts
            if not code.startswith("2"):
                continue
            if "t.co" in urlparse(orig).netloc:
                continue
            entries.append((orig, final, ctype))

    print(f"{len(entries)} candidate 2xx entries (post t.co exclusion)", file=sys.stderr)

    final_url_counts = {}
    for _, final, _ in entries:
        final_url_counts[final] = final_url_counts.get(final, 0) + 1

    page_cache = {}
    out = {}
    kept, rejected_relevance, rejected_duplicate, rejected_fetch = 0, 0, 0, 0

    for i, (orig, final, ctype) in enumerate(entries):
        if i % 100 == 0:
            print(f"  {i}/{len(entries)}...", file=sys.stderr)

        parsed = urlparse(final)
        is_root = parsed.path in ("", "/")
        # Many unrelated originals collapsing onto the exact same page (often a
        # homepage) means the specific resource is gone -- not a real per-tweet link.
        if is_root and final_url_counts[final] > 2:
            rejected_duplicate += 1
            continue

        domain = parsed.netloc.replace("www.", "")

        if domain in ("youtube.com", "youtu.be"):
            m = re.search(r"[?&]v=([A-Za-z0-9_-]{6,15})", final)
            if m:
                out[orig] = {"kind": "youtube", "id": m.group(1), "linkUrl": final}
                kept += 1
            continue
        if domain == "vimeo.com":
            m = re.search(r"vimeo\.com/(\d{6,12})", final)
            if m:
                out[orig] = {"kind": "vimeo", "id": m.group(1), "linkUrl": final}
                kept += 1
            continue

        if final in page_cache:
            title, image = page_cache[final]
        else:
            try:
                html, real_ctype = fetch(final)
                if html is None:
                    page_cache[final] = (None, None)
                    rejected_fetch += 1
                    continue
                title, image = extract_meta(html)
                page_cache[final] = (title, image)
            except (urllib.error.URLError, TimeoutError, OSError, ValueError):
                page_cache[final] = (None, None)
                rejected_fetch += 1
                continue
            time.sleep(0.05)

        if not is_real_headline(title, domain):
            rejected_relevance += 1
            continue
        if not is_relevant(title) and not is_relevant(final):
            rejected_relevance += 1
            continue

        out[orig] = {
            "kind": "article",
            "title": title,
            "imageUrl": image,
            "linkUrl": final,
            "siteName": domain,
        }
        kept += 1

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=0)

    print(f"kept={kept} rejected_relevance={rejected_relevance} "
          f"rejected_duplicate_root={rejected_duplicate} rejected_fetch={rejected_fetch}",
          file=sys.stderr)


if __name__ == "__main__":
    main()
