/**
 * Gym equipment and decor, drawn procedurally in 3/4 top-down view at native
 * resolution. Each builder returns { canvas, ox, oy }: the canvas is placed at
 * (footprint.x * 16 + ox, footprint.y * 16 + oy), so its bottom edge sits on
 * the bottom of the footprint and its top overhangs the tiles behind it.
 */
import { makeCanvas, painter, outline, TILE, rng } from './pixel';
import { drawText } from './font';

export const C = {
  frame: '#2a2e39', frameHi: '#434a5a', frameLo: '#171920',
  steel: '#8f98ab', steelHi: '#cfd6e3', steelLo: '#58606f',
  chrome: '#c3cad6', chromeHi: '#f3f6fa', chromeLo: '#7a8293',
  pad: '#c61d29', padHi: '#ee4a55', padLo: '#7a0f17',
  stack: '#4b5160', stackHi: '#737a8b', stackLo: '#2f333d',
  wood: '#8c5a32', woodHi: '#b0763f', woodLo: '#654024',
  white: '#e7eaf0', whiteLo: '#a9aebb',
  cable: '#aeb5c2',
  neonRed: '#ff3b4c', neonCyan: '#35e1ff',
};

export const PLATE_COLORS = {
  25: ['#d41f2b', '#ff5a64', '#8c121a'],
  20: ['#2d5fe0', '#6690ff', '#1b3a92'],
  15: ['#e2b021', '#ffd96a', '#95710f'],
  10: ['#2d9c51', '#62d487', '#1a6332'],
  5: ['#e6e7ec', '#ffffff', '#9ea3b0'],
  2.5: ['#2b2d35', '#515662', '#16171b'],
  1.25: ['#b6bdc9', '#e6eaf0', '#79808f'],
};

// Edge-on plate size in the overworld: [thickness, height].
const PLATE_DIMS = { 25: [3, 13], 20: [3, 13], 15: [2, 11], 10: [2, 9], 5: [2, 7], 2.5: [1, 6], 1.25: [1, 5] };

/** Creates a sprite with a 1px margin so the automatic outline has room. */
function sprite(w, h, draw, { outlineColor = '#0b0c10' } = {}) {
  const [canvas, ctx] = makeCanvas(w + 2, h + 2);
  ctx.translate(1, 1);
  draw(painter(ctx), ctx);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return outlineColor ? outline(canvas, outlineColor) : canvas;
}

/** Anchors a sprite of drawn size w×h on a footprint of fw×fh tiles. */
function place(canvas, w, h, fw, fh, { dx = 0, dy = 0 } = {}) {
  return {
    canvas,
    ox: Math.round((fw * TILE - w) / 2) - 1 + dx,
    oy: fh * TILE - h - 1 + dy,
  };
}

/** Plates stacked outward from a collar; dir -1 = to the left. */
export function drawPlates(p, collarX, cy, plates, dir, dims = PLATE_DIMS) {
  let x = collarX;
  for (const kg of plates) {
    const [w, h] = dims[kg] || [2, 8];
    const [base, hi, lo] = PLATE_COLORS[kg] || PLATE_COLORS[5];
    const left = dir < 0 ? x - w : x;
    const top = Math.round(cy - h / 2);
    p.r(left, top + 1, w, h - 2, base);
    p.r(left, top, w, 1, base);
    p.r(left, top + h - 1, w, 1, lo);
    if (w >= 2) p.v(left + (dir < 0 ? 0 : w - 1), top + 1, h - 3, hi);
    else p.v(left, top + 1, 2, hi);
    x += dir * (w + 1);
  }
  return x;
}

function upright(p, x, y, w, h) {
  p.r(x, y, w, h, C.frame);
  p.v(x, y, h, C.frameHi);
  p.v(x + w - 1, y, h, C.frameLo);
  for (let yy = y + 3; yy < y + h - 2; yy += 4) p.p(x + Math.floor(w / 2), yy, C.frameLo);
}

function bar(p, x0, x1, y) {
  p.r(x0, y, x1 - x0, 2, C.chrome);
  p.h(x0, y, x1 - x0, C.chromeHi);
}

function stackColumn(p, x, y, w, h, { pin = 0.45 } = {}) {
  p.r(x, y, w, h, C.frame);
  p.v(x, y, h, C.frameHi);
  const inner = x + 2;
  const innerW = w - 4;
  p.r(inner, y + 2, innerW, h - 4, C.frameLo);
  const plates = Math.floor((h - 6) / 3);
  for (let i = 0; i < plates; i++) {
    const py = y + h - 4 - i * 3 - 2;
    p.r(inner, py, innerW, 2, C.stack);
    p.h(inner, py, innerW, C.stackHi);
  }
  p.v(x + Math.floor(w / 2), y + 2, h - 4, C.chromeLo);
  const pinY = y + h - 4 - Math.floor(plates * pin) * 3 - 1;
  p.r(inner + innerW, pinY, 2, 1, C.neonRed);
}

