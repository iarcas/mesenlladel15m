import "./style.css";
import "./vis.css";
import { renderHeader, renderFooter } from "./layout.js";
import { vis } from "./content.js";
import { createVisualization } from "./visCanvas.js";
import { createAudioController } from "./audio.js";
import { resolveForTweetText, loadLinkPreviews, linkUrlForUrl } from "./mediaPreview.js";

const DAYS = [
  ...Array.from({ length: 19 }, (_, i) => ({ day: 13 + i, month: "05" })), // May 13-31
  ...Array.from({ length: 12 }, (_, i) => ({ day: 1 + i, month: "06" })), // June 1-12
];

function pad2(n) {
  return String(n).padStart(2, "0");
}

const DEAD_LINK_ICON = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" class="dead-link-icon-svg"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`;

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const INLINE_URL_RE = /https?:\/\/[^\s]+/g;

function linkifyTweetText(text, previewsMap, unavailableTitle) {
  let html = "";
  let lastIndex = 0;
  let m;
  INLINE_URL_RE.lastIndex = 0;
  while ((m = INLINE_URL_RE.exec(text))) {
    html += escapeHtml(text.slice(lastIndex, m.index));
    const rawUrl = m[0];
    const linkUrl = linkUrlForUrl(rawUrl, previewsMap);
    if (linkUrl) {
      html += `<a href="${escapeHtml(linkUrl)}" target="_blank" rel="noopener" class="inline-link">${escapeHtml(rawUrl)}</a>`;
    } else {
      html += `${escapeHtml(rawUrl)}<span class="dead-link-icon" title="${escapeHtml(unavailableTitle)}">${DEAD_LINK_ICON}</span>`;
    }
    lastIndex = m.index + rawUrl.length;
  }
  html += escapeHtml(text.slice(lastIndex));
  return html;
}

