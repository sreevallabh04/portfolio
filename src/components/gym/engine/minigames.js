/**
 * The rep mini-games. One per kind of equipment, each a small state machine:
 *   press(button) / release(button)   input
 *   update(dt)                        returns a result once, then null
 *   draw(ctx)                         paints into a W×H native canvas
 * A result is { grade: 'perfect' | 'good' | 'miss', note }.
 *
 * `difficulty` runs 0 → 1. `mods` carries the battle buffs:
 *   zone  multiplies target sizes and timing windows (chalk, focus)
 *   speed multiplies how fast things move (pre-workout slows them)
 */
import { drawText, textWidth } from './font';

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const INK = '#0b0c10';
const PANEL = '#12141b';
const TRACK = '#1d2029';
const GOLD = '#ffcc3d';
const GREEN = '#3ee08f';
const RED = '#ff3b4c';
const WHITE = '#f4f5f8';
const DIM = '#6b7282';

function frame(ctx, W, H) {
  ctx.fillStyle = PANEL;
  ctx.fillRect(0, 0, W, H);
}

function label(ctx, text, x, y, color = DIM, align = 'left') {
  const w = textWidth(text);
  const lx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  drawText(ctx, text, Math.round(lx), y, color);
}

class Base {
  constructor({ difficulty = 0.3, mods = {}, W = 240, H = 44, audio }) {
    this.d = clamp(difficulty, 0, 1);
    this.zone = mods.zone || 1;
    this.speed = mods.speed || 1;
    this.W = W;
    this.H = H;
    this.audio = audio;
    this.t = 0;
    this.done = null;
    this.reported = false;
    this.flash = 0;
    this.verdict = null;
  }

  finish(grade, note) {
    if (this.done) return;
    this.done = { grade, note };
    this.verdict = grade;
    this.flash = 0.45;
    this.audio?.play(grade === 'perfect' ? 'perfect' : grade === 'good' ? 'good' : 'miss');
  }

  update(dt) {
    this.t += dt;
    if (this.done) {
      this.flash -= dt;
      if (this.flash <= 0 && !this.reported) {
        this.reported = true;
        return this.done;
      }
      return null;
    }
    this.step(dt);
    return null;
  }

  drawVerdict(ctx) {
    if (!this.verdict) return;
    const text = { perfect: 'PERFECT!', good: 'GOOD', miss: 'MISS' }[this.verdict];
    const color = { perfect: GOLD, good: GREEN, miss: RED }[this.verdict];
    const w = textWidth(text) * 2 + 8;
    const x = Math.round(this.W / 2 - w / 2);
    ctx.fillStyle = INK;
    ctx.fillRect(x, 2, w, 14);
    drawText(ctx, text, x + 4, 4, color, { scale: 2 });
  }
}

/* ---------------------------------------------------- power meter (bar) */

export class PowerMeter extends Base {
  static hint = 'PRESS A IN THE GOLD';

  constructor(opts) {
    super(opts);
    this.x0 = 18;
    this.x1 = this.W - 18;
    const width = this.x1 - this.x0;
    const green = clamp(lerp(0.34, 0.13, this.d) * this.zone, 0.08, 0.6) * width;
    const center = this.x0 + width * (0.3 + Math.random() * 0.45);
    this.g0 = center - green / 2;
    this.g1 = center + green / 2;
    const gold = green * 0.3;
    this.p0 = center - gold / 2;
    this.p1 = center + gold / 2;
    this.v = lerp(1.0, 2.3, this.d) * this.speed * width;
    this.cursor = this.x0;
    this.dir = 1;
    this.passes = 0;
  }

  step(dt) {
    this.cursor += this.dir * this.v * dt;
    if (this.cursor >= this.x1) {
      this.cursor = this.x1;
      this.dir = -1;
      this.passes++;
    } else if (this.cursor <= this.x0) {
      this.cursor = this.x0;
      this.dir = 1;
      this.passes++;
    }
    if (this.passes >= 4) this.finish('miss', 'TOO SLOW');
  }

