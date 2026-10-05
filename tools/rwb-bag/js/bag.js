const SIZE = 1080;
const MAX_CHARS = 12;

const RED = "#be1e2d";
const BLUE = "#1f4e89";
const BONE = "#f3ede0";

const FONT_STACK =
  '"PingFang HK", "PingFang TC", "Hiragino Sans CNS", "Noto Sans CJK TC", "WenQuanYi Micro Hei", "Microsoft JhengHei", "Heiti TC", sans-serif';

const STRIPE_SETT = [
  BLUE,
  BLUE,
  BLUE,
  BLUE,
  BLUE,
  BLUE,
  BONE,
  BONE,
  RED,
  RED,
  RED,
  RED,
  RED,
  BONE,
  BONE,
  BONE,
  BLUE,
  BLUE,
  BONE,
  BONE,
  RED,
  RED,
  RED,
  BONE,
  BONE,
  BONE,
  BONE,
  BLUE,
  BLUE,
  BONE,
  BONE,
  BONE,
];

let weaveCanvas = null;

export { MAX_CHARS };

export function charsOf(value) {
  return Array.from(value.replace(/\s+/g, " ").trim());
}

export function clipPhrase(value) {
  return charsOf(value).slice(0, MAX_CHARS).join("");
}

function mixHex(hex, toward, amount) {
  const a = hexToRgb(hex);
  const b = hexToRgb(toward);
  const t = Math.min(1, Math.max(0, amount));
  return rgbToHex(
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  );
}

function hexToRgb(hex) {
  const n = hex.replace("#", "");
  return [
    parseInt(n.slice(0, 2), 16),
    parseInt(n.slice(2, 4), 16),
    parseInt(n.slice(4, 6), 16),
  ];
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function getWeave() {
  if (weaveCanvas) return weaveCanvas;

  const fiber = 4;
  const period = STRIPE_SETT.length * fiber;
  const c = document.createElement("canvas");
  c.width = period;
  c.height = period;
  const ctx = c.getContext("2d");

  for (let y = 0, fj = 0; y < period; y += fiber, fj += 1) {
    for (let x = 0, fi = 0; x < period; x += fiber, fi += 1) {
      const vertical = STRIPE_SETT[fi % STRIPE_SETT.length];
      const horizontal = STRIPE_SETT[fj % STRIPE_SETT.length];
      const overVertical = (fi + fj) % 2 === 0;
      let color = overVertical ? vertical : horizontal;
      color = mixHex(color, "#000000", overVertical ? 0.05 : 0.16);
      if ((fi + fj) % 7 === 0) color = mixHex(color, "#ffffff", 0.08);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, fiber, fiber);
      ctx.fillStyle = "rgba(20, 16, 10, 0.12)";
      ctx.fillRect(x, y, 1, fiber);
      ctx.fillRect(x, y, fiber, 1);
    }
  }

  weaveCanvas = c;
  return c;
}

function fillFace(ctx, pathFn, overlay) {
  ctx.save();
  pathFn();
  ctx.clip();
  ctx.fillStyle = ctx.createPattern(getWeave(), "repeat");
  ctx.fillRect(0, 0, SIZE, SIZE);
  if (overlay) {
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, SIZE, SIZE);
  }
  ctx.restore();

  ctx.save();
  pathFn();
  ctx.strokeStyle = "rgba(18, 22, 32, 0.5)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function frontPath(ctx, f) {
  const r = 22;
  ctx.beginPath();
  ctx.moveTo(f.x, f.y);
  ctx.lineTo(f.x + f.w, f.y);
  ctx.lineTo(f.x + f.w, f.y + f.h - r);
  ctx.quadraticCurveTo(f.x + f.w, f.y + f.h, f.x + f.w - r, f.y + f.h);
  ctx.lineTo(f.x + r, f.y + f.h);
  ctx.quadraticCurveTo(f.x, f.y + f.h, f.x, f.y + f.h - r);
  ctx.closePath();
}

function topPath(ctx, f, dx, dy) {
  ctx.beginPath();
  ctx.moveTo(f.x, f.y);
  ctx.lineTo(f.x + f.w, f.y);
  ctx.lineTo(f.x + f.w + dx, f.y + dy);
  ctx.lineTo(f.x + dx, f.y + dy);
  ctx.closePath();
}

function sidePath(ctx, f, dx, dy) {
  const r = 22;
  ctx.beginPath();
  ctx.moveTo(f.x + f.w, f.y);
  ctx.lineTo(f.x + f.w + dx, f.y + dy);
  ctx.lineTo(f.x + f.w + dx, f.y + f.h - r + dy);
  ctx.lineTo(f.x + f.w, f.y + f.h - r);
  ctx.closePath();
}