function pad(p, x, y, w, h, face = 2) {
  p.pill(x, y, w, h, C.pad);
  p.h(x + 1, y, w - 2, C.padHi);
  p.v(x, y + 1, h - face - 1, C.padHi);
  p.r(x + 1, y + h - face, w - 2, face, C.padLo);
}

/* ------------------------------------------------------------ stations */

export function squatRack(plates = [25]) {
  const w = 58;
  const h = 58;
  return place(
    sprite(w, h, (p) => {
      // back posts and crossbar
      upright(p, 13, 3, 3, 42);
      upright(p, 42, 3, 3, 42);
      p.r(13, 3, 32, 3, C.frame);
      p.h(13, 3, 32, C.frameHi);
      // side rails linking back to front
      p.line(14, 5, 10, 10, C.frameHi);
      p.line(44, 5, 48, 10, C.frameHi);
      // safeties
      p.r(12, 40, 6, 2, C.steel);
      p.r(40, 40, 6, 2, C.steel);
      // front posts
      upright(p, 8, 10, 4, 46);
      upright(p, 46, 10, 4, 46);
      bar(p, 8, 50, 10);
      // J-hooks
      p.r(12, 25, 2, 3, C.steel);
      p.r(44, 25, 2, 3, C.steel);
      // loaded bar
      bar(p, 0, 58, 24);
      for (let x = 18; x < 40; x += 3) p.p(x, 25, C.chromeLo);
      p.r(6, 23, 1, 4, C.steelLo);
      p.r(51, 23, 1, 4, C.steelLo);
      drawPlates(p, 6, 25, plates, -1);
      drawPlates(p, 52, 25, plates, 1);
      // base
      p.r(6, 54, 46, 3, C.frameLo);
      p.h(6, 54, 46, C.frame);
    }),
    w,
    h,
    3,
    2
  );
}

export function flatBench(plates = [25, 10]) {
  const w = 60;
  const h = 40;
  return place(
    sprite(w, h, (p) => {
      p.r(12, 17, 36, 3, C.frameLo);
      p.h(12, 17, 36, C.frame);
      upright(p, 16, 1, 3, 18);
      upright(p, 41, 1, 3, 18);
      p.r(19, 5, 2, 2, C.steel);
      p.r(39, 5, 2, 2, C.steel);
      bar(p, 0, 60, 4);
      for (let x = 22; x < 38; x += 3) p.p(x, 5, C.chromeLo);
      p.r(8, 3, 1, 4, C.steelLo);
      p.r(51, 3, 1, 4, C.steelLo);
      drawPlates(p, 8, 5, plates, -1);
      drawPlates(p, 52, 5, plates, 1);
      // pad and frame
      p.r(27, 32, 6, 4, C.frame);
      p.r(21, 36, 18, 2, C.frameLo);
      p.r(26, 13, 8, 3, C.frame);
      pad(p, 24, 11, 12, 23, 3);
    }),
    w,
    h,
    3,
    2
  );
}

export function smithMachine(plates = [25]) {
  const w = 58;
  const h = 60;
  return place(
    sprite(w, h, (p) => {
      upright(p, 12, 2, 3, 46);
      upright(p, 43, 2, 3, 46);
      p.r(12, 2, 34, 3, C.frame);
      p.line(13, 4, 9, 8, C.frameHi);
      p.line(45, 4, 49, 8, C.frameHi);
      // incline bench inside
      p.r(26, 50, 6, 4, C.frame);
      pad(p, 23, 30, 12, 13, 2);
      pad(p, 23, 43, 12, 8, 2);
      upright(p, 7, 8, 4, 50);
      upright(p, 47, 8, 4, 50);
      p.r(7, 8, 44, 3, C.frame);
      p.h(7, 8, 44, C.frameHi);
      // guide rods
      p.r(15, 10, 2, 44, C.chrome);
      p.v(15, 10, 44, C.chromeHi);
      p.r(41, 10, 2, 44, C.chrome);
      p.v(41, 10, 44, C.chromeHi);
      // carriage + bar
      p.r(13, 20, 6, 4, C.steelLo);
      p.r(39, 20, 6, 4, C.steelLo);
      bar(p, 0, 58, 21);
      p.r(5, 20, 1, 4, C.steelLo);
      p.r(52, 20, 1, 4, C.steelLo);
      drawPlates(p, 5, 22, plates, -1);
      drawPlates(p, 53, 22, plates, 1);
      p.r(5, 56, 48, 3, C.frameLo);
      p.h(5, 56, 48, C.frame);
    }),
    w,
    h,
    3,
    2
  );
}

