/**
 * The two maps: the street outside the gym and the gym floor. Each map is a
 * pre-rendered background (floor and walls), a list of objects with tile
 * footprints, NPCs, door triggers, and two lighting layers — a multiply "shade"
 * layer that darkens everything away from the lights, and an additive "glow"
 * layer for neon, screens and lamps.
 */
import { makeCanvas, painter, rng, TILE, withAlpha } from './pixel';
import { drawText, textWidth } from './font';
import { C } from './props';

const T = TILE;

/* ------------------------------------------------------------ lighting */

function lightLayers(w, h, { ambient, lights }) {
  const [shade, sctx] = makeCanvas(w * T, h * T);
  sctx.fillStyle = ambient;
  sctx.fillRect(0, 0, w * T, h * T);
  const [glow, gctx] = makeCanvas(w * T, h * T);
  for (const light of lights) {
    const x = light.x * T;
    const y = light.y * T;
    const r = light.r * T;
    if (light.reveal !== false) {
      const g = sctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(255,255,255,${light.reveal ?? 1})`);
      g.addColorStop(0.55, `rgba(255,255,255,${(light.reveal ?? 1) * 0.55})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      sctx.fillStyle = g;
      if (light.sx || light.sy) {
        sctx.save();
        sctx.translate(x, y);
        sctx.scale(light.sx || 1, light.sy || 1);
        sctx.translate(-x, -y);
        sctx.fillRect(x - r, y - r, r * 2, r * 2);
        sctx.restore();
      } else sctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    if (light.color) {
      const g = gctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, withAlpha(light.color, light.glow ?? 0.25));
      g.addColorStop(1, withAlpha(light.color, 0));
      gctx.fillStyle = g;
      gctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }
  return { shade, glow };
}

/* --------------------------------------------------------------- floor */

function rubberFloor(p, x0, y0, w, h, rand, { base = '#22252d', seam = '#1a1c23', fleck = ['#2b2f39', '#191b21', '#30343f'] } = {}) {
  p.r(x0 * T, y0 * T, w * T, h * T, base);
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      for (let i = 0; i < 9; i++) {
        p.p(x * T + Math.floor(rand() * T), y * T + Math.floor(rand() * T), fleck[i % fleck.length]);
      }
    }
  }
  for (let x = x0; x <= x0 + w; x += 2) p.v(x * T, y0 * T, h * T, seam);
  for (let y = y0; y <= y0 + h; y += 2) p.h(x0 * T, y * T, w * T, seam);
}

function woodPlatform(p, x0, y0, w, h, { border = '#15171c', inset = true } = {}) {
  const px = x0 * T;
  const py = y0 * T;
  const pw = w * T;
  const ph = h * T;
  p.r(px, py, pw, ph, border);
  p.r(px + 2, py + 2, pw - 4, ph - 4, C.wood);
  for (let y = py + 2; y < py + ph - 2; y += 4) {
    p.h(px + 2, y, pw - 4, C.woodLo);
    p.h(px + 2, y + 1, pw - 4, '#9a6538');
    const offset = ((y - py) / 4) % 2 ? 11 : 27;
    for (let x = px + offset; x < px + pw - 2; x += 32) p.v(x, y, 4, C.woodLo);
  }
  if (inset) {
    // rubber drop zones either side, where plates land
    p.r(px + 2, py + 2, 6, ph - 4, '#1b1d23');
    p.r(px + pw - 8, py + 2, 6, ph - 4, '#1b1d23');
  }
  p.h(px, py + ph - 1, pw, '#0c0d10');
}

function turf(p, x0, y0, w, h, rand) {
  p.r(x0 * T, y0 * T, w * T, h * T, '#2c6a3b');
  for (let i = 0; i < w * h * 26; i++) {
    p.p(x0 * T + Math.floor(rand() * w * T), y0 * T + Math.floor(rand() * h * T), rand() > 0.5 ? '#347a45' : '#255a32');
  }
  for (let y = y0 * T + 12; y < (y0 + h) * T; y += 24) p.h(x0 * T + 2, y, w * T - 4, '#d9e8dc');
  p.r(x0 * T, y0 * T, w * T, 1, '#1b3f24');
}