  press(button) {
    if (button !== 'a' || this.done) return;
    const c = this.cursor;
    if (c >= this.p0 && c <= this.p1) this.finish('perfect');
    else if (c >= this.g0 && c <= this.g1) this.finish('good');
    else this.finish('miss', c < this.g0 ? 'TOO EARLY' : 'TOO LATE');
  }

  draw(ctx) {
    const { W, H } = this;
    frame(ctx, W, H);
    const y = 20;
    ctx.fillStyle = INK;
    ctx.fillRect(this.x0 - 2, y - 2, this.x1 - this.x0 + 4, 14);
    ctx.fillStyle = TRACK;
    ctx.fillRect(this.x0, y, this.x1 - this.x0, 10);
    for (let x = this.x0; x <= this.x1; x += 8) {
      ctx.fillStyle = '#2a2e3a';
      ctx.fillRect(Math.round(x), y + 8, 1, 2);
    }
    ctx.fillStyle = '#1f7a4c';
    ctx.fillRect(Math.round(this.g0), y, Math.round(this.g1 - this.g0), 10);
    ctx.fillStyle = GREEN;
    ctx.fillRect(Math.round(this.g0), y, Math.round(this.g1 - this.g0), 2);
    ctx.fillStyle = GOLD;
    ctx.fillRect(Math.round(this.p0), y, Math.max(2, Math.round(this.p1 - this.p0)), 10);
    const c = Math.round(this.cursor);
    ctx.fillStyle = INK;
    ctx.fillRect(c - 2, y - 6, 5, 20);
    ctx.fillStyle = WHITE;
    ctx.fillRect(c - 1, y - 5, 3, 3);
    ctx.fillRect(c, y - 2, 1, 14);
    label(ctx, 'BAR SPEED', this.x0, 36);
    label(ctx, this.done ? this.done.note || '' : 'A = LOCK OUT', this.x1, 36, DIM, 'right');
    this.drawVerdict(ctx);
  }
}

/* ----------------------------------------------------- grind (machines) */

export class Grind extends Base {
  static hint = 'MASH A TO DRIVE THE WEIGHT';

  constructor(opts) {
    super(opts);
    const d = Math.min(this.d, 0.9);
    this.push = lerp(0.2, 0.12, d) * (this.zone > 1 ? 1 + (this.zone - 1) * 0.6 : 1);
    this.drain = lerp(0.2, 0.45, d) * this.speed;
    this.limit = lerp(2.8, 2.2, d);
    this.fill = 0;
    this.kick = 0;
  }

  step(dt) {
    this.fill = Math.max(0, this.fill - this.drain * dt * (this.fill > 0 ? 1 : 0));
    this.kick = Math.max(0, this.kick - dt * 6);
    if (this.fill >= 1) this.finish(this.t < this.limit * 0.55 ? 'perfect' : 'good');
    else if (this.t >= this.limit) this.finish('miss', 'STALLED');
  }

  press(button) {
    if (button !== 'a' || this.done) return;
    this.fill = Math.min(1, this.fill + this.push);
    this.kick = 1;
    this.audio?.play('mash');
  }

  draw(ctx) {
    const { W, H } = this;
    frame(ctx, W, H);
    const x0 = 18;
    const x1 = W - 18;
    const y = 18;
    ctx.fillStyle = INK;
    ctx.fillRect(x0 - 2, y - 2, x1 - x0 + 4, 14);
    ctx.fillStyle = TRACK;
    ctx.fillRect(x0, y, x1 - x0, 10);
    const w = Math.round((x1 - x0) * this.fill);
    const hot = this.fill > 0.75 ? GOLD : this.fill > 0.4 ? '#ff8a3d' : RED;
    ctx.fillStyle = hot;
    ctx.fillRect(x0, y, w, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(x0, y, w, 2);
    // timer
    const left = clamp(1 - this.t / this.limit, 0, 1);
    ctx.fillStyle = '#2a2e3a';
    ctx.fillRect(x0, y + 14, x1 - x0, 2);
    ctx.fillStyle = left < 0.3 ? RED : WHITE;
    ctx.fillRect(x0, y + 14, Math.round((x1 - x0) * left), 2);
    const pulse = this.kick > 0.5 ? 1 : 0;
    label(ctx, 'MASH A!', W / 2, 6 - pulse, this.done ? DIM : WHITE, 'center');
    label(ctx, 'DRIVE', x0, 36);
    label(ctx, this.done ? this.done.note || '' : `${Math.round(this.fill * 100)}%`, x1, 36, DIM, 'right');
    this.drawVerdict(ctx);
  }
}

/* ------------------------------------------------------ tempo (cables) */

export class Tempo extends Base {
  static hint = 'PRESS A ON THE BEAT';

