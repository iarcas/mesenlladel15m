import fs from "node:fs";
import path from "node:path";

const WEB = path.join(path.dirname(import.meta.dirname), "web");

const ABOUT_FILE = { ca: "sobre.html", es: "sobre.html", en: "about.html" };
const CONTACT_FILE = { ca: "contactar.html", es: "contactar.html", en: "contact.html" };

const DESCRIPTION = {
  ca: "Visualització sonoritzada dels tweets enviats durant el període de l'AcampadaBcn del Moviment #15M",
  es: "Visualización sonorizada de los tweets enviados durante el periodo de la AcampadaBcn del Movimiento #15M",
  en: "Sonified visualization of the tweets sent during the AcampadaBcn period of the #15M Movement",
};

function basePage(locale, importPath, bootCall) {
  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="keywords" content="15M, Moviment 15M, #15M, indignats, spanish revolution, #spanishrevolution, democracia real ya, #democraciarealya, visualizacion, acampadaBcn, data visualization, toma la calle, #tomalacalle" />
<meta name="description" content="${DESCRIPTION[locale]}" />
<link rel="icon" href="/favicon.ico" />
<title>Més Enllà del #15M</title>
</head>
<body>
<div id="app"></div>
<script type="module">
  import { ${importPath.fn} } from "${importPath.path}";
  ${bootCall}
</script>
</body>
</html>
`;
}

for (const locale of ["ca", "es", "en"]) {
  const dir = path.join(WEB, locale);
  // Clean out the old (pre-restructure) nested /vis/ folder and stale page files.
  fs.rmSync(path.join(dir, "vis"), { recursive: true, force: true });
  for (const stale of ["codi.html", "codigo.html", "code.html", "agraiments.html", "agradecimientos.html", "acknowledgements.html"]) {
    fs.rmSync(path.join(dir, stale), { force: true });
  }

  fs.mkdirSync(dir, { recursive: true });
  const write = (file, html) => fs.writeFileSync(path.join(dir, file), html);

  write(
    "index.html",
    basePage(locale, { fn: "renderVisPage", path: "/src/vis.js" }, `renderVisPage("${locale}");`)
  );
  write(
    ABOUT_FILE[locale],
    basePage(locale, { fn: "renderPage", path: "/src/layout.js" }, `renderPage({ locale: "${locale}", page: "about" });`)
  );
  write(
    CONTACT_FILE[locale],
    basePage(locale, { fn: "renderPage", path: "/src/layout.js" }, `renderPage({ locale: "${locale}", page: "contact" });`)
  );
}

console.log("Pages generated for ca/es/en (vis = index.html, about, contact).");
