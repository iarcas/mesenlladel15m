// Runs at Vercel's edge before any static file is served (production only --
// `vite dev`/`vite preview` don't execute this, so local dev falls back to
// the plain default-to-Catalan redirect baked into index.html).
//
// Priority, per request:
//   1. Catalan   -- browser language is Catalan, OR geolocated to Catalonia (ES-CT)
//   2. Spanish   -- browser language is Spanish, OR geolocated to Spain (any region)
//   3. English   -- everyone else (fallback for other countries/languages)

export const config = { matcher: "/" };

function parseLangTags(acceptLanguage) {
  return acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0].trim().toLowerCase())
    .filter(Boolean);
}

function prefers(tags, code) {
  return tags.some((tag) => tag === code || tag.startsWith(code + "-"));
}

export default function middleware(request) {
  const country = request.headers.get("x-vercel-ip-country") || "";
  const region = request.headers.get("x-vercel-ip-country-region") || "";
  const tags = parseLangTags(request.headers.get("accept-language") || "");

  const prefersCatalan = prefers(tags, "ca");
  const prefersSpanish = prefers(tags, "es");
  const inCatalonia = country === "ES" && region === "CT";
  const inSpain = country === "ES";

  let lang = "en";
  if (prefersCatalan || inCatalonia) {
    lang = "ca";
  } else if (prefersSpanish || inSpain) {
    lang = "es";
  }

  return Response.redirect(new URL(`/${lang}/index.html`, request.url), 307);
}