function floorLabel(ctx, text, cx, cy, color) {
  const width = textWidth(text, 2) * 2;
  drawText(ctx, text, cx * T - width / 2, cy * T, color, { spacing: 2, scale: 2 });
}

/* ---------------------------------------------------------------- walls */

function backWall(p, ctx, w, rand) {
  const H = 2 * T;
  p.r(0, 0, w * T, H, '#262a36');
  for (let y = 4; y < H - 4; y += 2) p.h(0, y, w * T, y % 4 ? '#282c39' : '#252834');
  p.r(0, 0, w * T, 4, '#111318');
  p.h(0, 4, w * T, '#353a49');
  p.r(0, H - 4, w * T, 4, '#15171d');
  // red LED strip along the skirting
  p.h(0, H - 5, w * T, '#ff3b4c');
  for (let x = 0; x < w * T; x += 8) p.p(x + Math.floor(rand() * 8), 6 + Math.floor(rand() * 20), '#2d3240');
}

function mirror(p, x0, x1, top = 6, bottom = 26) {
  const px = x0 * T;
  const pw = (x1 - x0) * T;
  p.r(px, top, pw, bottom - top, '#6b7486');
  p.r(px + 1, top + 1, pw - 2, bottom - top - 2, '#344563');
  for (let y = top + 1; y < bottom - 1; y++) {
    const mix = (y - top) / (bottom - top);
    p.h(px + 1, y, pw - 2, mix > 0.6 ? '#3e5475' : mix > 0.3 ? '#3a4d6d' : '#344563');
  }
  for (let x = px + 6; x < px + pw - 12; x += 22) {
    p.line(x, bottom - 3, x + 8, top + 2, '#7b9cc4');
    p.line(x + 3, bottom - 3, x + 11, top + 2, '#566f93');
  }
}

function windowPane(p, x0, y0, w, h, rand) {
  p.r(x0, y0, w, h, '#101521');
  // skyline
  for (let x = x0; x < x0 + w; x += 5) {
    const bh = 4 + Math.floor(rand() * (h - 5));
    p.r(x, y0 + h - bh, 4, bh, '#1b2233');
    for (let yy = y0 + h - bh + 2; yy < y0 + h - 1; yy += 3) if (rand() > 0.55) p.p(x + 1 + Math.floor(rand() * 2), yy, '#ffd479');
  }
  p.r(x0 - 1, y0 - 1, w + 2, 1, '#5b6474');
  p.r(x0 - 1, y0 + h, w + 2, 1, '#5b6474');
}

/* ---------------------------------------------------------------- build */

const solidGrid = (w, h) => new Uint8Array(w * h);

function finalize(map) {
  const { w, h } = map;
  const solid = map.solid;
  for (const object of map.objects) {
    if (object.solid === false) continue;
    for (let y = object.y; y < object.y + object.h; y++) {
      for (let x = object.x; x < object.x + object.w; x++) {
        if (x >= 0 && y >= 0 && x < w && y < h) solid[y * w + x] = 1;
      }
    }
  }
  map.objectAt = (x, y) =>
    map.objects.find((o) => o.interact !== false && x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h) || null;
  return map;
}

/* ------------------------------------------------------------- the gym */