  constructor(opts) {
    super(opts);
    this.hitX = 34;
    this.v = lerp(95, 150, this.d) * this.speed;
    const perfectMs = lerp(80, 50, this.d) * this.zone;
    const goodMs = lerp(160, 105, this.d) * this.zone;
    this.perfectPx = (perfectMs / 1000) * this.v;
    this.goodPx = (goodMs / 1000) * this.v;
    const gap = lerp(62, 44, this.d);
    const start = this.W + 6;
    this.notes = [
      { x: start, label: 'PULL', grade: null },
      { x: start + gap, label: 'SQUEEZE', grade: null },
    ];
    if (this.d > 0.65) this.notes.push({ x: start + gap * 1.7, label: 'BACK', grade: null });
    this.ring = 0;
  }

  step(dt) {
    this.ring = Math.max(0, this.ring - dt * 5);
    for (const note of this.notes) {
      note.x -= this.v * dt;
      if (!note.grade && note.x < this.hitX - this.goodPx) {
        note.grade = 'miss';
        this.audio?.play('miss');
      }
    }
    if (this.notes.every((n) => n.grade)) {
      const grades = this.notes.map((n) => n.grade);
      this.finish(
        grades.includes('miss') ? 'miss' : grades.every((g) => g === 'perfect') ? 'perfect' : 'good',
        grades.includes('miss') ? 'OFF BEAT' : ''
      );
    }
  }

  press(button) {
    if (button !== 'a' || this.done) return;
    this.ring = 1;
    const note = this.notes.find((n) => !n.grade);
    if (!note) return;
    const dx = Math.abs(note.x - this.hitX);
    if (dx <= this.perfectPx) {
      note.grade = 'perfect';
      this.audio?.play('tick');
    } else if (dx <= this.goodPx) {
      note.grade = 'good';
      this.audio?.play('tick');
    } else if (dx <= this.goodPx * 2.2) {
      note.grade = 'miss';
      this.audio?.play('miss');
    }
  }

  draw(ctx) {
    const { W, H } = this;
    frame(ctx, W, H);
    const y = 24;
    ctx.fillStyle = TRACK;
    ctx.fillRect(8, y - 1, W - 16, 3);
    // hit ring
    const r = 7 + Math.round(this.ring * 2);
    ctx.fillStyle = INK;
    ctx.fillRect(this.hitX - r - 1, y - r - 1, r * 2 + 3, r * 2 + 3);
    ctx.fillStyle = this.ring > 0.3 ? GOLD : '#3a3f4e';
    ctx.fillRect(this.hitX - r, y - r, r * 2 + 1, r * 2 + 1);
    ctx.fillStyle = PANEL;
    ctx.fillRect(this.hitX - r + 2, y - r + 2, r * 2 - 3, r * 2 - 3);
    for (const note of this.notes) {
      const x = Math.round(note.x);
      if (x < -10 || x > W + 10) continue;
      const color = note.grade === 'perfect' ? GOLD : note.grade === 'good' ? GREEN : note.grade === 'miss' ? RED : WHITE;
      ctx.fillStyle = INK;
      ctx.fillRect(x - 5, y - 5, 11, 11);
      ctx.fillStyle = color;
      ctx.fillRect(x - 4, y - 4, 9, 9);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(x - 4, y - 4, 9, 2);
      label(ctx, note.label, x, y + 9, note.grade ? color : DIM, 'center');
    }
    label(ctx, 'TEMPO', 8, 4);
    this.drawVerdict(ctx);
  }
}

/* ------------------------------------------------- control (bodyweight) */

export class Control extends Base {
  static hint = 'HOLD A TO PULL. STAY IN THE ZONE';