export function legPress(plates = [25, 25]) {
  const w = 52;
  const h = 46;
  return place(
    sprite(w, h, (p) => {
      p.r(3, 40, 46, 4, C.frameLo);
      p.h(3, 40, 46, C.frame);
      // rails
      for (let i = 0; i < 2; i++) {
        p.line(16 + i * 7, 40, 34 + i * 7, 6, C.steel);
        p.line(17 + i * 7, 40, 35 + i * 7, 6, C.steelHi);
      }
      // seat
      p.r(8, 34, 12, 6, C.frame);
      pad(p, 3, 20, 10, 16, 2);
      pad(p, 9, 31, 13, 6, 2);
      // sled + footplate
      p.r(30, 4, 17, 13, C.steel);
      p.h(30, 4, 17, C.steelHi);
      p.r(30, 15, 17, 2, C.steelLo);
      for (let x = 32; x < 46; x += 3) for (let y = 6; y < 14; y += 3) p.p(x, y, C.steelLo);
      // plate horns
      p.r(27, 9, 3, 2, C.steelLo);
      p.r(47, 9, 3, 2, C.steelLo);
      drawPlates(p, 27, 10, plates.slice(0, 2), -1);
      drawPlates(p, 48, 10, plates.slice(0, 1), 1);
    }),
    w,
    h,
    3,
    2,
    { dx: 1 }
  );
}

export function hackSquat(plates = [25]) {
  const w = 38;
  const h = 52;
  return place(
    sprite(w, h, (p) => {
      p.r(3, 47, 32, 4, C.frameLo);
      p.h(3, 47, 32, C.frame);
      p.r(8, 4, 3, 44, C.steel);
      p.v(8, 4, 44, C.steelHi);
      p.r(27, 4, 3, 44, C.steel);
      p.v(27, 4, 44, C.steelHi);
      p.r(8, 3, 22, 3, C.frame);
      pad(p, 12, 14, 14, 24, 2);
      pad(p, 10, 9, 6, 6, 2);
      pad(p, 22, 9, 6, 6, 2);
      // handles
      p.r(8, 12, 2, 4, C.chrome);
      p.r(28, 12, 2, 4, C.chrome);
      // footplate
      p.r(7, 40, 24, 6, C.steel);
      p.h(7, 40, 24, C.steelHi);
      for (let x = 9; x < 30; x += 3) p.p(x, 42, C.steelLo);
      p.r(4, 22, 4, 2, C.steelLo);
      p.r(30, 22, 4, 2, C.steelLo);
      drawPlates(p, 5, 23, plates, -1);
      drawPlates(p, 33, 23, plates, 1);
    }),
    w,
    h,
    2,
    2
  );
}

export function legMachine() {
  const w = 32;
  const h = 46;
  return place(
    sprite(w, h, (p) => {
      stackColumn(p, 18, 1, 12, 38, { pin: 0.6 });
      p.r(20, 0, 8, 2, C.frame);
      p.r(1, 41, 30, 4, C.frameLo);
      p.h(1, 41, 30, C.frame);
      p.r(8, 33, 4, 8, C.frame);
      pad(p, 11, 14, 7, 18, 2);
      pad(p, 3, 27, 16, 7, 2);
      // shin roller
      p.r(1, 36, 12, 4, C.pad);
      p.h(1, 36, 12, C.padHi);
      p.h(1, 39, 12, C.padLo);
      p.r(6, 34, 2, 2, C.steel);
    }),
    w,
    h,
    2,
    2
  );
}

export function calfRaise(plates = [25]) {
  const w = 34;
  const h = 34;
  return place(
    sprite(w, h, (p) => {
      p.r(2, 29, 30, 4, C.frameLo);
      p.h(2, 29, 30, C.frame);
      p.r(8, 22, 4, 7, C.frame);
      pad(p, 3, 18, 13, 6, 2);
      // lever + knee pad
      p.line(14, 13, 28, 17, C.steel);
      p.line(14, 14, 28, 18, C.steelHi);
      pad(p, 12, 9, 13, 5, 2);
      p.r(26, 15, 5, 2, C.steelLo);
      drawPlates(p, 30, 15, plates, 1);
      p.r(15, 25, 11, 3, C.steel);
      p.h(15, 25, 11, C.steelHi);
    }),
    w,
    h,
    2,
    2
  );
}