export function buildGym(props) {
  const w = 32;
  const h = 24;
  const rand = rng(20260925);
  const [bg, ctx] = makeCanvas(w * T, h * T);
  const p = painter(ctx);

  // Main floor, lobby, turf lane.
  rubberFloor(p, 0, 2, w, 13, rand);
  rubberFloor(p, 0, 15, w, 8, rand, { base: '#2a2d36', seam: '#23262e', fleck: ['#30343e', '#262930'] });
  p.h(0, 15 * T, w * T, '#3b4050');
  p.h(0, 15 * T + 1, w * T, '#1a1c22');
  turf(p, 29, 11, 2, 4, rand);

  // Lifting platforms.
  woodPlatform(p, 1, 2, 5, 5);
  woodPlatform(p, 11, 7, 5, 4);
  // Boss platform: competition black with red and gold edges.
  const bx = 13 * T;
  const by = 2 * T;
  p.r(bx, by, 6 * T, 4 * T, '#0f1014');
  p.r(bx + 2, by + 2, 6 * T - 4, 4 * T - 4, '#15161b');
  p.r(bx, by, 6 * T, 2, '#e2b021');
  p.r(bx, by + 4 * T - 2, 6 * T, 2, '#e2b021');
  p.r(bx, by, 2, 4 * T, '#e2b021');
  p.r(bx + 6 * T - 2, by, 2, 4 * T, '#e2b021');
  for (let x = bx + 6; x < bx + 6 * T - 6; x += 8) p.r(x, by + 4 * T - 6, 4, 2, '#d41f2b');
  drawText(ctx, 'PR ONLY', bx + 6 * T / 2 - textWidth('PR ONLY') / 2, by + 4 * T - 13, '#3a3222');

  // Floor markings.
  floorLabel(ctx, 'LEGS', 5.5, 12.4, 'rgba(255,255,255,0.07)');
  floorLabel(ctx, 'PUSH', 20, 11.4, 'rgba(255,255,255,0.07)');
  floorLabel(ctx, 'PULL', 25.5, 12.4, 'rgba(255,255,255,0.07)');
  // zone divider lines
  for (let y = 2 * T; y < 15 * T; y += 6) {
    p.r(10 * T + 7, y, 2, 3, 'rgba(226,176,33,0.18)');
    p.r(21 * T + 7, y, 2, 3, 'rgba(226,176,33,0.18)');
  }

  // Walls.
  backWall(p, ctx, w, rand);
  mirror(p, 1, 10);
  mirror(p, 22, 31);
  windowPane(p, 19 * T + 4, 7, 24, 18, rand);
  windowPane(p, 10 * T + 4, 7, 24, 18, rand);
  // clock
  p.ellipse(21 * T + 8, 14, 5, 5, '#e7eaf0');
  p.ellipse(21 * T + 8, 14, 4, 4, '#1b1d23');
  p.v(21 * T + 8, 10, 4, '#e7eaf0');
  p.h(21 * T + 8, 14, 3, '#ff3b4c');
  // side + front walls
  p.r(0, 2 * T, 4, (h - 2) * T, '#111318');
  p.r(4, 2 * T, 1, (h - 2) * T, '#2b2f3c');
  p.r(w * T - 4, 2 * T, 4, (h - 2) * T, '#111318');
  p.r(w * T - 5, 2 * T, 1, (h - 2) * T, '#2b2f3c');
  p.r(0, (h - 1) * T + 8, w * T, 8, '#111318');
  p.h(0, (h - 1) * T + 7, w * T, '#2b2f3c');
  // entrance: mat and doorway spill
  p.r(15 * T - 4, (h - 1) * T + 7, 2 * T + 8, 9, '#0b0c0f');
  p.r(15 * T, (h - 2) * T + 2, 2 * T, T + 5, '#1a1c22');
  p.r(15 * T + 2, (h - 2) * T + 4, 2 * T - 4, T + 1, '#2a1216');
  drawText(ctx, 'S', 16 * T - 1, (h - 2) * T + 9, '#d41f2b');

  const objects = [
    // legs
    { id: 'rack', station: 'rack', prop: 'rack', x: 2, y: 4, w: 3, h: 2 },
    { id: 'platetree', prop: 'platetree', x: 6, y: 2, w: 1, h: 1 },
    { id: 'smith', station: 'smith', prop: 'smith', x: 7, y: 4, w: 3, h: 2 },
    { id: 'legpress', station: 'legpress', prop: 'legpress', x: 1, y: 9, w: 3, h: 2 },
    { id: 'hack', station: 'hack', prop: 'hack', x: 5, y: 9, w: 2, h: 2 },
    { id: 'legmachine', station: 'legmachine', prop: 'legmachine', x: 8, y: 9, w: 2, h: 2 },
    { id: 'calf', station: 'calf', prop: 'calf', x: 1, y: 12, w: 2, h: 2 },
    // boss platform
    { id: 'platformbar', prop: 'platformbar', x: 14, y: 3, w: 4, h: 1 },
    { id: 'chalk', prop: 'chalk', x: 18, y: 3, w: 1, h: 1 },
    // push
    { id: 'bench', station: 'bench', prop: 'bench', x: 12, y: 8, w: 3, h: 2 },
    { id: 'dumbbells', station: 'dumbbells', prop: 'dumbbells', x: 16, y: 7, w: 5, h: 1 },
    { id: 'adjbench', station: 'dumbbells', prop: 'adjbench', x: 18, y: 9, w: 1, h: 2 },
    { id: 'pecdeck', station: 'pecdeck', prop: 'pecdeck', x: 11, y: 12, w: 2, h: 2 },
    { id: 'cables', station: 'cables', prop: 'cables', x: 14, y: 13, w: 5, h: 2 },
    { id: 'kettlebells', prop: 'kettlebells', x: 19, y: 14, w: 2, h: 1 },
    // pull
    { id: 'pulldown', station: 'pulldown', prop: 'pulldown', x: 22, y: 3, w: 2, h: 2 },
    { id: 'row', station: 'row', prop: 'row', x: 25, y: 3, w: 3, h: 2 },
    { id: 'tower', station: 'tower', prop: 'tower', x: 29, y: 3, w: 2, h: 2 },
    { id: 'isorow', station: 'isorow', prop: 'isorow', x: 22, y: 8, w: 2, h: 2 },
    { id: 'preacher', station: 'preacher', prop: 'preacher', x: 26, y: 8, w: 2, h: 2 },
    // lobby
    { id: 'treadmill1', prop: 'treadmill', x: 2, y: 16, w: 1, h: 2 },
    { id: 'treadmill2', prop: 'treadmill', x: 4, y: 16, w: 1, h: 2 },
    { id: 'treadmill3', prop: 'treadmill', x: 6, y: 16, w: 1, h: 2 },
    { id: 'lockers', prop: 'lockers', x: 1, y: 21, w: 3, h: 1 },
    { id: 'lounge', prop: 'lounge', x: 9, y: 21, w: 2, h: 1 },
    { id: 'plant-a', prop: 'plant1', x: 13, y: 21, w: 1, h: 1 },
    { id: 'plant-b', prop: 'plant2', x: 18, y: 21, w: 1, h: 1 },
    { id: 'plant-c', prop: 'plant3', x: 30, y: 16, w: 1, h: 1 },
    { id: 'desk', prop: 'desk', x: 20, y: 18, w: 5, h: 2 },
    { id: 'pc', prop: 'pc', x: 26, y: 19, w: 2, h: 1 },
    { id: 'cooler', prop: 'cooler', x: 29, y: 19, w: 1, h: 1 },
  ];

  const npcs = [
    { id: 'desk', sprite: 'desk', x: 22, y: 17, dir: 'down' },
    { id: 'coach', sprite: 'coach', x: 16, y: 4, dir: 'down' },
    { id: 'bro', sprite: 'bro', x: 15, y: 9, dir: 'left' },
    { id: 'curler', sprite: 'curler', x: 3, y: 6, dir: 'down', anim: 'curl' },
    { id: 'runner', sprite: 'runner', x: 4, y: 16, dir: 'up', anim: 'run', solid: false, oy: 8 },
    { id: 'janitor', sprite: 'janitor', x: 12, y: 17, dir: 'right', wander: { x: 8, y: 15, w: 11, h: 5 }, anim: 'mop' },
  ];

  const solid = solidGrid(w, h);
  for (let x = 0; x < w; x++) {
    solid[x] = 1;
    solid[w + x] = 1;
    solid[(h - 1) * w + x] = x === 15 || x === 16 ? 0 : 1;
  }
  for (let y = 0; y < h; y++) {
    solid[y * w] = 1;
    solid[y * w + w - 1] = 1;
  }
  // Nobody walks behind the reception desk except the receptionist.
  for (let x = 20; x <= 24; x++) solid[17 * w + x] = 1;

  const lights = [
    { x: 3.5, y: 4.5, r: 5, color: '#cfe0ff', glow: 0.06 },
    { x: 8.5, y: 4.5, r: 4.5 },
    { x: 4, y: 10.5, r: 5, color: '#cfe0ff', glow: 0.05 },
    { x: 9, y: 11, r: 4 },
    { x: 16, y: 3.5, r: 5.5, color: '#ffd28a', glow: 0.22 },
    { x: 13.5, y: 9, r: 4.5, color: '#cfe0ff', glow: 0.05 },
    { x: 18.5, y: 9, r: 4.5 },
    { x: 13, y: 13.5, r: 4.5 },
    { x: 17, y: 13.5, r: 4.5, color: '#cfe0ff', glow: 0.05 },
    { x: 23, y: 4.5, r: 4.5 },
    { x: 27.5, y: 4.5, r: 5, color: '#cfe0ff', glow: 0.05 },
    { x: 23, y: 9.5, r: 4.5 },
    { x: 27.5, y: 10, r: 4.5 },
    { x: 30, y: 13, r: 3, color: '#7dffa0', glow: 0.04 },
    { x: 4.5, y: 18, r: 5 },
    { x: 11, y: 19, r: 5, color: '#cfe0ff', glow: 0.04 },
    { x: 16, y: 21.5, r: 4, color: '#ffb86b', glow: 0.18 },
    { x: 22.5, y: 19, r: 5, color: '#ff3b4c', glow: 0.14 },
    { x: 27, y: 19.5, r: 2.2, color: '#3ee08f', glow: 0.22 },
    { x: 16, y: 1.2, r: 4, color: '#ff3b4c', glow: 0.35, reveal: 0.8, sx: 1.8, sy: 0.7 },
    { x: 2, y: 16.5, r: 1.4, color: '#35e1ff', glow: 0.25, reveal: false },
    { x: 4, y: 16.5, r: 1.4, color: '#35e1ff', glow: 0.25, reveal: false },
    { x: 6, y: 16.5, r: 1.4, color: '#35e1ff', glow: 0.25, reveal: false },
  ];
  // The skirting LED strip glows the whole width of the back wall.
  for (let x = 1; x < w; x += 3) lights.push({ x, y: 2, r: 1.6, color: '#ff3b4c', glow: 0.12, reveal: false });

  const { shade, glow } = lightLayers(w, h, { ambient: '#737894', lights });

  return finalize({
    id: 'gym',
    name: 'THE GYM',
    w,
    h,
    bg,
    shade,
    glow,
    objects: objects.map((o) => ({ ...o, ...props[o.prop], interact: true })),
    npcs,
    solid,
    triggers: [
      { x: 15, y: 23, to: 'street', spawn: { x: 10, y: 7, dir: 'down' } },
      { x: 16, y: 23, to: 'street', spawn: { x: 11, y: 7, dir: 'down' } },
    ],
    spawn: { x: 15, y: 21, dir: 'up' },
    zones: [
      { name: 'LEG DAY', x: 1, y: 2, w: 10, h: 13 },
      { name: 'PUSH', x: 11, y: 6, w: 10, h: 9 },
      { name: 'THE PLATFORM', x: 13, y: 2, w: 6, h: 4 },
      { name: 'PULL', x: 21, y: 2, w: 10, h: 13 },
      { name: 'LOBBY', x: 1, y: 15, w: 30, h: 8 },
    ],
    neon: { text: 'LIGHTWEIGHT', x: 16 * T, y: 8, color: '#ff3b4c', scale: 2 },
    music: 'gym',
  });
}

