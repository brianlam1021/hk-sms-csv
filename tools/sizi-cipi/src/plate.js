const CJK_FONT =
  '"Noto Sans TC", "PingFang HK", "PingFang TC", "Hiragino Sans GB", "Microsoft JhengHei", "WenQuanYi Micro Hei", "Droid Sans Fallback", sans-serif';

const TILES_PER_CHAR = 12;
const CHAR_GAP = 1;
const MARGIN_X = 2;
const MARGIN_Y = 2;

export function graphemes(text) {
  const trimmed = String(text ?? "").replace(/\s+/g, "");
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    return [...new Intl.Segmenter("zh", { granularity: "grapheme" }).segment(trimmed)].map(
      (part) => part.segment,
    );
  }
  return Array.from(trimmed);
}

export function normalizePhrase(raw) {
  return graphemes(raw).slice(0, 4).join("");
}

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2(x, y, seed) {
  let n = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ seed;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

function fade(t) {
  return t * t * (3 - 2 * t);
}

function valueNoise(x, y, seed) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = fade(x - x0);
  const fy = fade(y - y0);
  const a = hash2(x0, y0, seed);
  const b = hash2(x0 + 1, y0, seed);
  const c = hash2(x0, y0 + 1, seed);
  const d = hash2(x0 + 1, y0 + 1, seed);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

function fbm(x, y, seed, octaves = 4) {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i += 1) {
    value += amp * valueNoise(x * freq, y * freq, seed + i * 97);
    amp *= 0.5;
    freq *= 2;
  }
  return value;
}

function rgb(r, g, b, a = 1) {
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
}