  constructor(opts) {
    super(opts);
    this.x0 = 14;
    this.x1 = this.W - 14;
    this.width = this.x1 - this.x0;
    this.zoneW = clamp(lerp(0.34, 0.2, this.d) * this.zone, 0.12, 0.6) * this.width;
    this.marker = 0.12 * this.width;
    this.vel = 0;
    this.holding = false;
    this.progress = 0;
    this.rate = 1 / lerp(1.3, 1.8, this.d);
    this.limit = lerp(4.6, 3.9, this.d);
    this.phase = Math.random() * 10;
    this.omega = lerp(1.2, 2.2, this.d) * this.speed;
    this.left = false;
  }

  zoneCenter() {
    const t = this.t * this.omega + this.phase;
    const s = Math.sin(t) * 0.6 + Math.sin(t * 1.9 + 1.3) * 0.4;
    return this.width * (0.5 + s * 0.32);
  }

  step(dt) {
    const accel = this.holding ? 400 : -330;
    this.vel = clamp(this.vel + accel * dt, -135, 135);
    this.marker += this.vel * dt;
    if (this.marker < 0) {
      this.marker = 0;
      this.vel = 0;
    } else if (this.marker > this.width) {
      this.marker = this.width;
      this.vel = -this.vel * 0.3;
    }
    const center = this.zoneCenter();
    const inside = Math.abs(this.marker - center) <= this.zoneW / 2;
    this.inside = inside;
    this.progress = clamp(this.progress + (inside ? this.rate : -0.35) * dt, 0, 1);
    if (!inside && this.progress > 0.15) this.left = true;
    if (this.progress >= 1) this.finish(this.left ? 'good' : 'perfect');
    else if (this.t >= this.limit) this.finish('miss', 'NO LOCKOUT');
  }

  press(button) {
    if (button === 'a') this.holding = true;
  }

  release(button) {
    if (button === 'a') this.holding = false;
  }

  draw(ctx) {
    const { W, H } = this;
    frame(ctx, W, H);
    const y = 14;
    ctx.fillStyle = INK;
    ctx.fillRect(this.x0 - 2, y - 2, this.width + 4, 16);
    ctx.fillStyle = TRACK;
    ctx.fillRect(this.x0, y, this.width, 12);
    const center = this.zoneCenter();
    const zx = Math.round(this.x0 + center - this.zoneW / 2);
    ctx.fillStyle = this.inside ? '#2a8f5a' : '#1f5a3d';
    ctx.fillRect(zx, y, Math.round(this.zoneW), 12);
    ctx.fillStyle = GREEN;
    ctx.fillRect(zx, y, Math.round(this.zoneW), 2);
    const mx = Math.round(this.x0 + this.marker);
    ctx.fillStyle = INK;
    ctx.fillRect(mx - 3, y - 4, 7, 20);
    ctx.fillStyle = WHITE;
    ctx.fillRect(mx - 2, y - 3, 5, 18);
    ctx.fillStyle = RED;
    ctx.fillRect(mx - 1, y + 4, 3, 4);
    // progress
    ctx.fillStyle = '#2a2e3a';
    ctx.fillRect(this.x0, y + 18, this.width, 3);
    ctx.fillStyle = GOLD;
    ctx.fillRect(this.x0, y + 18, Math.round(this.width * this.progress), 3);
    label(ctx, this.holding ? 'PULLING' : 'HOLD A', this.x0, 36, this.holding ? WHITE : DIM);
    const left = Math.max(0, this.limit - this.t);
    label(ctx, this.done ? this.done.note || '' : `${left.toFixed(1)}S`, this.x1, 36, left < 1.2 ? RED : DIM, 'right');
    this.drawVerdict(ctx);
  }
}

/* ------------------------------------------------ alternate (dumbbells) */

export class Alternate extends Base {
  static hint = 'PRESS LEFT / RIGHT AS THEY LIGHT UP';