/* ----------------------------------------------------------- the street */

export function buildStreet(props) {
  const w = 22;
  const h = 14;
  const rand = rng(777);
  const [bg, ctx] = makeCanvas(w * T, h * T);
  const p = painter(ctx);

  // road
  p.r(0, 11 * T, w * T, 3 * T, '#1e2027');
  for (let i = 0; i < 900; i++) p.p(Math.floor(rand() * w * T), 11 * T + Math.floor(rand() * 3 * T), rand() > 0.5 ? '#25272f' : '#1a1c21');
  for (let x = 4; x < w * T; x += 24) p.r(x, 12 * T + 7, 12, 2, '#c9a227');
  // curb
  p.r(0, 11 * T - 3, w * T, 3, '#8a909c');
  p.h(0, 11 * T - 3, w * T, '#b3b9c4');
  p.h(0, 11 * T - 1, w * T, '#4a4f5a');
  // sidewalk
  p.r(0, 7 * T, w * T, 4 * T - 3, '#4b505b');
  for (let x = 0; x < w * T; x += 24) p.v(x, 7 * T, 4 * T - 3, '#3e424c');
  for (let y = 7 * T; y < 11 * T - 3; y += 24) p.h(0, y, w * T, '#3e424c');
  for (let i = 0; i < 500; i++) p.p(Math.floor(rand() * w * T), 7 * T + Math.floor(rand() * (4 * T - 3)), rand() > 0.5 ? '#555a66' : '#43474f');

  // building: roof, brick facade
  p.r(0, 0, w * T, 7 * T, '#2e2029');
  for (let y = 10; y < 7 * T; y += 5) {
    p.h(0, y, w * T, '#231820');
    const offset = (y / 5) % 2 ? 0 : 6;
    for (let x = offset; x < w * T; x += 12) p.v(x, y - 4, 4, '#231820');
  }
  p.r(0, 0, w * T, 8, '#15161b');
  p.h(0, 8, w * T, '#3b2c36');
  p.r(0, 7 * T - 4, w * T, 4, '#1a1318');

  // big windows with the gym glowing inside
  const gymWindow = (x0, x1) => {
    const px = x0 * T;
    const pw = (x1 - x0) * T;
    const top = 2 * T;
    const ph = 4 * T - 4;
    p.r(px - 2, top - 2, pw + 4, ph + 4, '#15161b');
    p.r(px, top, pw, ph, '#3a2a1c');
    for (let y = top; y < top + ph; y++) {
      const t = (y - top) / ph;
      p.h(px, y, pw, t < 0.5 ? '#5b4128' : t < 0.8 ? '#4a3521' : '#3a2a1c');
    }
    // silhouettes: racks, a lifter mid-press
    for (let x = px + 6; x < px + pw - 12; x += 28) {
      p.r(x, top + 10, 2, ph - 10, '#20170f');
      p.r(x + 14, top + 10, 2, ph - 10, '#20170f');
      p.r(x - 2, top + 10, 20, 2, '#20170f');
      p.r(x - 5, top + 24, 26, 1, '#2a1e13');
      p.r(x - 6, top + 21, 2, 7, '#20170f');
      p.r(x + 20, top + 21, 2, 7, '#20170f');
    }
    for (let x = px + 8; x < px + pw; x += 32) p.line(x, top + ph - 2, x + 10, top + 2, 'rgba(255,230,180,0.18)');
    p.v(px + Math.floor(pw / 2), top, ph, '#15161b');
  };
  gymWindow(1, 8);
  gymWindow(14, 21);

  // entrance: glass double door and awning
  const dx = 10 * T;
  p.r(dx - 6, 3 * T, 2 * T + 12, 4 * T, '#15161b');
  p.r(dx - 2, 4 * T - 2, 2 * T + 4, 3 * T + 2, '#2a3240');
  for (const x of [dx, dx + T + 1]) {
    p.r(x, 4 * T, T - 1, 3 * T - 4, '#5c7f99');
    for (let y = 4 * T; y < 7 * T - 4; y++) {
      p.h(x, y, T - 1, (y - 4 * T) % 11 < 5 ? '#6f95b2' : '#5c7f99');
    }
    p.line(x + 2, 7 * T - 8, x + 10, 4 * T + 4, '#a7c8de');
    p.r(x + (x === dx ? T - 4 : 2), 5 * T + 4, 2, 8, '#d7dde7');
  }
  drawText(ctx, 'PUSH', dx + T - textWidth('PUSH') / 2, 6 * T - 2, '#1a2a38');
  // awning
  for (let x = dx - 10; x < dx + 2 * T + 10; x += 6) {
    p.r(x, 3 * T - 2, 6, 7, (x / 6) % 2 ? '#b3162a' : '#e0404f');
  }
  p.h(dx - 10, 3 * T + 5, 2 * T + 20, '#6e0d18');

  const objects = [
    { id: 'lamp-l', prop: 'lamp', x: 3, y: 8, w: 1, h: 1 },
    { id: 'lamp-r', prop: 'lamp', x: 18, y: 8, w: 1, h: 1 },
    { id: 'planter-l', prop: 'planter', x: 6, y: 7, w: 2, h: 1 },
    { id: 'planter-r', prop: 'planter', x: 14, y: 7, w: 2, h: 1 },
    { id: 'bike', prop: 'bike', x: 16, y: 7, w: 2, h: 1 },
    { id: 'hydrant', prop: 'hydrant', x: 20, y: 9, w: 1, h: 1 },
    { id: 'trash', prop: 'trash', x: 1, y: 8, w: 1, h: 1 },
    { id: 'car', prop: 'car', x: 3, y: 12, w: 3, h: 1 },
    { id: 'car2', prop: 'car2', x: 15, y: 12, w: 3, h: 1 },
  ];

  const solid = solidGrid(w, h);
  for (let y = 0; y < 7; y++) for (let x = 0; x < w; x++) solid[y * w + x] = 1;
  solid[6 * w + 10] = 0;
  solid[6 * w + 11] = 0;

  const lights = [
    { x: 3.5, y: 8.6, r: 4.5, color: '#ffcf7a', glow: 0.26 },
    { x: 18.5, y: 8.6, r: 4.5, color: '#ffcf7a', glow: 0.26 },
    { x: 4.5, y: 7.4, r: 4, color: '#ffb35c', glow: 0.12, sx: 1.4, sy: 0.6 },
    { x: 17.5, y: 7.4, r: 4, color: '#ffb35c', glow: 0.12, sx: 1.4, sy: 0.6 },
    { x: 11, y: 1.6, r: 3.5, color: '#ff3b4c', glow: 0.5, reveal: 0.9 },
    { x: 11, y: 7.2, r: 3, color: '#9cc9ff', glow: 0.14 },
    { x: 11, y: 10, r: 3.5, reveal: 0.6 },
  ];
  const { shade, glow } = lightLayers(w, h, { ambient: '#4a4f6d', lights });

  return finalize({
    id: 'street',
    name: 'OUTSIDE',
    w,
    h,
    bg,
    shade,
    glow,
    objects: objects.map((o) => ({ ...o, ...props[o.prop], interact: true })),
    npcs: [{ id: 'cat', sprite: 'cat', x: 8, y: 7, dir: 'down', anim: 'sleep' }],
    solid,
    triggers: [
      { x: 10, y: 6, to: 'gym', spawn: { x: 15, y: 22, dir: 'up' } },
      { x: 11, y: 6, to: 'gym', spawn: { x: 16, y: 22, dir: 'up' } },
    ],
    spawn: { x: 10, y: 10, dir: 'up' },
    zones: [],
    neon: { text: 'GYM', x: 11 * T, y: 13, color: '#ff3b4c', scale: 3, sub: { text: 'OPEN 24/7', color: '#35e1ff' } },
    music: 'street',
  });
}