export function dumbbellRack() {
  const w = 80;
  const h = 30;
  return place(
    sprite(w, h, (p) => {
      for (const x of [1, 39, 77]) {
        p.r(x, 10, 2, 19, C.frame);
        p.v(x, 10, 19, C.frameHi);
      }
      const dumbbell = (x, baseY, size) => {
        const headW = size > 3 ? 4 : 3;
        const headH = 5 + size;
        const top = baseY - headH;
        const head = (hx) => {
          p.r(hx, top, headW, headH, '#2c3039');
          p.h(hx, top, headW, '#626978');
          p.v(hx, top + 1, headH - 2, '#474d5a');
          p.h(hx, top + headH - 1, headW, '#1b1d23');
        };
        head(x);
        const hy = baseY - Math.ceil(headH / 2) - 1;
        p.r(x + headW, hy, 3, 2, C.chrome);
        p.h(x + headW, hy, 3, C.chromeHi);
        head(x + headW + 3);
        return x + headW * 2 + 3 + 1;
      };
      let x = 2;
      for (const size of [0, 0, 1, 1, 2, 2, 3]) x = dumbbell(x, 11, size);
      p.r(0, 11, 80, 3, C.frame);
      p.h(0, 11, 80, C.frameHi);
      x = 3;
      for (const size of [3, 4, 4, 5, 5, 6]) x = dumbbell(x, 24, size);
      p.r(0, 24, 80, 3, C.frame);
      p.h(0, 24, 80, C.frameHi);
      p.h(0, 26, 80, C.frameLo);
    }),
    w,
    h,
    5,
    1
  );
}

export function adjustableBench() {
  const w = 14;
  const h = 32;
  return place(
    sprite(w, h, (p) => {
      p.r(5, 26, 4, 4, C.frame);
      p.r(1, 29, 12, 2, C.frameLo);
      pad(p, 2, 1, 10, 17, 2);
      pad(p, 2, 19, 10, 8, 2);
    }),
    w,
    h,
    1,
    2
  );
}

export function pecDeck() {
  const w = 38;
  const h = 54;
  return place(
    sprite(w, h, (p) => {
      p.r(3, 49, 32, 4, C.frameLo);
      p.h(3, 49, 32, C.frame);
      stackColumn(p, 13, 3, 12, 30, { pin: 0.5 });
      upright(p, 8, 1, 3, 48);
      upright(p, 27, 1, 3, 48);
      p.r(8, 1, 22, 3, C.frame);
      p.h(8, 1, 22, C.frameHi);
      // arms swinging out to the pads
      p.line(9, 5, 3, 13, C.steel);
      p.line(28, 5, 34, 13, C.steel);
      pad(p, 0, 13, 6, 17, 2);
      pad(p, 32, 13, 6, 17, 2);
      // seat and backrest
      pad(p, 13, 22, 12, 15, 2);
      p.r(17, 42, 4, 7, C.frame);
      pad(p, 12, 37, 14, 6, 2);
    }),
    w,
    h,
    2,
    2
  );
}

export function cableCrossover() {
  const w = 80;
  const h = 62;
  return place(
    sprite(w, h, (p) => {
      p.r(0, 57, 80, 4, C.frameLo);
      p.h(0, 57, 80, C.frame);
      stackColumn(p, 2, 20, 12, 36, { pin: 0.35 });
      stackColumn(p, 66, 20, 12, 36, { pin: 0.55 });
      upright(p, 2, 2, 3, 56);
      upright(p, 75, 2, 3, 56);
      p.r(2, 1, 76, 4, C.frame);
      p.h(2, 1, 76, C.frameHi);
      p.r(2, 4, 76, 1, C.frameLo);
      // chin-up handles
      bar(p, 20, 60, 7);
      p.r(20, 7, 2, 4, C.chrome);
      p.r(58, 7, 2, 4, C.chrome);
      // pulleys on the inner faces
      p.r(14, 13, 3, 3, C.steelHi);
      p.r(63, 13, 3, 3, C.steelHi);
      p.r(14, 44, 3, 3, C.steelHi);
      p.r(63, 44, 3, 3, C.steelHi);
      // cables to hanging D-handles
      p.line(16, 15, 24, 34, C.cable);
      p.line(63, 15, 55, 34, C.cable);
      p.r(22, 34, 4, 3, C.chrome);
      p.r(53, 34, 4, 3, C.chrome);
      p.p(23, 35, C.frameLo);
      p.p(54, 35, C.frameLo);
      // floor mat
      p.r(18, 50, 44, 6, '#20232b');
      p.h(18, 50, 44, '#2c303a');
    }),
    w,
    h,
    5,
    2
  );
}