function sampleGlyph(char, cols, rows) {
  const size = 320;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${Math.floor(size * 0.76)}px ${CJK_FONT}`;
  const cx = size / 2;
  const cy = size / 2 + size * 0.02;
  ctx.fillText(char, cx, cy);

  const pixels = ctx.getImageData(0, 0, size, size).data;
  const grid = [];
  for (let row = 0; row < rows; row += 1) {
    grid[row] = [];
    for (let col = 0; col < cols; col += 1) {
      const x0 = Math.floor((col * size) / cols);
      const y0 = Math.floor((row * size) / rows);
      const x1 = Math.floor(((col + 1) * size) / cols);
      const y1 = Math.floor(((row + 1) * size) / rows);
      let ink = 0;
      let count = 0;
      for (let y = y0; y < y1; y += 2) {
        for (let x = x0; x < x1; x += 2) {
          ink += pixels[(y * size + x) * 4 + 3];
          count += 1;
        }
      }
      grid[row][col] = count > 0 ? ink / count / 255 : 0;
    }
  }
  return grid;
}

function buildOccupancy(chars) {
  const empty = chars.length === 0;
  const count = empty ? 1 : chars.length;
  const cols = MARGIN_X * 2 + count * TILES_PER_CHAR + Math.max(0, count - 1) * CHAR_GAP;
  const rows = MARGIN_Y * 2 + TILES_PER_CHAR;
  const grid = Array.from({ length: rows }, () => Array(cols).fill("field"));

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (x === 0 || y === 0 || x === cols - 1 || y === rows - 1) {
        grid[y][x] = "border";
      }
    }
  }

  if (!empty) {
    chars.forEach((char, index) => {
      const glyph = sampleGlyph(char, TILES_PER_CHAR, TILES_PER_CHAR);
      const ox = MARGIN_X + index * (TILES_PER_CHAR + CHAR_GAP);
      const oy = MARGIN_Y;
      for (let y = 0; y < TILES_PER_CHAR; y += 1) {
        for (let x = 0; x < TILES_PER_CHAR; x += 1) {
          const cover = glyph[y][x];
          if (cover > 0.38) grid[oy + y][ox + x] = "ink";
          else if (cover > 0.16) grid[oy + y][ox + x] = "edge";
        }
      }
    });
  }

  return { grid, cols, rows, empty };
}

function tileColor(kind, rng) {
  if (kind === "ink") {
    return [124 + rng() * 38, 32 + rng() * 18, 24 + rng() * 12];
  }
  if (kind === "edge") {
    return [156 + rng() * 28, 78 + rng() * 22, 58 + rng() * 16];
  }
  if (kind === "border") {
    return [62 + rng() * 16, 66 + rng() * 14, 58 + rng() * 12];
  }
  const aged = rng() * rng();
  return [
    208 + rng() * 22 - aged * 24,
    196 + rng() * 16 - aged * 26,
    170 + rng() * 14 - aged * 30,
  ];
}

function paintConcrete(ctx, width, height, seed, tint) {
  const tw = Math.max(90, Math.round(width / 8));
  const th = Math.max(60, Math.round(height / 8));
  const paper = document.createElement("canvas");
  paper.width = tw;
  paper.height = th;
  const pctx = paper.getContext("2d");
  const image = pctx.createImageData(tw, th);
  const data = image.data;
  for (let y = 0; y < th; y += 1) {
    for (let x = 0; x < tw; x += 1) {
      const n = fbm(x / 14, y / 14, seed, 4);
      const grit = hash2(x, y, seed + 3);
      const i = (y * tw + x) * 4;
      const speck = grit > 0.97 ? -38 : grit < 0.03 ? 22 : 0;
      data[i] = tint[0] + (n - 0.5) * 38 + speck;
      data[i + 1] = tint[1] + (n - 0.5) * 32 + speck;
      data[i + 2] = tint[2] + (n - 0.5) * 26 + speck;
      data[i + 3] = 255;
    }
  }
  pctx.putImageData(image, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(paper, 0, 0, width, height);
}

function washStains(ctx, rng, width, height) {
  for (let i = 0; i < 14; i += 1) {
    const x = rng() * width;
    const y = rng() * height * 0.7;
    ctx.fillStyle = rgb(48, 40, 30, 0.045 + rng() * 0.07);
    ctx.beginPath();
    ctx.ellipse(x, y, 30 + rng() * 90, 50 + rng() * 180, rng() * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  const streaks = 5 + Math.floor(rng() * 5);
  for (let i = 0; i < streaks; i += 1) {
    const x = rng() * width;
    ctx.strokeStyle = rgb(40, 34, 26, 0.07 + rng() * 0.08);
    ctx.lineWidth = 2 + rng() * 4;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    let px = x;
    let py = 0;
    while (py < height) {
      py += 16 + rng() * 22;
      px += (rng() - 0.5) * 5;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
}

function roundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawBolt(ctx, x, y, radius, rng) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = rgb(20, 14, 10, 0.32);
  ctx.beginPath();
  ctx.ellipse(1.6, 2.4, radius * 1.2, radius * 0.72, 0.15, 0, Math.PI * 2);
  ctx.fill();

  const rust = rng() > 0.25;
  const g = ctx.createRadialGradient(-radius * 0.25, -radius * 0.3, 1, 0, 0, radius);
  if (rust) {
    g.addColorStop(0, rgb(168, 92, 42));
    g.addColorStop(0.55, rgb(110, 52, 28));
    g.addColorStop(1, rgb(52, 28, 16));
  } else {
    g.addColorStop(0, rgb(150, 146, 138));
    g.addColorStop(1, rgb(72, 68, 62));
  }
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = rgb(24, 18, 12, 0.5);
  ctx.lineWidth = 1.1;
  ctx.stroke();
  ctx.rotate((rng() - 0.5) * 0.8);
  ctx.strokeStyle = rgb(20, 14, 10, 0.75);
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.moveTo(-radius * 0.52, 0);
  ctx.lineTo(radius * 0.52, 0);
  ctx.stroke();
  ctx.restore();
}

function drawFlatTile(ctx, x, y, size, kind, rng) {
  const j = 0.9;
  const [r, g, b] = tileColor(kind, rng);
  ctx.beginPath();
  ctx.moveTo(x + rng() * j, y + rng() * j);
  ctx.lineTo(x + size - rng() * j, y + rng() * j);
  ctx.lineTo(x + size - rng() * j, y + size - rng() * j);
  ctx.lineTo(x + rng() * j, y + size - rng() * j);
  ctx.closePath();
  ctx.fillStyle = rgb(r, g, b);
  ctx.fill();

  if (rng() > 0.2) {
    ctx.fillStyle = rgb(r + 16, g + 12, b + 8, 0.16 + rng() * 0.14);
    ctx.fillRect(x + rng() * size * 0.35, y + rng() * size * 0.35, size * 0.4, size * 0.3);
  }

  if (rng() < 0.14) {
    ctx.fillStyle = rgb(40, 34, 24, 0.14);
    ctx.beginPath();
    ctx.arc(x + rng() * size, y + rng() * size, 0.4 + rng() * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  if (rng() < 0.2) {
    ctx.fillStyle = rgb(70, 76, 48, 0.08);
    ctx.fillRect(x, y + size * 0.7, size, size * 0.3);
  }
}

function crack(ctx, rng, x, y, w, h) {
  if (rng() > 0.7) return;
  ctx.strokeStyle = rgb(28, 24, 18, 0.28);
  ctx.lineWidth = 1;
  ctx.beginPath();
  let px = x + rng() * w;
  let py = y + rng() * 12;
  ctx.moveTo(px, py);
  const steps = 4 + Math.floor(rng() * 4);
  for (let i = 0; i < steps; i += 1) {
    px += (rng() - 0.45) * 28;
    py += 8 + rng() * 16;
    ctx.lineTo(px, Math.min(y + h - 4, py));
  }
  ctx.stroke();
}

function stampFiction(ctx, x, y, size) {
  ctx.save();
  ctx.font = `700 ${size}px ${CJK_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = rgb(36, 30, 24, 0.42);
  ctx.fillText("虛構 · 不可作地址", x + 0.8, y + 0.8);
  ctx.fillStyle = rgb(210, 198, 176, 0.22);
  ctx.fillText("虛構 · 不可作地址", x - 0.6, y - 0.6);
  ctx.fillStyle = rgb(52, 44, 34, 0.7);
  ctx.fillText("虛構 · 不可作地址", x, y);
  ctx.restore();
}

export function renderPlate(canvas, phrase) {
  const text = normalizePhrase(phrase);
  const chars = graphemes(text);
  const seed = hashString(text || "empty-plate");
  const rng = mulberry32(seed);
  const { grid, cols, rows, empty } = buildOccupancy(chars);

  const tile = 22;
  const grout = 1.5;
  const cell = tile + grout;
  const frameX = 78;
  const frameTop = 64;
  const frameBottom = 86;
  const wallX = 86;
  const wallTop = 78;
  const wallBottom = 96;
  const fieldW = cols * cell + grout;
  const fieldH = rows * cell + grout;
  const slabW = fieldW + frameX * 2;
  const slabH = fieldH + frameTop + frameBottom;
  const depth = 16;
  const width = slabW + wallX * 2 + depth;
  const height = slabH + wallTop + wallBottom + depth;

  const work = document.createElement("canvas");
  work.width = width;
  work.height = height;
  const ctx = work.getContext("2d");
  ctx.clearRect(0, 0, width, height);

  paintConcrete(ctx, width, height, seed, [154, 140, 118]);
  washStains(ctx, rng, width, height);
  ctx.strokeStyle = rgb(40, 34, 26, 0.08);
  ctx.lineWidth = 2;
  for (let y = 36; y < height; y += 46) {
    ctx.beginPath();
    ctx.moveTo(0, y + Math.sin(y) * 2);
    ctx.lineTo(width, y + 6);
    ctx.stroke();
  }

  const slabX = wallX;
  const slabY = wallTop;
  const tilt = (rng() - 0.5) * 0.55;

  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate((tilt * Math.PI) / 180);
  ctx.translate(-width / 2, -height / 2);

  ctx.fillStyle = rgb(16, 12, 8, 0.4);
  ctx.beginPath();
  ctx.rect(slabX + 12, slabY + 20, slabW, slabH);
  ctx.fill();

  ctx.fillStyle = rgb(88, 78, 64);
  ctx.beginPath();
  ctx.moveTo(slabX + slabW, slabY + 6);
  ctx.lineTo(slabX + slabW + depth, slabY + 6 + depth * 0.7);
  ctx.lineTo(slabX + slabW + depth, slabY + slabH + depth * 0.7);
  ctx.lineTo(slabX + slabW, slabY + slabH);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = rgb(74, 66, 54);
  ctx.beginPath();
  ctx.moveTo(slabX + 6, slabY + slabH);
  ctx.lineTo(slabX + slabW, slabY + slabH);
  ctx.lineTo(slabX + slabW + depth, slabY + slabH + depth * 0.7);
  ctx.lineTo(slabX + 6 + depth * 0.3, slabY + slabH + depth * 0.7);
  ctx.closePath();
  ctx.fill();

  roundedRect(ctx, slabX, slabY, slabW, slabH, 5);
  ctx.save();
  ctx.clip();
  paintConcrete(ctx, width, height, seed + 17, [138, 126, 106]);
  washStains(ctx, rng, width, height);
  for (let i = 0; i < 40; i += 1) {
    ctx.fillStyle = rgb(90 + rng() * 50, 82 + rng() * 40, 68 + rng() * 30, 0.35);
    ctx.beginPath();
    ctx.ellipse(
      slabX + rng() * slabW,
      slabY + rng() * slabH,
      1 + rng() * 2.2,
      0.8 + rng() * 1.6,
      rng() * 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  const lip = ctx.createLinearGradient(slabX, slabY, slabX + slabW * 0.3, slabY + slabH);
  lip.addColorStop(0, rgb(230, 218, 192, 0.18));
  lip.addColorStop(0.2, rgb(230, 218, 192, 0));
  lip.addColorStop(0.75, rgb(20, 16, 12, 0));
  lip.addColorStop(1, rgb(20, 16, 12, 0.2));
  ctx.fillStyle = lip;
  ctx.fillRect(slabX, slabY, slabW, slabH);
  crack(ctx, rng, slabX + 10, slabY + 8, slabW * 0.3, slabH * 0.45);
  crack(ctx, rng, slabX + slabW * 0.65, slabY + slabH * 0.4, slabW * 0.3, slabH * 0.5);
  ctx.restore();

  ctx.strokeStyle = rgb(46, 40, 32, 0.45);
  ctx.lineWidth = 2;
  roundedRect(ctx, slabX + 1, slabY + 1, slabW - 2, slabH - 2, 5);
  ctx.stroke();

  const fieldX = slabX + frameX;
  const fieldY = slabY + frameTop;

  ctx.fillStyle = rgb(20, 16, 12, 0.28);
  ctx.fillRect(fieldX - 5, fieldY - 3, fieldW + 10, fieldH + 10);

  ctx.fillStyle = rgb(168, 158, 138);
  ctx.fillRect(fieldX - 3, fieldY - 3, fieldW + 6, fieldH + 6);

  const bed = ctx.createLinearGradient(fieldX, fieldY, fieldX, fieldY + fieldH);
  bed.addColorStop(0, rgb(176, 166, 146));
  bed.addColorStop(1, rgb(150, 140, 122));
  ctx.fillStyle = bed;
  ctx.fillRect(fieldX, fieldY, fieldW, fieldH);

  for (let i = 0; i < 70; i += 1) {
    ctx.fillStyle = rgb(40, 36, 28, 0.12);
    ctx.fillRect(fieldX + rng() * fieldW, fieldY + rng() * fieldH, 1.2, 1.2);
  }

  if (!empty) {
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = fieldX + grout + col * cell;
        const y = fieldY + grout + row * cell;
        drawFlatTile(ctx, x, y, tile, grid[row][col], rng);
      }
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(fieldX, fieldY, fieldW, fieldH);
    ctx.clip();
    const light = ctx.createLinearGradient(fieldX, fieldY, fieldX + fieldW, fieldY + fieldH);
    light.addColorStop(0, rgb(255, 244, 220, 0.16));
    light.addColorStop(0.45, rgb(255, 244, 220, 0));
    light.addColorStop(1, rgb(20, 12, 8, 0.16));
    ctx.fillStyle = light;
    ctx.fillRect(fieldX, fieldY, fieldW, fieldH);
    for (let i = 0; i < 8; i += 1) {
      ctx.fillStyle = rgb(50, 42, 30, 0.035 + rng() * 0.04);
      ctx.beginPath();
      ctx.ellipse(
        fieldX + rng() * fieldW,
        fieldY + rng() * fieldH,
        20 + rng() * 70,
        12 + rng() * 30,
        rng() * Math.PI,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.fillStyle = rgb(40, 34, 24, 0.08);
    ctx.fillRect(fieldX, fieldY + fieldH * 0.72, fieldW, fieldH * 0.28);
    ctx.restore();
  } else {
    ctx.fillStyle = rgb(126, 116, 98);
    ctx.fillRect(fieldX, fieldY, fieldW, fieldH);
    washStains(ctx, rng, width, height);
    ctx.fillStyle = rgb(20, 14, 10, 0.16);
    ctx.fillRect(fieldX, fieldY, fieldW, 10);
    ctx.fillRect(fieldX, fieldY, 10, fieldH);
    ctx.fillStyle = rgb(210, 198, 176, 0.08);
    ctx.fillRect(fieldX + 8, fieldY + fieldH - 12, fieldW - 16, 8);
  }

  ctx.fillStyle = rgb(18, 14, 10, 0.12);
  ctx.fillRect(fieldX, fieldY, fieldW, 4);
  ctx.fillStyle = rgb(18, 14, 10, 0.08);
  ctx.fillRect(fieldX, fieldY, 3, fieldH);

  const boltR = 8;
  drawBolt(ctx, slabX + 26, slabY + 24, boltR, rng);
  drawBolt(ctx, slabX + slabW - 26, slabY + 24, boltR, rng);
  drawBolt(ctx, slabX + 26, slabY + slabH - 26, boltR, rng);
  drawBolt(ctx, slabX + slabW - 26, slabY + slabH - 26, boltR, rng);

  stampFiction(ctx, slabX + slabW / 2, slabY + slabH - 32, Math.max(16, Math.round(width * 0.022)));

  ctx.restore();

  const shade = ctx.createRadialGradient(
    width * 0.5,
    height * 0.42,
    width * 0.18,
    width * 0.5,
    height * 0.5,
    width * 0.7,
  );
  shade.addColorStop(0, rgb(0, 0, 0, 0));
  shade.addColorStop(1, rgb(20, 14, 8, 0.16));
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, width, height);

  const maxW = 1180;
  const scale = Math.min(1, maxW / width);
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const out = canvas.getContext("2d");
  out.imageSmoothingEnabled = true;
  out.imageSmoothingQuality = "high";
  out.drawImage(work, 0, 0, canvas.width, canvas.height);

  return { empty, text, width: canvas.width, height: canvas.height };
}

export async function plateToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("無法產生圖片"));
    }, "image/png");
  });
}
