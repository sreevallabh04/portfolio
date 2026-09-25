/**
 * The "opponents": whatever is loaded for the attempt, drawn from the actual
 * numbers. A 92.5 kg bench is a 20 kg bar with 25 + 10 + 1.25 per side; a 55 kg
 * pulldown is a stack pinned at the eleventh plate. Drawn at overworld pixel
 * density and scaled 3× in the battle scene.
 */
import { makeCanvas, painter, outline } from './pixel';
import { drawText, textWidth } from './font';
import { C, PLATE_COLORS, drawPlates } from './props';
import { platesPerSide } from '../gameData';

const BATTLE_PLATES = { 25: [3, 18], 20: [3, 18], 15: [3, 16], 10: [2, 13], 5: [2, 10], 2.5: [2, 8], 1.25: [1, 7] };

function canvasFor(w, h, draw) {
  const [c, ctx] = makeCanvas(w + 2, h + 2);
  ctx.translate(1, 1);
  draw(painter(ctx), ctx);
  return outline(c);
}

const kgLabel = (kg) => String(kg);

function barbell(weight, { ez = false, smith = false } = {}) {
  const fixed = weight < 20;
  const plates = fixed ? [] : platesPerSide(weight);
  const side = plates.reduce((sum, kg) => sum + BATTLE_PLATES[kg][0] + 1, 0);
  const sleeve = Math.max(10, side + 4);
  const inner = 30;
  const w = inner + sleeve * 2 + 4;
  const h = 26;
  const cy = 12;
  return canvasFor(w, h, (p, ctx) => {
    if (smith) {
      p.r(sleeve - 2, 0, 2, h, C.chrome);
      p.r(w - sleeve, 0, 2, h, C.chrome);
    }
    const x0 = 2;
    const x1 = w - 2;
    if (ez) {
      p.r(x0, cy - 1, sleeve, 2, C.chrome);
      p.r(x1 - sleeve, cy - 1, sleeve, 2, C.chrome);
      const mid = [0, 1, 1, 0, -1, -1, 0];
      const step = inner / mid.length;
      mid.forEach((dy, i) => p.r(x0 + sleeve + i * step, cy - 1 + dy, Math.ceil(step), 2, C.chrome));
    } else {
      p.r(x0, cy - 1, x1 - x0, 2, C.chrome);
      p.h(x0, cy - 1, x1 - x0, C.chromeHi);
      for (let x = x0 + sleeve + 4; x < x1 - sleeve - 4; x += 2) p.p(x, cy, C.chromeLo);
    }
    if (fixed) {
      // fixed curl bar: rubber-coated end discs
      p.r(x0 + 1, cy - 5, 4, 10, '#26282f');
      p.v(x0 + 1, cy - 4, 8, '#474b56');
      p.r(x1 - 5, cy - 5, 4, 10, '#26282f');
      p.v(x1 - 2, cy - 4, 8, '#474b56');
      drawText(ctx, kgLabel(weight), Math.round(w / 2 - textWidth(kgLabel(weight)) / 2), cy + 5, '#e7eaf0');
      return;
    }
    // collars
    p.r(x0 + sleeve - 2, cy - 3, 2, 6, C.steelLo);
    p.r(x1 - sleeve, cy - 3, 2, 6, C.steelLo);
    drawPlates(p, x0 + sleeve - 3, cy, plates, -1, BATTLE_PLATES);
    drawPlates(p, x1 - sleeve + 2, cy, plates, 1, BATTLE_PLATES);
  });
}

function stack(weight, { cable = false, handle = 'bar' } = {}) {
  const plateCount = 8;
  const selected = Math.max(1, Math.min(plateCount, Math.round(weight / 7.5)));
  const w = cable ? 44 : 24;
  const h = 30;
  return canvasFor(w, h, (p) => {
    const sx = cable ? 20 : 1;
    p.r(sx, 0, 22, h, C.frame);
    p.v(sx, 0, h, C.frameHi);
    p.v(sx + 21, 0, h, C.frameLo);
    p.r(sx + 3, 3, 16, h - 5, C.frameLo);
    p.v(sx + 5, 3, h - 5, C.chromeLo);
    p.v(sx + 16, 3, h - 5, C.chromeLo);
    for (let i = 0; i < plateCount; i++) {
      const y = h - 5 - i * 3;
      const lifted = i >= plateCount - selected;
      p.r(sx + 4, y, 14, 2, lifted ? C.stack : '#3b404c');
      p.h(sx + 4, y, 14, lifted ? C.stackHi : '#4b5160');
    }
    const pinY = h - 5 - (plateCount - selected) * 3;
    p.r(sx + 18, pinY, 4, 1, C.neonRed);
    p.r(sx + 21, pinY - 1, 2, 3, C.neonRed);
    p.v(sx + 10, 2, Math.max(1, pinY - 2), C.chrome);
    p.r(sx + 7, 0, 8, 3, C.steelHi);
    if (cable) {
      p.line(sx + 6, 1, 8, 16, C.cable);
      if (handle === 'rope') {
        p.r(6, 16, 4, 3, '#2b2f3a');
        p.line(7, 19, 3, 26, '#e2d9c0');
        p.line(8, 19, 12, 26, '#e2d9c0');
        p.r(2, 26, 3, 3, '#2b2f3a');
        p.r(11, 26, 3, 3, '#2b2f3a');
      } else if (handle === 'd') {
        p.r(5, 16, 7, 2, C.chrome);
        p.v(5, 16, 7, C.chrome);
        p.v(11, 16, 7, C.chrome);
        p.r(5, 22, 7, 2, '#2b2f3a');
      } else {
        p.r(0, 16, 18, 2, C.chrome);
        p.h(0, 16, 18, C.chromeHi);
        p.r(0, 15, 3, 4, '#2b2f3a');
        p.r(15, 15, 3, 4, '#2b2f3a');
      }
    }
  });
}

