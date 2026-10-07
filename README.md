# Més Enllà del #15M

**Beyond Trending Topics: a sonified visualization about #15M**

An interactive, sonified visualization of the tweets sent during the
AcampadaBCN period of Spain's 2011 #15M movement (May-June 2011),
mapped day by day and hour by hour, with bubble size reflecting
retweet count.

Originally built in 2012 as a final degree project at ESDi (Escola
Superior de Disseny), using Processing packaged as a Java applet.
Java applets lost browser support everywhere around 2015-2017, so
that version stopped running. Rebuilt from scratch in 2026 as a
static site with vanilla JavaScript and the browser's native Canvas2D
API, no applet, no live database, no build-time dependency beyond
Vite.

Live site: https://mesenlladel15m.vercel.app

For the full story, including the original hypothesis, the 2026
rebuild, and acknowledgments, see the project's own **About** page
(`/ca/sobre.html`, `/es/sobre.html`, `/en/about.html`) once deployed,
or read the equivalent content in
[`web/src/content.js`](web/src/content.js).

## Running it locally

```bash
cd web
npm install
npm run dev
```

Then open the URL Vite prints (defaults to `http://localhost:5173`),
and navigate to `/ca/index.html`, `/es/index.html`, or
`/en/index.html`.

To build the static production output:

```bash
npm run build   # outputs to web/dist/
npm run preview # serve that build locally to sanity-check it
```

## How the data pipeline works

The tweet and user data (`web/public/data/tweets.json`) and the
profile images (`web/public/images/`) are already generated and
committed, so the steps above work immediately with no extra setup.

The `scripts/` directory holds the Python/Node scripts used to
produce that data from the original 2012 MySQL dump and scraped
assets:

- `scripts/build_data.py` parses the original SQL dump into the
  static `tweets.json`/`users.json` and copies matching profile
  images and audio clips.
- `scripts/fetch_previews.py` resolves the shortened links
  (`bit.ly`, `t.co`, etc.) found in tweet text into static preview
  data (`link_previews.json`) for the ones that still led somewhere
  relevant and alive.
- `scripts/gen-pages.mjs` generates the per-locale HTML entry files.

These scripts aren't runnable as-is from this repo alone: they read
from the original 2012 database dump and scraped image archive, which
aren't included here (too large, and mostly out of scope for the
2026 rebuild's source). They're kept for transparency, to document
exactly how the static data was derived.

## License

[CC BY-SA 3.0](./LICENSE). Copy, adapt, and reuse freely, including
commercially, as long as you credit the original author and share
your version under the same license. See [CONTRIBUTING.md](./CONTRIBUTING.md)
for a note on how this repo itself handles contributions.
