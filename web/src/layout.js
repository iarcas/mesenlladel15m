import "./style.css";
import { nav, langSwitch, madeWith, pages } from "./content.js";

const ABOUT_FILE = { ca: "sobre.html", es: "sobre.html", en: "about.html" };
const CONTACT_FILE = { ca: "contactar.html", es: "contactar.html", en: "contact.html" };

function pagePath(locale, key) {
  if (key === "vis") return "index.html";
  if (key === "about") return ABOUT_FILE[locale];
  if (key === "contact") return CONTACT_FILE[locale];
  return "#";
}

export function renderHeader({ locale, active }) {
  const otherLocales = ["ca", "es", "en"].filter((l) => l !== locale);
  const langLinks = otherLocales
    .map((l) => `<a href="../${l}/index.html">${langSwitch[l]}</a>`)
    .join("&nbsp;|&nbsp;");

  const navItems = Object.keys(nav[locale])
    .map((key) => {
      const label = nav[locale][key];
      const itemClass = key === "contact" ? "item contact" : "item";
      if (key === active) {
        return `<div class="${itemClass}"><span class="selected">${label}</span></div>`;
      }
      return `<div class="${itemClass}"><a href="${pagePath(locale, key)}">${label}</a></div>`;
    })
    .join("\n");

  return `
<div id="header">
  <div id="language"><span class="current">${langSwitch[locale]}</span>&nbsp;|&nbsp;${langLinks}</div>
  <div id="image_header"><img src="../img/header.jpg" alt="" /></div>
  <div id="nav">${navItems}</div>
</div>`;
}

const ccText = {
  ca: { by: "per", licensedUnder: "està llicenciat sota una", license: "Creative Commons Reconeixement-CompartirIgual 3.0" },
  es: { by: "por", licensedUnder: "está licenciado bajo una", license: "Creative Commons Reconocimiento-CompartirIgual 3.0" },
  en: { by: "by", licensedUnder: "is licensed under a", license: "Creative Commons Attribution-ShareAlike 3.0" },
};

export function renderFooter(locale) {
  const cc = ccText[locale];
  return `
<div id="footer">
  <div id="made_with">${madeWith[locale]}</div>
  <div id="copyright">
    <a href="https://creativecommons.org/licenses/by-sa/3.0/deed.es_ES" target="_blank" rel="license noopener">
      <img alt="Creative Commons License" src="https://i.creativecommons.org/l/by-sa/3.0/88x31.png" />
    </a><br />
    Més Enllà del #15M ${cc.by}
    <a href="http://www.ingridarcas.com" target="_blank" rel="noopener">Ingrid Arcas Sanz</a>
    ${cc.licensedUnder}
    <a href="https://creativecommons.org/licenses/by-sa/3.0/deed.es_ES" target="_blank" rel="license noopener">${cc.license}</a>.
  </div>
</div>`;
}

export function renderPage({ locale, page }) {
  const content = pages[page][locale];
  document.title = `${content.title} - Més Enllà del #15M`;
  document.documentElement.lang = locale;
  document.getElementById("app").innerHTML = `
${renderHeader({ locale, active: page })}
<div id="content">
  <h2>${content.title}</h2>
  ${content.html}
</div>
${renderFooter(locale)}`;
}