  constructor(opts) {
    super(opts);
    const count = this.d > 0.55 ? 3 : 2;
    this.sequence = Array.from({ length: count }, (_, i) =>
      this.d < 0.35 ? (i % 2 ? 'right' : 'left') : Math.random() > 0.5 ? 'left' : 'right'
    );
    this.window = lerp(0.95, 0.55, this.d) / this.speed * Math.min(1.3, this.zone);
    this.index = 0;
    this.clock = 0;
    this.grades = [];
    this.lit = 0;
  }

  step(dt) {
    this.clock += dt;
    this.lit = Math.max(0, this.lit - dt * 4);
    if (this.clock > this.window) this.resolve('miss');
  }

  resolve(grade) {
    this.grades.push(grade);
    this.index++;
    this.clock = 0;
    if (grade === 'miss') {
      this.finish('miss', 'WRONG ARM');
      return;
    }
    this.audio?.play('tick');
    if (this.index >= this.sequence.length) {
      this.finish(this.grades.every((g) => g === 'perfect') ? 'perfect' : 'good');
    }
  }

  press(button) {
    if (this.done) return;
    if (button !== 'left' && button !== 'right') return;
    const want = this.sequence[this.index];
    this.lit = 1;
    this.pressed = button;
    if (button !== want) this.resolve('miss');
    else this.resolve(this.clock < this.window * 0.45 ? 'perfect' : 'good');
  }

  drawPad(ctx, x, side) {
    const active = !this.done && this.sequence[this.index] === side;
    const size = 26;
    ctx.fillStyle = INK;
    ctx.fillRect(x - 1, 7, size + 2, size + 2);
    ctx.fillStyle = active ? '#2a2e3a' : TRACK;
    ctx.fillRect(x, 8, size, size);
    const color = active ? GOLD : this.pressed === side && this.lit > 0 ? WHITE : '#3a3f4e';
    // arrow
    const cx = x + size / 2;
    const cy = 8 + size / 2;
    // Arrow head: widest column at the base, narrowing to the tip.
    ctx.fillStyle = color;
    for (let i = 0; i < 7; i++) {
      const h = 13 - i * 2;
      const ax = side === 'left' ? cx + 1 - i : cx - 1 + i;
      ctx.fillRect(Math.round(ax), Math.round(cy - h / 2), 1, h);
    }
    ctx.fillRect(side === 'left' ? cx + 2 : cx - 7, cy - 2, 6, 5);
    if (active) {
      const left = clamp(1 - this.clock / this.window, 0, 1);
      ctx.fillStyle = left < 0.35 ? RED : GREEN;
      ctx.fillRect(x, 8 + size + 2, Math.round(size * left), 2);
    }
  }

  draw(ctx) {
    const { W, H } = this;
    frame(ctx, W, H);
    this.drawPad(ctx, W / 2 - 40, 'left');
    this.drawPad(ctx, W / 2 + 14, 'right');
    // sequence dots
    this.sequence.forEach((side, i) => {
      const g = this.grades[i];
      ctx.fillStyle = g === 'perfect' ? GOLD : g === 'good' ? GREEN : g === 'miss' ? RED : i === this.index ? WHITE : '#3a3f4e';
      ctx.fillRect(Math.round(W / 2 - this.sequence.length * 4 + i * 8), 38, 5, 3);
    });
    label(ctx, 'L ARM', 10, 18);
    label(ctx, 'R ARM', W - 10, 18, DIM, 'right');
    this.drawVerdict(ctx);
  }
}

export const MINIGAMES = { meter: PowerMeter, grind: Grind, tempo: Tempo, control: Control, alternate: Alternate };

export const MINIGAME_INFO = {
  meter: { name: 'POWER METER', hint: PowerMeter.hint, touch: 'TAP A IN THE GOLD' },
  grind: { name: 'GRIND', hint: Grind.hint, touch: 'TAP A AS FAST AS YOU CAN' },
  tempo: { name: 'TEMPO', hint: Tempo.hint, touch: 'TAP A AS EACH BEAT HITS THE RING' },
  control: { name: 'CONTROL', hint: Control.hint, touch: 'HOLD A TO RISE, LET GO TO DROP' },
  alternate: { name: 'ALTERNATE', hint: Alternate.hint, touch: 'TAP THE SIDE THAT LIGHTS UP' },
};