export function latPulldown() {
  const w = 36;
  const h = 60;
  return place(
    sprite(w, h, (p) => {
      p.r(4, 55, 28, 4, C.frameLo);
      p.h(4, 55, 28, C.frame);
      stackColumn(p, 12, 6, 12, 44, { pin: 0.5 });
      p.r(13, 2, 10, 5, C.frame);
      p.h(13, 2, 10, C.frameHi);
      p.r(16, 6, 4, 3, C.steelHi);
      p.v(18, 9, 7, C.cable);
      // lat bar with bent ends
      bar(p, 3, 33, 15);
      p.r(1, 16, 3, 2, C.chrome);
      p.r(32, 16, 3, 2, C.chrome);
      p.r(3, 15, 4, 2, '#1d1f25');
      p.r(29, 15, 4, 2, '#1d1f25');
      // thigh pads + seat
      p.r(16, 44, 4, 11, C.frame);
      pad(p, 8, 33, 20, 5, 2);
      pad(p, 10, 42, 16, 6, 2);
    }),
    w,
    h,
    2,
    2
  );
}

export function cableRow() {
  const w = 48;
  const h = 40;
  return place(
    sprite(w, h, (p) => {
      stackColumn(p, 34, 2, 12, 36, { pin: 0.45 });
      // long rail
      p.r(1, 30, 34, 5, C.frame);
      p.h(1, 30, 34, C.frameHi);
      p.r(1, 35, 34, 2, C.frameLo);
      pad(p, 4, 23, 14, 7, 2);
      // foot platform
      p.r(25, 17, 6, 13, C.steel);
      p.v(25, 17, 13, C.steelHi);
      for (let y = 19; y < 29; y += 3) p.p(28, y, C.steelLo);
      // cable to V-handle
      p.line(34, 28, 22, 24, C.cable);
      p.r(19, 22, 4, 4, C.chrome);
      p.p(20, 23, C.frameLo);
    }),
    w,
    h,
    3,
    2
  );
}

export function powerTower() {
  const w = 38;
  const h = 62;
  return place(
    sprite(w, h, (p) => {
      p.r(0, 57, 38, 4, C.frameLo);
      p.h(0, 57, 38, C.frame);
      upright(p, 5, 2, 3, 56);
      upright(p, 30, 2, 3, 56);
      // pull-up bar with angled grips
      bar(p, 1, 37, 3);
      p.r(0, 4, 2, 3, C.chrome);
      p.r(36, 4, 2, 3, C.chrome);
      // back pad
      pad(p, 13, 18, 12, 19, 2);
      // elbow pads + dip handles
      pad(p, 5, 22, 10, 5, 2);
      pad(p, 23, 22, 10, 5, 2);
      p.r(5, 30, 4, 2, C.chrome);
      p.r(29, 30, 4, 2, C.chrome);
      p.h(5, 30, 4, C.chromeHi);
      p.h(29, 30, 4, C.chromeHi);
      p.r(11, 46, 16, 3, C.steel);
      p.h(11, 46, 16, C.steelHi);
    }),
    w,
    h,
    2,
    2
  );
}

export function isoRow(plates = [10]) {
  const w = 42;
  const h = 46;
  return place(
    sprite(w, h, (p) => {
      p.r(5, 41, 32, 4, C.frameLo);
      p.h(5, 41, 32, C.frame);
      p.r(19, 30, 4, 11, C.frame);
      // levers
      p.line(17, 10, 7, 28, C.steel);
      p.line(18, 10, 8, 28, C.steelHi);
      p.line(25, 10, 35, 28, C.steel);
      p.line(24, 10, 34, 28, C.steelHi);
      p.r(15, 7, 12, 4, C.frame);
      p.h(15, 7, 12, C.frameHi);
      pad(p, 15, 12, 12, 15, 2);
      pad(p, 13, 31, 16, 6, 2);
      // handles and horns
      p.r(8, 12, 3, 5, C.chrome);
      p.r(31, 12, 3, 5, C.chrome);
      p.r(4, 27, 4, 2, C.steelLo);
      p.r(34, 27, 4, 2, C.steelLo);
      drawPlates(p, 4, 28, plates, -1);
      drawPlates(p, 38, 28, plates, 1);
    }),
    w,
    h,
    2,
    2
  );
}

export function preacherCurl() {
  const w = 34;
  const h = 42;
  return place(
    sprite(w, h, (p) => {
      p.r(2, 37, 30, 4, C.frameLo);
      p.h(2, 37, 30, C.frame);
      stackColumn(p, 23, 3, 9, 32, { pin: 0.7 });
      p.r(11, 26, 4, 11, C.frame);
      pad(p, 5, 28, 14, 5, 2);
      // angled arm pad
      p.r(6, 13, 18, 7, C.pad);
      p.h(6, 13, 18, C.padHi);
      p.r(6, 20, 18, 3, C.padLo);
      p.r(12, 23, 4, 4, C.frame);
      // curl bar
      bar(p, 3, 27, 9);
      p.r(2, 10, 2, 2, C.chrome);
      p.r(26, 10, 2, 2, C.chrome);
    }),
    w,
    h,
    2,
    2
  );
}

