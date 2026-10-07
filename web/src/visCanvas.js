// Plain Canvas2D port of the original Processing sketch (tweets_by_users.pde /
// Tweet.pde / pintarTweet.pde). Same grid math and bubble sizing as the 2012
// Java applet, but event-driven instead of a continuous draw loop: the
// original ran at 15fps forever because Processing's desktop draw() model
// expects that; in a browser tab that just burns CPU for a static picture,
// so here we redraw only on load, hover/tap, and day-filter changes.

const W = 1110;
const H = 880;

// Matches the @font-face in style.css, so axis/canvas text reads as part of
// the same site rather than a generic system font.
const FONT_FAMILY = '"terminal_dosislight", "Trebuchet MS", sans-serif';

const EIX_X_MES = (W - 30) / 31;
const EIX_Y_MES = (H - 180) / 1440;
const EIX_X_DIA = (W - 40) / 24;
const EIX_Y_DIA = (H - 180) / 60;

function dayIndex(d) {
  // May 13 -> 1 ... May 31 -> 19, June 1 -> 20 ... June 12 -> 31
  return d.getUTCMonth() === 4 ? d.getUTCDate() - 12 : d.getUTCDate() + 19;
}

function dateForDayIndex(i) {
  return i <= 19 ? { day: i + 12, month: "05" } : { day: i - 19, month: "06" };
}

function layoutTweet(t) {
  const d = new Date(t.created_at.replace(" ", "T") + "Z");
  const hour = d.getUTCHours();
  const min = d.getUTCMinutes();
  const minuteOfDay = hour * 60 + min;

  const eixXMes = EIX_X_MES;
  const eixYMes = EIX_Y_MES;
  const eixXDia = EIX_X_DIA;
  const eixYDia = EIX_Y_DIA;

  return {
    ...t,
    date: d,
    dayOfMonth: d.getUTCDate(),
    month: d.getUTCMonth() === 4 ? "05" : "06",
    hour,
    min,
    size: Math.max(7, Math.log(t.retweet_count + 2) * 13),
    posXMes: eixXMes * dayIndex(d) + 25,
    posYMes: eixYMes * (minuteOfDay + 1) + 140,
    posXDia: eixXDia * (hour + 1) + 25,
    posYDia: eixYDia * (min + 1) + 140,
  };
}

// About 20% of tweets share the exact same day+hour+minute as another tweet
// (retweets/replies clustering around the same moment), which would otherwise
// stack bubbles exactly on top of each other -- only the last-drawn one
// visible or clickable. Fan colliding tweets out into a small ring so each
// stays individually visible and tappable, in both the month and day views.
function applyCollisionJitter(items) {
  const groups = new Map();
  for (const t of items) {
    const key = `${t.month}-${t.dayOfMonth}-${t.hour}-${t.min}`;
    let g = groups.get(key);
    if (!g) groups.set(key, (g = []));
    g.push(t);
  }
  for (const group of groups.values()) {
    const n = group.length;
    if (n < 2) continue;
    const radius = 5 + Math.min(n, 8);
    group.forEach((t, i) => {
      const angle = (i / n) * Math.PI * 2;
      const dx = Math.cos(angle) * radius;
      const dy = Math.sin(angle) * radius;
      t.posXMes += dx;
      t.posYMes += dy;
      t.posXDia += dx;
      t.posYDia += dy;
    });
  }
}

function overBubble(mx, my, x, y, size) {
  const half = size / 2;
  return mx >= x - half && mx <= x + half && my >= y - half && my <= y + half;
}

function loadImg(src) {
  const img = new Image();
  img.src = src;
  return img;
}

