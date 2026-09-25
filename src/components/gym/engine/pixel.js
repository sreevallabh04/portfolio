/**
 * Low-level pixel-art helpers. Everything in the game is drawn at native
 * resolution (16 px tiles) onto small canvases and scaled up with
 * `image-rendering: pixelated`, so every helper here works in whole pixels.
 */

export const TILE = 16;

export function makeCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.ceil(width));
  canvas.height = Math.max(1, Math.ceil(height));
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return [canvas, ctx];
}

/** Paint helpers bound to a context. */
export function painter(ctx) {
  const api = {
    ctx,
    r(x, y, w, h, color) {
      if (w <= 0 || h <= 0) return api;
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
      return api;
    },
    p(x, y, color) {
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
      return api;
    },
    h(x, y, w, color) {
      return api.r(x, y, w, 1, color);
    },
    v(x, y, h, color) {
      return api.r(x, y, 1, h, color);
    },
    /** A block with a lit top edge and a shaded bottom edge. */
    block(x, y, w, h, base, light, dark) {
      api.r(x, y, w, h, base);
      if (light) api.h(x, y, w, light);
      if (dark) api.h(x, y + h - 1, w, dark);
      return api;
    },
    /** Rounded rectangle, 1px corners knocked out. */
    pill(x, y, w, h, color) {
      api.r(x + 1, y, w - 2, h, color);
      api.r(x, y + 1, w, h - 2, color);
      return api;
    },
    ellipse(cx, cy, rx, ry, color) {
      ctx.fillStyle = color;
      for (let yy = -ry; yy <= ry; yy++) {
        const half = Math.round(rx * Math.sqrt(Math.max(0, 1 - (yy * yy) / (ry * ry || 1))));
        ctx.fillRect(Math.round(cx - half), Math.round(cy + yy), half * 2, 1);
      }
      return api;
    },
    line(x0, y0, x1, y1, color) {
      // Bresenham, so diagonals stay one pixel wide.
      let x = Math.round(x0);
      let y = Math.round(y0);
      const tx = Math.round(x1);
      const ty = Math.round(y1);
      const dx = Math.abs(tx - x);
      const dy = -Math.abs(ty - y);
      const sx = x < tx ? 1 : -1;
      const sy = y < ty ? 1 : -1;
      let err = dx + dy;
      ctx.fillStyle = color;
      for (;;) {
        ctx.fillRect(x, y, 1, 1);
        if (x === tx && y === ty) break;
        const e2 = 2 * err;
        if (e2 >= dy) {
          err += dy;
          x += sx;
        }
        if (e2 <= dx) {
          err += dx;
          y += sy;
        }
      }
      return api;
    },
  };
  return api;
}

const parseHex = (hex) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
};

/**
 * Adds a one-pixel outline around every opaque pixel. Sprites are authored
 * without outlines and get them here, which keeps the line weight identical
 * across every character and machine.
 */
export function outline(source, color = '#0b0c10', { diagonal = false } = {}) {
  const w = source.width;
  const h = source.height;
  const [out, ctx] = makeCanvas(w, h);
  ctx.drawImage(source, 0, 0);
  const img = ctx.getImageData(0, 0, w, h);
  const data = img.data;
  const alpha = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) alpha[i] = data[i * 4 + 3] > 40 ? 1 : 0;
  const [r, g, b] = parseHex(color);
  const offsets = diagonal
    ? [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]
    : [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (alpha[y * w + x]) continue;
      let edge = false;
      for (const [dx, dy] of offsets) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < w && ny < h && alpha[ny * w + nx]) {
          edge = true;
          break;
        }
      }
      if (edge) {
        const i = (y * w + x) * 4;
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
        data[i + 3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  return out;
}

/** Renders rows of palette characters ('.' = transparent) to a canvas. */
export function fromRows(rows, palette, { width } = {}) {
  const w = width || Math.max(...rows.map((row) => row.length));
  const [canvas, ctx] = makeCanvas(w, rows.length);
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const key = row[x];
      if (key === '.' || key === ' ') continue;
      const color = palette[key];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  });
  return canvas;
}

export function flipX(source) {
  const [out, ctx] = makeCanvas(source.width, source.height);
  ctx.translate(source.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(source, 0, 0);
  return out;
}

/** Tints every opaque pixel to a flat colour (hit flashes, silhouettes). */
export function silhouette(source, color) {
  const [out, ctx] = makeCanvas(source.width, source.height);
  ctx.drawImage(source, 0, 0);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, source.width, source.height);
  return out;
}

/** Deterministic PRNG so floor speckle and decor are identical every load. */
export function rng(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

export const shade = (hex, amount) => {
  const [r, g, b] = parseHex(hex);
  const f = (c) => Math.max(0, Math.min(255, Math.round(amount < 0 ? c * (1 + amount) : c + (255 - c) * amount)));
  return `#${[f(r), f(g), f(b)].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
};

export const withAlpha = (hex, alpha) => {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r},${g},${b},${alpha})`;
};