export function renderVisPage(locale) {
  const t = vis[locale];
  document.title = `${t.title} - Més Enllà del #15M`;
  document.documentElement.lang = locale;

  document.getElementById("app").innerHTML = `
${renderHeader({ locale, active: "vis" })}
<div id="vis-content">
  <h2>${t.title}</h2>
  <p class="vis-what">${t.whatIsThis}</p>
  <p class="vis-intro">${t.intro}</p>

  <div id="vis-app">
    <div id="toolbar">
      <div class="sound-switch-wrap">
        <span class="sound-switch-label">${t.soundLabel}</span>
        <button id="sound-toggle" class="sound-switch" role="switch" aria-checked="false" title="${t.muteTooltip}">
          <span class="sound-switch-knob"></span>
        </button>
      </div>
      <div id="day-chips">
        <button class="chip active" data-all>${t.allTweets}</button>
        ${DAYS.map(({ day, month }, i) => {
          const monthLabel =
            i === 0
              ? `<span class="chip-month-label">${t.months["05"]}</span>`
              : month === "06" && DAYS[i - 1].month === "05"
                ? `<span class="chip-month-label">${t.months["06"]}</span>`
                : "";
          return `${monthLabel}<button class="chip" data-day="${day}" data-month="${month}">${pad2(day)}</button>`;
        }).join("")}
      </div>
    </div>
    <p class="hint">${t.hint}</p>
    <p class="status-line" id="status-line">${t.viewingAll}</p>

    <div id="canvas-container">
      <div id="detail-panel" class="empty" hidden>
        <button id="detail-close" class="detail-close" hidden aria-label="${t.closeTooltip}">✕</button>
        <div class="avatar-wrap">
          <div class="avatar-initial" id="avatar-initial"></div>
          <img id="avatar-img" alt="" />
        </div>
        <div class="detail-text">
          <p class="detail-tweet" id="detail-tweet"></p>
          <p class="detail-meta" id="detail-meta"></p>
          <a id="detail-media-link" class="detail-media" href="#" target="_blank" rel="noopener" hidden>
            <img id="detail-media-img" alt="" hidden />
            <span id="detail-media-badge" class="detail-media-source"></span>
            <p id="detail-media-headline" class="detail-media-headline" hidden></p>
          </a>
        </div>
      </div>
    </div>

    <div class="legend">
      <span class="legend-title">${t.legendTitle}</span>
      <span class="legend-item"><img src="/images/acampadabcn.jpeg" class="legend-icon" alt="" />${t.legendAcampada}</span>
      <span class="legend-item"><img src="/images/toma_la_calle2.jpeg" class="legend-icon" alt="" />${t.legendTomaLaCalle}</span>
      <span class="legend-item legend-size">
        <span class="legend-dot" style="width:8px;height:8px"></span>
        <span class="legend-dot" style="width:14px;height:14px"></span>
        <span class="legend-dot" style="width:20px;height:20px"></span>
        ${t.legendSize}
      </span>
    </div>
  </div>
</div>
${renderFooter(locale)}`;

  const audio = createAudioController();

  const soundToggle = document.getElementById("sound-toggle");
  soundToggle.addEventListener("click", () => {
    const on = soundToggle.getAttribute("aria-checked") === "true";
    if (on) {
      audio.stop();
      soundToggle.setAttribute("aria-checked", "false");
      soundToggle.title = t.unmuteTooltip;
    } else {
      audio.start(); // a real click, so this also unlocks autoplay for later hover-triggered clips
      soundToggle.setAttribute("aria-checked", "true");
      soundToggle.title = t.muteTooltip;
    }
  });

  function boot() {
    Promise.all([fetch("/data/tweets.json").then((r) => r.json()), loadLinkPreviews()])
      .then(([tweets, linkPreviews]) => {
        const container = document.getElementById("canvas-container");
        const statusLine = document.getElementById("status-line");
        const detailPanel = document.getElementById("detail-panel");
        const avatarImg = document.getElementById("avatar-img");
        const avatarInitial = document.getElementById("avatar-initial");
        const detailTweet = document.getElementById("detail-tweet");
        const detailMeta = document.getElementById("detail-meta");
        const mediaLink = document.getElementById("detail-media-link");
        const mediaImg = document.getElementById("detail-media-img");
        const mediaHeadline = document.getElementById("detail-media-headline");
        const mediaBadge = document.getElementById("detail-media-badge");
        const detailClose = document.getElementById("detail-close");

        let mediaRequestId = 0;
        let hideTimer = null;
        let pointerOverPanel = false;
        let isPinned = false;

        function scheduleHide() {
          clearTimeout(hideTimer);
          hideTimer = setTimeout(() => {
            if (!pointerOverPanel) detailPanel.hidden = true;
          }, 250);
        }

        detailPanel.addEventListener("mouseenter", () => {
          pointerOverPanel = true;
          clearTimeout(hideTimer);
        });
        detailPanel.addEventListener("mouseleave", () => {
          pointerOverPanel = false;
          if (!isPinned) scheduleHide();
        });
        detailClose.addEventListener("click", () => sketch.unpin());

        function showTweet(tw, pos, pinned) {
          const wasPinned = isPinned;
          isPinned = !!pinned;
          if (!tw) {
            if (wasPinned) detailPanel.hidden = true; // explicit unpin/close, no need to wait
            else scheduleHide();
            return;
          }
          clearTimeout(hideTimer);
          audio.playForTweet();
          mediaRequestId++;
          mediaLink.hidden = true;
          detailPanel.hidden = false;
          detailClose.hidden = !isPinned;
          detailTweet.innerHTML = linkifyTweetText(tw.text, linkPreviews, t.linkUnavailable);
          const who = tw.name ? `${tw.name} (@${tw.screen_name})` : tw.screen_name ? `@${tw.screen_name}` : "";
          const when = tw.date.toISOString().slice(0, 16).replace("T", "  ") + "h";
          detailMeta.textContent = `${who}  ·  ${when}  ·  ${t.retweets(tw.retweet_count)}`;
          avatarInitial.textContent = (tw.screen_name || "?")[0].toUpperCase();
          if (tw.image_ext) {
            avatarImg.onerror = () => {
              avatarImg.removeAttribute("src");
              avatarImg.style.display = "none";
            };
            avatarImg.src = `/images/${tw.user}.${tw.image_ext}`;
            avatarImg.style.display = "";
          } else {
            avatarImg.removeAttribute("src");
            avatarImg.style.display = "none";
          }
          positionPanel(pos);

          const requestId = mediaRequestId;
          resolveForTweetText(tw.text).then((preview) => {
            if (requestId !== mediaRequestId || !preview) return; // tweet changed, or nothing resolved

            if (preview.kind === "article") {
              mediaHeadline.textContent = preview.title || preview.linkUrl;
              mediaHeadline.hidden = false;
              if (preview.imageUrl) {
                mediaImg.onload = () => positionPanel(pos);
                mediaImg.src = preview.imageUrl;
                mediaImg.hidden = false;
              } else {
                mediaImg.hidden = true;
              }
              mediaBadge.textContent = `↗ ${preview.label}`;
            } else {
              mediaHeadline.hidden = true;
              mediaImg.onload = () => positionPanel(pos);
              mediaImg.src = preview.imageUrl;
              mediaImg.hidden = false;
              mediaBadge.textContent = preview.kind === "video" ? `▶ ${preview.label}` : preview.label;
            }

            mediaLink.href = preview.linkUrl;
            mediaLink.hidden = false;
            positionPanel(pos);
          });
        }

        function positionPanel(pos) {
          const gap = 14;
          const cw = container.clientWidth;
          const ch = container.clientHeight;
          const pw = detailPanel.offsetWidth;
          const ph = detailPanel.offsetHeight;

          let left = pos.x + gap;
          if (left + pw > cw) left = pos.x - pw - gap;
          left = Math.max(6, Math.min(left, cw - pw - 6));

          let top = pos.y - ph / 2;
          if (top + ph > ch - 6) top = ch - ph - 6;
          top = Math.max(6, top);

          detailPanel.style.left = `${left}px`;
          detailPanel.style.top = `${top}px`;
        }

        const sketch = createVisualization({
          container,
          tweets,
          onSelect: showTweet,
          onDayAxisClick: selectDay,
          strings: t,
        });

        const chips = Array.from(document.querySelectorAll("#day-chips .chip"));

        function selectDay(day, month) {
          const chip = day == null ? chips.find((c) => c.hasAttribute("data-all")) : chips.find((c) => Number(c.dataset.day) === day && c.dataset.month === month);
          chips.forEach((c) => c.classList.remove("active"));
          chip && chip.classList.add("active");
          chip && chip.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });

          if (day == null) {
            sketch.setDayFilter(null);
            statusLine.textContent = t.viewingAll;
          } else {
            sketch.setDayFilter(day, month);
            statusLine.textContent = t.viewingDay(`${pad2(day)}/${month}`);
          }
          showTweet(null);
        }

        chips.forEach((chip) => {
          chip.addEventListener("click", () => {
            if (chip.hasAttribute("data-all")) selectDay(null);
            else selectDay(Number(chip.dataset.day), chip.dataset.month);
          });
        });
      });
  }

  boot();
}