function plateLoaded(weight) {
  const plates = platesPerSide(weight, { bar: 0 }).slice(0, 6);
  const side = plates.reduce((sum, kg) => sum + BATTLE_PLATES[kg][0] + 1, 0);
  const w = 30 + side * 2 + 8;
  const h = 28;
  return canvasFor(w, h, (p) => {
    const mid = w / 2;
    // sled frame
    p.r(mid - 13, 3, 26, 18, C.steel);
    p.h(mid - 13, 3, 26, C.steelHi);
    p.r(mid - 13, 19, 26, 2, C.steelLo);
    for (let x = mid - 11; x < mid + 12; x += 3) for (let y = 5; y < 18; y += 3) p.p(x, y, C.steelLo);
    p.r(mid - 3, 21, 6, 5, C.frame);
    p.r(mid - 15, 25, 30, 3, C.frameLo);
    // horns
    const hornL = mid - 13;
    const hornR = mid + 13;
    p.r(hornL - side - 3, 11, side + 3, 2, C.steelLo);
    p.r(hornR, 11, side + 3, 2, C.steelLo);
    drawPlates(p, hornL - 1, 12, plates, -1, BATTLE_PLATES);
    drawPlates(p, hornR + 1, 12, plates, 1, BATTLE_PLATES);
  });
}

function dumbbells(weight) {
  const size = Math.max(0, Math.min(8, Math.round(weight / 4)));
  const headW = 4 + Math.floor(size / 3);
  const headH = 9 + size;
  const handle = 5;
  const one = headW * 2 + handle;
  const w = one * 2 + 8;
  const h = headH + 3;
  return canvasFor(w, h, (p) => {
    const draw = (x, y) => {
      const head = (hx) => {
        p.r(hx, y, headW, headH, '#2c3039');
        p.h(hx, y, headW, '#6b7282');
        p.v(hx, y + 1, headH - 2, '#474d5a');
        p.h(hx, y + headH - 1, headW, '#17191e');
      };
      head(x);
      p.r(x + headW, y + Math.floor(headH / 2) - 1, handle, 3, C.chrome);
      p.h(x + headW, y + Math.floor(headH / 2) - 1, handle, C.chromeHi);
      head(x + headW + handle);
    };
    draw(0, 0);
    draw(one + 8, 2);
  });
}

function bodyweight(extra = 0, kind = 'bar') {
  const w = 44;
  const h = 30;
  return canvasFor(w, h, (p, ctx) => {
    p.r(3, 1, 3, 27, C.frame);
    p.v(3, 1, 27, C.frameHi);
    p.r(38, 1, 3, 27, C.frame);
    p.v(38, 1, 27, C.frameHi);
    p.r(0, 27, 44, 3, C.frameLo);
    if (kind === 'dip') {
      p.r(6, 12, 10, 2, C.chrome);
      p.r(28, 12, 10, 2, C.chrome);
      pad3(p, 16, 5, 12, 16);
    } else {
      p.r(1, 2, 42, 2, C.chrome);
      p.h(1, 2, 42, C.chromeHi);
      p.r(14, 2, 3, 2, '#ffffff');
      p.r(27, 2, 3, 2, '#ffffff');
    }
    if (extra > 0) {
      p.line(18, 12, 22, 17, '#9aa0ad');
      p.line(26, 12, 22, 17, '#9aa0ad');
      const [base, hi, lo] = PLATE_COLORS[extra >= 20 ? 20 : extra >= 10 ? 10 : 5];
      p.ellipse(22, 21, 4, 4, base);
      p.ellipse(22, 21, 2, 2, lo);
      p.p(22, 21, '#0b0c10');
      p.p(20, 18, hi);
    } else {
      drawText(ctx, 'BW', 22 - Math.ceil(textWidth('BW') / 2), 16, '#6b7282');
    }
  });
}

function pad3(p, x, y, w, h) {
  p.r(x, y, w, h, C.pad);
  p.h(x, y, w, C.padHi);
  p.r(x, y + h - 2, w, 2, C.padLo);
}

/** Picks the sprite for an exercise at a given target weight. */
export function enemySprite(exercise, weight) {
  const name = exercise.name.toLowerCase();
  switch (exercise.kind) {
    case 'barbell':
      return barbell(weight);
    case 'ezbar':
      return barbell(weight, { ez: true });
    case 'smith':
      return barbell(weight, { smith: true });
    case 'cable':
      return stack(weight, {
        cable: true,
        handle: /rope|face pull/.test(name) ? 'rope' : /single|one|lateral|fly|crossover|v grip|row/.test(name) ? 'd' : 'bar',
      });
    case 'stack':
      return stack(weight);
    case 'plates':
      return plateLoaded(weight);
    case 'dumbbell':
      return dumbbells(weight);
    case 'weighted':
      return bodyweight(weight, /dip/.test(name) ? 'dip' : 'bar');
    default:
      return bodyweight(0, /dip/.test(name) ? 'dip' : 'bar');
  }
}