function drawHandles(ctx, f, dx, dy) {
  const topY = f.y + dy * 0.38;
  const rise = 158;
  const pairs = [
    [f.x + 108 + dx * 0.38, f.x + 236 + dx * 0.38],
    [f.x + f.w - 236 + dx * 0.38, f.x + f.w - 108 + dx * 0.38],
  ];

  ctx.lineCap = "butt";
  ctx.lineJoin = "round";

  for (const [x1, x2] of pairs) {
    const mid = (x1 + x2) / 2;
    ctx.beginPath();
    ctx.moveTo(x1, topY + 18);
    ctx.bezierCurveTo(x1, topY - rise * 0.15, mid - 28, topY - rise, mid, topY - rise);
    ctx.bezierCurveTo(mid + 28, topY - rise, x2, topY - rise * 0.15, x2, topY + 18);
    ctx.strokeStyle = "#152033";
    ctx.lineWidth = 26;
    ctx.stroke();
    ctx.strokeStyle = "#24344f";
    ctx.lineWidth = 16;
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.lineWidth = 3;
    ctx.stroke();

    for (const x of [x1, x2]) {
      ctx.fillStyle = "#121826";
      ctx.beginPath();
      ctx.roundRect(x - 14, topY + 4, 28, 22, 4);
      ctx.fill();
    }
  }
}

function wrapPhrase(phrase) {
  const chars = charsOf(phrase);
  if (chars.length <= 6) return [chars.join("")];
  const mid = Math.ceil(chars.length / 2);
  return [chars.slice(0, mid).join(""), chars.slice(mid).join("")];
}

function drawPhrase(ctx, f, phrase) {
  const lines = wrapPhrase(phrase);
  const longest = Math.max(...lines.map((line) => charsOf(line).length), 1);
  const size = lines.length === 1
    ? longest <= 2
      ? 168
      : longest <= 4
        ? 128
        : 96
    : longest <= 4
      ? 86
      : 72;

  ctx.save();
  ctx.font = `800 ${size}px ${FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;

  const cx = f.x + f.w / 2;
  const cy = f.y + f.h / 2 + 8;
  const gap = size * 1.12;
  const startY = cy - ((lines.length - 1) * gap) / 2;

  lines.forEach((line, i) => {
    const y = startY + i * gap;
    ctx.lineWidth = Math.max(10, size * 0.11);
    ctx.strokeStyle = "#121826";
    ctx.strokeText(line, cx, y);
    ctx.fillStyle = "#f7f1de";
    ctx.fillText(line, cx, y);
  });
  ctx.restore();
}

function drawCaption(ctx) {
  ctx.save();
  ctx.fillStyle = "rgba(40, 34, 26, 0.1)";
  ctx.fillRect(0, 1008, SIZE, 72);
  ctx.font = `700 24px ${FONT_STACK}`;
  ctx.fillStyle = "#3a342c";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("迷因圖像 · 非寄運標籤／報關單／身分證明", SIZE / 2, 1044);
  ctx.restore();
}

export function drawBag(canvas, phrase) {
  const ctx = canvas.getContext("2d");
  const text = clipPhrase(phrase);

  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = "#d8d1c3";
  ctx.fillRect(0, 0, SIZE, SIZE);

  const f = { x: 168, y: 392, w: 560, h: 508 };
  const dx = 132;
  const dy = -136;

  ctx.save();
  ctx.fillStyle = "rgba(40, 28, 12, 0.22)";
  ctx.beginPath();
  ctx.ellipse(540, 930, 290, 36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  fillFace(ctx, () => sidePath(ctx, f, dx, dy), "rgba(8, 18, 36, 0.38)");
  fillFace(ctx, () => frontPath(ctx, f), "rgba(20, 12, 8, 0.03)");
  drawHandles(ctx, f, dx, dy);
  fillFace(ctx, () => topPath(ctx, f, dx, dy), "rgba(255, 250, 235, 0.18)");

  ctx.save();
  frontPath(ctx, f);
  ctx.strokeStyle = "#1a2740";
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "#1a2740";
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(f.x + 40 + dx * 0.5, f.y + dy * 0.48);
  ctx.lineTo(f.x + f.w - 40 + dx * 0.5, f.y + dy * 0.48);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  frontPath(ctx, f);
  ctx.clip();
  const shade = ctx.createLinearGradient(f.x, f.y, f.x + f.w, f.y + f.h);
  shade.addColorStop(0, "rgba(255,255,255,0.08)");
  shade.addColorStop(0.45, "rgba(0,0,0,0)");
  shade.addColorStop(1, "rgba(10,16,28,0.14)");
  ctx.fillStyle = shade;
  ctx.fillRect(f.x, f.y, f.w, f.h);
  ctx.restore();

  if (text) {
    drawPhrase(ctx, f, text);
  }

  drawCaption(ctx);
}

export function downloadPng(canvas, phrase) {
  const label = clipPhrase(phrase) || "金句";
  const safe = label.replace(/[\\/:*?"<>|]/g, "").slice(0, 12) || "金句";
  const name = `紅白藍金句袋-${safe}.png`;

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("無法產生 PNG"));
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      resolve(name);
    }, "image/png");
  });
}
