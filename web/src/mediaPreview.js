// Detects YouTube / Vimeo / TwitPic links in tweet text and resolves a preview
// image + link-out URL for them. Everything else (the ~85% of links that went
// through bit.ly/t.co/goo.gl/etc.) is left as plain text -- following those
// redirect chains needs CORS support at every hop, which shorteners don't
// provide, so there is no reliable client-side way to resolve them.

const YOUTUBE_RE = /(?:youtu\.be\/|youtube\.com\/watch\?v=)([A-Za-z0-9_-]{6,15})/;
const VIMEO_RE = /vimeo\.com\/(\d{6,12})/;
const TWITPIC_RE = /twitpic\.com\/([A-Za-z0-9]{4,10})\b/;

export function detectMedia(text) {
  let m;
  if ((m = text.match(YOUTUBE_RE))) return { type: "youtube", id: m[1] };
  if ((m = text.match(VIMEO_RE))) return { type: "vimeo", id: m[1] };
  if ((m = text.match(TWITPIC_RE))) return { type: "twitpic", id: m[1] };
  return null;
}

const cache = new Map();

export async function resolvePreview(media) {
  const key = `${media.type}:${media.id}`;
  if (cache.has(key)) return cache.get(key);

  const promise = resolveUncached(media).catch(() => null);
  cache.set(key, promise);
  return promise;
}

async function resolveUncached(media) {
  if (media.type === "youtube") {
    return {
      kind: "video",
      imageUrl: `https://img.youtube.com/vi/${media.id}/mqdefault.jpg`,
      linkUrl: `https://www.youtube.com/watch?v=${media.id}`,
      label: "YouTube",
    };
  }

  if (media.type === "vimeo") {
    const res = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${media.id}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.thumbnail_url) return null;
    return {
      kind: "video",
      imageUrl: data.thumbnail_url,
      linkUrl: `https://vimeo.com/${media.id}`,
      label: "Vimeo",
    };
  }

  if (media.type === "twitpic") {
    const res = await fetch(`https://twitpic.com/${media.id}`);
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/<img src="([^"]+)"[^>]*alt="/);
    if (!match) return null;
    return {
      kind: "image",
      imageUrl: match[1],
      linkUrl: `https://twitpic.com/${media.id}`,
      label: "TwitPic",
    };
  }

  return null;
}

// Build-time resolved shortener links (bit.ly/goo.gl/etc.) -- these can't be
// followed client-side (the shorteners don't send CORS headers), so a batch
// script resolved them ahead of time: direct YouTube/Vimeo links found behind
// a shortener, and news/blog articles that passed a relevance + liveness
// filter (keyword match, and not just a dead link soft-redirecting to a
// domain's homepage).
let linkPreviewsPromise = null;
export function loadLinkPreviews() {
  if (!linkPreviewsPromise) {
    linkPreviewsPromise = fetch("/data/link_previews.json")
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({}));
  }
  return linkPreviewsPromise;
}

const URL_RE = /https?:\/\/[^\s]+/g;
const TRAILING_PUNCT_RE = /[.,;:)"]+$/;

// Synchronous per-URL lookup for inline-linkifying tweet text: given one URL
// as it appears in a tweet and the already-loaded previews map, returns the
// real destination to link to, or null if it's unresolvable (shortener we
// never managed to follow, dead link, or filtered out as irrelevant/unsafe).
export function linkUrlForUrl(url, previewsMap) {
  const clean = url.replace(TRAILING_PUNCT_RE, "");
  const direct = detectMedia(clean);
  if (direct) {
    if (direct.type === "youtube") return `https://www.youtube.com/watch?v=${direct.id}`;
    if (direct.type === "vimeo") return `https://vimeo.com/${direct.id}`;
    if (direct.type === "twitpic") return `https://twitpic.com/${direct.id}`;
  }
  const entry = previewsMap[clean];
  return entry ? entry.linkUrl : null;
}

export async function resolveForTweetText(text) {
  const direct = detectMedia(text);
  if (direct) {
    const preview = await resolvePreview(direct);
    if (preview) return preview;
  }

  const previews = await loadLinkPreviews();
  const urls = text.match(URL_RE) || [];
  for (const raw of urls) {
    const entry = previews[raw.replace(TRAILING_PUNCT_RE, "")];
    if (!entry) continue;

    if (entry.kind === "youtube" || entry.kind === "vimeo") {
      const preview = await resolvePreview({ type: entry.kind, id: entry.id });
      if (preview) return preview;
    } else if (entry.kind === "article") {
      return {
        kind: "article",
        title: entry.title,
        imageUrl: entry.imageUrl,
        linkUrl: entry.linkUrl,
        label: entry.siteName,
      };
    }
  }

  return null;
}