/** A loaded barbell resting on the competition platform. */
export function platformBar(plates = [25, 20]) {
  const w = 76;
  const h = 18;
  const dims = { 25: [3, 16], 20: [3, 16], 15: [3, 14], 10: [2, 12], 5: [2, 9], 2.5: [1, 7], 1.25: [1, 6] };
  return place(
    sprite(w, h, (p) => {
      p.r(0, 8, 76, 2, C.chrome);
      p.h(0, 8, 76, C.chromeHi);
      for (let x = 26; x < 50; x += 2) p.p(x, 9, C.chromeLo);
      p.r(15, 6, 2, 6, C.steelLo);
      p.r(59, 6, 2, 6, C.steelLo);
      drawPlates(p, 15, 9, plates, -1, dims);
      drawPlates(p, 61, 9, plates, 1, dims);
    }),
    w,
    h,
    4,
    1
  );
}

/* --------------------------------------------------------------- decor */

export function treadmill() {
  const w = 18;
  const h = 34;
  return place(
    sprite(w, h, (p) => {
      p.r(1, 9, 16, 24, C.frame);
      p.v(1, 9, 24, C.frameHi);
      p.r(4, 10, 10, 22, '#15171c');
      for (let y = 12; y < 31; y += 4) p.h(4, y, 10, '#1f2229');
      p.r(1, 31, 16, 2, C.frameLo);
      p.v(0, 4, 12, C.steel);
      p.v(17, 4, 12, C.steel);
      p.r(1, 1, 16, 7, '#1f2229');
      p.h(1, 1, 16, C.frameHi);
      p.r(4, 2, 10, 3, '#0d3a47');
      p.r(5, 3, 4, 1, C.neonCyan);
      p.r(10, 3, 2, 1, '#9ef2ff');
    }),
    w,
    h,
    1,
    2
  );
}

export function frontDesk() {
  const w = 80;
  const h = 38;
  return place(
    sprite(w, h, (p, ctx) => {
      p.r(0, 14, 80, 23, '#1d2029');
      p.h(0, 36, 80, '#121419');
      // neon trim along the front
      p.r(0, 18, 80, 2, C.neonRed);
      p.h(0, 18, 80, '#ff8a93');
      // counter top
      p.r(0, 8, 80, 7, '#dfe3ea');
      p.h(0, 8, 80, '#ffffff');
      p.h(0, 14, 80, '#9ba1ae');
      // lettering on the front panel
      drawText(ctx, 'MEMBERS', 27, 25, '#6d7486');
      // monitor
      p.r(56, 0, 14, 9, '#16181e');
      p.r(57, 1, 12, 6, '#1a4f7a');
      p.r(58, 2, 5, 1, '#8fd3ff');
      p.r(58, 4, 8, 1, '#4f9fd6');
      p.r(62, 8, 2, 1, '#16181e');
      // scanner + clipboard
      p.r(10, 5, 6, 4, '#2b2f3a');
      p.p(12, 6, C.neonRed);
      p.r(30, 6, 8, 3, '#f4f4f7');
      p.h(31, 7, 5, '#a3a9b8');
    }),
    w,
    h,
    5,
    2
  );
}

export function pcDesk() {
  const w = 30;
  const h = 30;
  return place(
    sprite(w, h, (p) => {
      p.r(0, 13, 30, 5, C.wood);
      p.h(0, 13, 30, C.woodHi);
      p.r(0, 18, 30, 11, C.woodLo);
      p.r(2, 18, 12, 11, '#533521');
      p.h(3, 22, 10, '#7a5030');
      p.h(3, 26, 10, '#7a5030');
      // monitor
      p.r(8, 0, 16, 12, '#16181e');
      p.r(9, 1, 14, 9, '#082414');
      p.h(10, 2, 7, '#3ee08f');
      p.h(10, 4, 10, '#239e60');
      p.h(10, 6, 5, '#3ee08f');
      p.p(16, 6, '#b8ffd8');
      p.r(14, 12, 4, 1, '#16181e');
      p.r(9, 11, 12, 2, '#2b2f3a');
    }),
    w,
    h,
    2,
    1,
    { dy: 0 }
  );
}

export function waterCooler() {
  const w = 12;
  const h = 28;
  return place(
    sprite(w, h, (p) => {
      p.r(2, 0, 8, 9, '#5aa9f0');
      p.v(3, 1, 7, '#b5dcff');
      p.r(4, 8, 4, 2, '#3b82c4');
      p.r(0, 10, 12, 17, C.white);
      p.v(0, 10, 17, '#ffffff');
      p.v(11, 10, 17, C.whiteLo);
      p.p(3, 14, '#3b82f6');
      p.p(8, 14, C.neonRed);
      p.r(2, 17, 8, 2, '#c3c8d2');
    }),
    w,
    h,
    1,
    1
  );
}