export function createVisualization({ container, tweets, onSelect, onDayAxisClick, strings }) {
  const laidOut = tweets.map(layoutTweet);
  applyCollisionJitter(laidOut);
  let dayFilter = null;
  let filtered = laidOut;
  let hovered = null;
  let pinned = false;
  let hoveredAxisDay = null;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement("canvas");
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = "100%";
  canvas.style.maxWidth = W + "px";
  canvas.style.height = "auto";
  canvas.style.display = "block";
  canvas.style.touchAction = "manipulation";
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = true;

  const imgA = loadImg("/images/acampadabcn.jpeg");
  const imgB = loadImg("/images/toma_la_calle2.jpeg");
  const userImgCache = new Map();
  let pendingRedraw = false;

  function requestRedraw() {
    if (pendingRedraw) return;
    pendingRedraw = true;
    requestAnimationFrame(() => {
      pendingRedraw = false;
      redraw();
    });
  }

  imgA.onload = requestRedraw;
  imgB.onload = requestRedraw;

  function userImageFor(t) {
    if (!t.image_ext) return null;
    let img = userImgCache.get(t.user);
    if (!img) {
      img = loadImg(`/images/${t.user}.${t.image_ext}`);
      img.onload = () => {
        if (hovered === t) requestRedraw();
      };
      userImgCache.set(t.user, img);
    }
    return img.complete && img.naturalWidth > 0 ? img : null;
  }

  function drawGrid() {
    ctx.strokeStyle = "#efefef";
    ctx.lineWidth = 1;
    const rows = dayFilter ? 7 : 25;
    const spacing = dayFilter ? (H - 180) / 6 : (H - 180) / 24;
    for (let i = 1; i < rows; i++) {
      const y = spacing * i + 109;
      ctx.beginPath();
      ctx.moveTo(35, y);
      ctx.lineTo(W - 20, y);
      ctx.stroke();
    }
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function drawAxisLabels() {
    ctx.font = `13px ${FONT_FAMILY}`;

    if (!dayFilter) {
      // Day-of-month numbers along the top double as clickable shortcuts into
      // day view, styled like the day-chip buttons (grey by default, yellow
      // on hover) so they read as interactive, not just axis labels.
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      for (let i = 1; i <= 31; i++) {
        const cx = EIX_X_MES * (i + 1) - 10;
        const isHovered = i === hoveredAxisDay;
        ctx.fillStyle = isHovered ? "#f3d354" : "#fff";
        ctx.strokeStyle = isHovered ? "#f3d354" : "#e3e3e3";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(cx - EIX_X_MES / 2 + 2, 86, EIX_X_MES - 4, 17, 8);
        ctx.fill();
        ctx.stroke();
      }
      for (let i = 1; i <= 31; i++) {
        const { day } = dateForDayIndex(i);
        ctx.fillStyle = i === hoveredAxisDay ? "#3f3f3f" : "#999";
        ctx.fillText(pad2(day), EIX_X_MES * (i + 1) - 10, 100);
      }
      ctx.fillStyle = "#bdbdbd";
      ctx.textAlign = "right";
      for (let hour = 0; hour < 24; hour++) {
        ctx.fillText(pad2(hour), 28, EIX_Y_MES * (hour * 60 + 1) + 144);
      }

      ctx.fillStyle = "#999";
      ctx.font = `bold 22px ${FONT_FAMILY}`;
      ctx.textAlign = "center";
      ctx.fillText(strings.months["05"], EIX_X_MES * 10, 35);
      ctx.fillText(strings.months["06"], EIX_X_MES * 26, 35);

      ctx.fillStyle = "#ccc";
      ctx.font = `12px ${FONT_FAMILY}`;
      ctx.textAlign = "left";
      ctx.fillText(strings.day, 4, 97);
      ctx.fillText(strings.hour, 4, 112);
    } else {
      // Hour-of-day (00-23) along the top, minute (00,10,...50) along the left.
      // Neither axis is clickable here, so both stay plain grey -- no accent
      // color that would wrongly suggest they're buttons too.
      ctx.fillStyle = "#bdbdbd";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      for (let hour = 0; hour < 24; hour++) {
        ctx.fillText(pad2(hour), EIX_X_DIA * (hour + 1), 100);
      }
      ctx.textAlign = "right";
      for (let min = 0; min < 60; min += 10) {
        ctx.fillText(pad2(min), 28, EIX_Y_DIA * (min + 1) + 144);
      }

      ctx.fillStyle = "#999";
      ctx.font = `bold 22px ${FONT_FAMILY}`;
      ctx.textAlign = "center";
      ctx.fillText(strings.formatFullDate(dayFilter.day, dayFilter.month), W / 2, 35);

      ctx.fillStyle = "#ccc";
      ctx.font = `12px ${FONT_FAMILY}`;
      ctx.textAlign = "left";
      ctx.fillText(strings.hour, 4, 97);
      ctx.fillText(strings.min, 4, 112);
    }
  }

  function posOf(t) {
    return dayFilter ? [t.posXDia, t.posYDia] : [t.posXMes, t.posYMes];
  }

  function drawBubble(t) {
    const [x, y] = posOf(t);
    const img = t.hashtag === "acampadabcn" ? imgA : imgB;
    if (!img.complete || img.naturalWidth === 0) return;
    ctx.globalAlpha = 0.65;
    ctx.drawImage(img, x - t.size / 2, y - t.size / 2, t.size, t.size);
    ctx.globalAlpha = 1;
  }

  function drawPlaceholder(x, y, size, label) {
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = "#d8d8d8";
    ctx.fill();
    ctx.fillStyle = "#777";
    ctx.font = `bold ${Math.max(10, size * 0.4)}px ${FONT_FAMILY}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x, y + 1);
  }

  function drawHovered(t) {
    const [x, y] = posOf(t);
    ctx.beginPath();
    ctx.arc(x, y, t.size / 2 + 3, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#d1d1d1";
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();

    const img = userImageFor(t);
    if (img) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, t.size / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, x - t.size / 2, y - t.size / 2, t.size, t.size);
      ctx.restore();
    } else {
      drawPlaceholder(x, y, t.size, (t.screen_name || "?")[0].toUpperCase());
    }
  }

  function redraw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#fdfdfd";
    ctx.fillRect(0, 0, W, H);
    drawGrid();
    drawAxisLabels();
    for (const t of filtered) drawBubble(t);
    if (hovered) drawHovered(hovered);
  }

  function findAt(x, y) {
    for (let i = filtered.length - 1; i >= 0; i--) {
      const t = filtered[i];
      const [tx, ty] = posOf(t);
      if (overBubble(x, y, tx, ty, Math.max(t.size, 16))) return t;
    }
    return null;
  }

  function eventToLogical(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return [((clientX - rect.left) / rect.width) * W, ((clientY - rect.top) / rect.height) * H];
  }

  function cssPosOf(t) {
    const [lx, ly] = posOf(t);
    const canvasRect = canvas.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const scale = canvasRect.width / W;
    return {
      x: canvasRect.left - containerRect.left + lx * scale,
      y: canvasRect.top - containerRect.top + ly * scale,
    };
  }

  function setHovered(t) {
    if (t === hovered) return;
    hovered = t;
    requestRedraw();
    onSelect(hovered, hovered ? cssPosOf(hovered) : null, pinned);
  }

  function setPinned(t) {
    pinned = true;
    if (t === hovered) {
      onSelect(hovered, hovered ? cssPosOf(hovered) : null, pinned); // re-emit so the UI knows it's now pinned
    } else {
      hovered = t;
      requestRedraw();
      onSelect(hovered, hovered ? cssPosOf(hovered) : null, pinned);
    }
  }

  function unpin() {
    pinned = false;
    setHovered(null);
  }

  // Day-of-month axis labels (top row, "all tweets" view only) are also clickable shortcuts into day view.
  function dayAxisHitTest(x, y) {
    if (dayFilter || y < 85 || y > 106) return null;
    for (let i = 1; i <= 31; i++) {
      const cx = EIX_X_MES * (i + 1) - 10;
      if (Math.abs(x - cx) < EIX_X_MES / 2) return { i, ...dateForDayIndex(i) };
    }
    return null;
  }

  canvas.addEventListener("mousemove", (e) => {
    const [x, y] = eventToLogical(e.clientX, e.clientY);
    const axisHit = dayAxisHitTest(x, y);
    canvas.style.cursor = axisHit || findAt(x, y) ? "pointer" : "default";
    const newHoveredAxisDay = axisHit ? axisHit.i : null;
    if (newHoveredAxisDay !== hoveredAxisDay) {
      hoveredAxisDay = newHoveredAxisDay;
      requestRedraw();
    }
    if (pinned) return;
    setHovered(findAt(x, y));
  });
  canvas.addEventListener("mouseleave", () => {
    if (hoveredAxisDay !== null) {
      hoveredAxisDay = null;
      requestRedraw();
    }
    if (!pinned) setHovered(null);
  });
  canvas.addEventListener("click", (e) => {
    const [x, y] = eventToLogical(e.clientX, e.clientY);
    const axisHit = dayAxisHitTest(x, y);
    if (axisHit) {
      onDayAxisClick && onDayAxisClick(axisHit.day, axisHit.month);
      return;
    }
    const t = findAt(x, y);
    if (t) {
      setPinned(t);
    } else if (pinned) {
      unpin();
    }
  });
  canvas.addEventListener(
    "touchstart",
    (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      const [x, y] = eventToLogical(touch.clientX, touch.clientY);
      const axisHit = dayAxisHitTest(x, y);
      if (axisHit) {
        onDayAxisClick && onDayAxisClick(axisHit.day, axisHit.month);
        return;
      }
      const t = findAt(x, y);
      if (t) setPinned(t);
      else if (pinned) unpin();
    },
    { passive: true }
  );

  requestRedraw();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(requestRedraw);
  }

  return {
    setDayFilter(day, month) {
      dayFilter = day == null ? null : { day, month };
      filtered = dayFilter == null ? laidOut : laidOut.filter((t) => t.dayOfMonth === dayFilter.day && t.month === dayFilter.month);
      hovered = null;
      pinned = false;
      onSelect(null);
      requestRedraw();
    },
    unpin,
  };
}