export function plant(seed = 1) {
  const w = 16;
  const h = 26;
  const rand = rng(seed * 7919);
  return place(
    sprite(w, h, (p) => {
      p.r(4, 18, 8, 7, '#a0522d');
      p.h(3, 18, 10, '#c46b3d');
      p.h(4, 24, 8, '#6e3a1f');
      const greens = ['#2f8f4e', '#3fb866', '#1f6a38'];
      for (let i = 0; i < 14; i++) {
        const x = 2 + Math.floor(rand() * 11);
        const y = 2 + Math.floor(rand() * 15);
        p.r(x, y, 2 + Math.floor(rand() * 2), 3, greens[i % 3]);
      }
      p.line(8, 18, 4, 6, '#1f6a38');
      p.line(8, 18, 12, 5, '#1f6a38');
    }),
    w,
    h,
    1,
    1
  );
}

export function lockers(count = 4) {
  const w = count * 12;
  const h = 32;
  return place(
    sprite(w, h, (p) => {
      for (let i = 0; i < count; i++) {
        const x = i * 12;
        p.r(x, 0, 12, 32, '#5b6474');
        p.v(x, 0, 32, '#7e8899');
        p.v(x + 11, 0, 32, '#3b424f');
        for (let y = 3; y < 10; y += 2) p.h(x + 3, y, 6, '#3b424f');
        p.r(x + 8, 15, 2, 4, C.chromeHi);
        p.h(x, 31, 12, '#2c323c');
      }
    }),
    w,
    h,
    Math.ceil(w / TILE),
    1,
    { dx: 0 }
  );
}

export function plateTree() {
  const w = 18;
  const h = 30;
  return place(
    sprite(w, h, (p) => {
      p.r(3, 27, 12, 2, C.frameLo);
      p.r(8, 2, 2, 26, C.steel);
      p.v(8, 2, 26, C.steelHi);
      drawPlates(p, 7, 9, [20, 10], -1);
      drawPlates(p, 10, 9, [25, 15], 1);
      drawPlates(p, 7, 21, [25, 5], -1);
      drawPlates(p, 10, 21, [20, 5], 1);
    }),
    w,
    h,
    1,
    1
  );
}

export function kettlebells() {
  const w = 30;
  const h = 12;
  return place(
    sprite(w, h, (p) => {
      const kb = (x, s, color) => {
        p.ellipse(x + s, 11 - s, s, s, color);
        p.r(x + 1, 11 - s * 2 - 2, s * 2 - 1, 1, color);
        p.v(x + 1, 11 - s * 2 - 2, 3, color);
        p.v(x + s * 2 - 1, 11 - s * 2 - 2, 3, color);
        p.p(x + Math.max(1, s - 1), 10 - s, '#6b7282');
      };
      kb(1, 3, '#2d3038');
      kb(9, 3, '#2d3038');
      kb(17, 4, '#2a2c33');
    }),
    w,
    h,
    2,
    1
  );
}

export function chalkBowl() {
  const w = 12;
  const h = 20;
  return place(
    sprite(w, h, (p) => {
      p.r(5, 7, 2, 11, C.steel);
      p.r(2, 17, 8, 2, C.frameLo);
      p.ellipse(6, 5, 5, 3, '#5f6676');
      p.ellipse(6, 4, 4, 2, '#f7f7fa');
      p.p(4, 4, '#ffffff');
    }),
    w,
    h,
    1,
    1
  );
}

export function loungeBench() {
  const w = 30;
  const h = 14;
  return place(
    sprite(w, h, (p) => {
      p.r(2, 9, 2, 4, C.frame);
      p.r(26, 9, 2, 4, C.frame);
      p.r(0, 3, 30, 7, '#3a3f4c');
      p.h(0, 3, 30, '#565d6d');
      p.r(0, 9, 30, 1, '#262a33');
    }),
    w,
    h,
    2,
    1
  );
}

/* ------------------------------------------------------------- outdoors */

export function streetLamp() {
  const w = 12;
  const h = 50;
  return place(
    sprite(w, h, (p) => {
      p.r(4, 46, 5, 3, '#23262e');
      p.r(5, 8, 2, 39, '#3a3f4b');
      p.v(5, 8, 39, '#555c6b');
      p.r(1, 2, 10, 5, '#2b2f3a');
      p.h(1, 2, 10, '#4a5161');
      p.r(2, 6, 8, 2, '#ffe3a1');
      p.h(3, 7, 6, '#fff6d8');
    }),
    w,
    h,
    1,
    1
  );
}

export function parkedCar(body = '#b3162a', bodyHi = '#e0404f', bodyLo = '#6e0d18') {
  const w = 46;
  const h = 26;
  return place(
    sprite(w, h, (p) => {
      p.pill(0, 6, 46, 16, body);
      p.h(1, 6, 44, bodyHi);
      p.r(1, 18, 44, 4, bodyLo);
      // cabin
      p.pill(10, 1, 24, 10, '#1b2433');
      p.r(12, 2, 9, 7, '#3d5a7a');
      p.r(23, 2, 9, 7, '#3d5a7a');
      p.h(12, 2, 9, '#7fa6cc');
      p.h(23, 2, 9, '#7fa6cc');
      // lights and wheels
      p.r(0, 10, 2, 3, '#ffe9b0');
      p.r(44, 10, 2, 3, '#ff3b4c');
      p.r(6, 20, 8, 5, '#111216');
      p.r(32, 20, 8, 5, '#111216');
      p.r(8, 21, 4, 2, '#5d6371');
      p.r(34, 21, 4, 2, '#5d6371');
    }),
    w,
    h,
    3,
    1
  );
}

export function hydrant() {
  const w = 10;
  const h = 15;
  return place(
    sprite(w, h, (p) => {
      p.r(2, 3, 6, 10, '#cf2433');
      p.v(2, 3, 10, '#ff5a64');
      p.r(3, 1, 4, 2, '#cf2433');
      p.r(0, 6, 10, 2, '#a51a27');
      p.r(1, 13, 8, 2, '#7a121c');
    }),
    w,
    h,
    1,
    1
  );
}

export function trashCan() {
  const w = 12;
  const h = 16;
  return place(
    sprite(w, h, (p) => {
      p.r(1, 3, 10, 12, '#2f6b4a');
      p.v(1, 3, 12, '#3f8a60');
      for (let x = 3; x < 11; x += 2) p.v(x, 5, 8, '#24533a');
      p.r(0, 1, 12, 3, '#3c4250');
      p.h(0, 1, 12, '#5b6272');
    }),
    w,
    h,
    1,
    1
  );
}

export function planter() {
  const w = 30;
  const h = 18;
  const rand = rng(4242);
  return place(
    sprite(w, h, (p) => {
      p.r(0, 9, 30, 8, '#5d6573');
      p.h(0, 9, 30, '#7c8595');
      p.h(0, 16, 30, '#3f4551');
      const greens = ['#2d7d45', '#3aa35a', '#1e5c33'];
      for (let i = 0; i < 18; i++) {
        p.r(1 + Math.floor(rand() * 26), 1 + Math.floor(rand() * 8), 3, 3, greens[i % 3]);
      }
    }),
    w,
    h,
    2,
    1
  );
}

export function bike() {
  const w = 26;
  const h = 16;
  return place(
    sprite(w, h, (p) => {
      const wheel = (cx) => {
        p.ellipse(cx, 10, 5, 5, '#15171c');
        p.ellipse(cx, 10, 3, 3, '#3a3f4b');
        p.p(cx, 10, C.chromeHi);
      };
      wheel(6);
      wheel(20);
      p.line(6, 10, 12, 4, '#35c2ff');
      p.line(12, 4, 20, 10, '#35c2ff');
      p.line(12, 4, 13, 10, '#35c2ff');
      p.line(13, 10, 6, 10, '#35c2ff');
      p.r(10, 2, 5, 1, '#15171c');
      p.r(18, 3, 4, 1, '#15171c');
    }),
    w,
    h,
    2,
    1
  );
}

/* ------------------------------------------------------------ builders */

export function buildProps({ benchPlates, squatPlates, smithPlates, pressPlates, hackPlates, calfPlates, isoPlates }) {
  return {
    rack: squatRack(squatPlates),
    bench: flatBench(benchPlates),
    smith: smithMachine(smithPlates),
    legpress: legPress(pressPlates),
    hack: hackSquat(hackPlates),
    legmachine: legMachine(),
    calf: calfRaise(calfPlates),
    dumbbells: dumbbellRack(),
    adjbench: adjustableBench(),
    pecdeck: pecDeck(),
    cables: cableCrossover(),
    pulldown: latPulldown(),
    row: cableRow(),
    tower: powerTower(),
    isorow: isoRow(isoPlates),
    preacher: preacherCurl(),
    treadmill: treadmill(),
    desk: frontDesk(),
    pc: pcDesk(),
    cooler: waterCooler(),
    plant1: plant(1),
    plant2: plant(2),
    plant3: plant(3),
    lockers: lockers(4),
    platetree: plateTree(),
    kettlebells: kettlebells(),
    chalk: chalkBowl(),
    lounge: loungeBench(),
    platformbar: platformBar([25, 20, 5]),
    lamp: streetLamp(),
    car: parkedCar(),
    car2: parkedCar('#1f5fbf', '#4f8bea', '#123a78'),
    hydrant: hydrant(),
    trash: trashCan(),
    planter: planter(),
    bike: bike(),
  };
}
