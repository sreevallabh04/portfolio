/**
 * The overworld: grid movement in the style of the GBA-era handhelds, NPCs,
 * tap-to-walk pathfinding, depth-sorted drawing and the lighting pass.
 * Plain JS rather than React state — it runs every frame.
 */
import { TILE, makeCanvas, painter } from './pixel';
import { drawText, textWidth } from './font';

const T = TILE;
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const WALK_TIME = 0.2;
const RUN_TIME = 0.115;
const NPC_TIME = 0.34;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** Bakes soft floor shadows under every object into a copy of the background. */
function withShadows(map) {
  const [canvas, ctx] = makeCanvas(map.bg.width, map.bg.height);
  ctx.drawImage(map.bg, 0, 0);
  const p = painter(ctx);
  for (const o of map.objects) {
    const cx = (o.x + o.w / 2) * T;
    const cy = (o.y + o.h) * T - 3;
    p.ellipse(cx, cy, Math.max(6, o.w * T * 0.46), 3, 'rgba(0,0,0,0.28)');
  }
  return canvas;
}

export class World {
  constructor({ canvas, maps, chars, input, audio, hooks }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.maps = maps;
    this.chars = chars;
    this.input = input;
    this.audio = audio;
    this.hooks = hooks;
    this.scale = 3;
    this.viewW = 320;
    this.viewH = 180;
    this.safeBottom = 0;
    this.paused = true;
    this.time = 0;
    this.last = 0;
    this.raf = 0;
    this.status = {};
    this.fade = 0;
    this.fadeTarget = 0;
    this.fadeSpeed = 4;
    this.fadeResolve = null;
    this.focus = null;
    this.bumpCooldown = 0;
    this.stepParity = false;
    this.reducedMotion =
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.backgrounds = {};
    this.particles = [];
    this.rain = [];
    this.layer = null;
    this.loop = this.loop.bind(this);
  }

  /* -------------------------------------------------------- lifecycle */

  start() {
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  loop(now) {
    // rAF timestamps can precede the performance.now() taken in start(), so
    // the first delta may be slightly negative; never let time run backwards.
    const raw = (now - this.last) / 1000;
    const dt = Number.isFinite(raw) ? Math.max(0, Math.min(0.05, raw)) : 0;
    this.last = Number.isFinite(now) ? now : performance.now();
    if (!Number.isFinite(this.time)) this.time = 0;
    // Nothing to draw while a full-screen scene (a battle, the credits) covers it.
    if (!this.hidden) {
      try {
        this.update(dt);
        this.render();
      } catch (error) {
        // One bad frame must not freeze the game on a black canvas.
        if (!this.reportedError) {
          this.reportedError = true;
          console.error('[gym] frame error', error);
        }
      }
    }
    this.raf = requestAnimationFrame(this.loop);
  }

  resize(cssW, cssH, safeBottomCss = 0) {
    const scale = clamp(Math.floor(Math.min(cssW / 256, cssH / 176)), 2, 6);
    this.scale = scale;
    this.viewW = Math.ceil(cssW / scale);
    this.viewH = Math.ceil(cssH / scale);
    this.safeBottom = Math.round(safeBottomCss / scale);
    this.canvas.width = this.viewW;
    this.canvas.height = this.viewH;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    return { scale, width: this.viewW * scale, height: this.viewH * scale };
  }

  setMap(id, spawn) {
    this.map = this.maps[id];
    if (!this.backgrounds[id]) this.backgrounds[id] = withShadows(this.map);
    const s = spawn || this.map.spawn;
    this.player = {
      x: s.x,
      y: s.y,
      px: s.x * T,
      py: s.y * T,
      dir: s.dir || 'down',
      moving: false,
      fromX: s.x,
      fromY: s.y,
      t: 0,
      turn: 0,
      walkAnim: 0,
    };
    this.npcs = this.map.npcs.map((n) => ({
      ...n,
      px: n.x * T,
      py: n.y * T,
      moving: false,
      t: 0,
      wait: 1.5 + Math.random() * 2,
      phase: Math.random() * 10,
    }));
    this.path = null;
    this.zone = this.zoneAt(s.x, s.y);
    this.particles = [];
    this.rain = [];
    if (id === 'gym') this.seedDust();
    if (id === 'street') this.seedRain();
    this.updateFocus();
  }

  setPaused(paused) {
    this.paused = paused;
    if (paused) {
      this.path = null;
      this.setFocus(null);
    } else this.updateFocus();
  }

  /** Holds the victory pose for a moment (the mirror). */
  flex(ms = 1500) {
    if (this.player) this.player.flexUntil = performance.now() + ms;
  }

  setStatus(status) {
    this.status = status || {};
  }

  /** Resolves once the screen has faded to `target` (0 clear, 1 black). */
  fadeTo(target, seconds = 0.3) {
    this.fadeTarget = target;
    this.fadeSpeed = 1 / Math.max(0.01, seconds);
    // A newer fade supersedes an older one; settle the old waiter first.
    this.fadeResolve?.();
    return new Promise((resolve) => {
      this.fadeResolve = resolve;
    });
  }

  /* ---------------------------------------------------------- queries */

  zoneAt(x, y) {
    let found = null;
    for (const zone of this.map.zones) {
      if (x >= zone.x && x < zone.x + zone.w && y >= zone.y && y < zone.y + zone.h) found = zone;
    }
    return found;
  }

  npcAt(x, y) {
    return (
      this.npcs.find(
        (n) =>
          n.solid !== false &&
          ((n.x === x && n.y === y) || (n.moving && n.toX === x && n.toY === y))
      ) || null
    );
  }

  blocked(x, y, { ignorePlayer = true } = {}) {
    const { w, h, solid } = this.map;
    if (x < 0 || y < 0 || x >= w || y >= h) return true;
    if (solid[y * w + x]) return true;
    if (this.npcAt(x, y)) return true;
    if (!ignorePlayer) {
      const p = this.player;
      if ((p.x === x && p.y === y) || (p.moving && p.fromX === x && p.fromY === y)) return true;
    }
    return false;
  }

  facingTile() {
    const [dx, dy] = DIRS[this.player.dir];
    return [this.player.x + dx, this.player.y + dy];
  }

  targetAt(x, y) {
    const npc = this.npcs.find((n) => n.x === x && n.y === y && n.id !== 'runner');
    if (npc) return { type: 'npc', id: npc.id, npc, name: npc.id };
    const runner = this.npcs.find((n) => n.id === 'runner' && n.x === x && (n.y === y || n.y + 1 === y));
    if (runner) return { type: 'npc', id: runner.id, npc: runner };
    const object = this.map.objectAt(x, y);
    if (object) return { type: 'object', id: object.id, object };
    if (y <= 1 && this.map.id === 'gym') return { type: 'wall', id: `wall-${x}`, x };
    if (y <= 6 && this.map.id === 'street') return { type: 'wall', id: `facade-${x}`, x };
    return null;
  }

  updateFocus() {
    if (!this.player || this.paused || this.player.moving) return;
    const [fx, fy] = this.facingTile();
    const target = this.targetAt(fx, fy);
    this.setFocus(target && target.type !== 'wall' ? target : null);
  }

  setFocus(target) {
    const key = target ? target.id : null;
    if (key === (this.focus ? this.focus.id : null)) return;
    this.focus = target;
    this.hooks.onFocus?.(target);
  }

  /* ------------------------------------------------------------ input */

  interact() {
    if (this.paused || !this.player || this.player.moving) return;
    const [fx, fy] = this.facingTile();
    const target = this.targetAt(fx, fy);
    if (!target) return;
    if (target.type === 'npc' && target.npc.id !== 'runner' && target.npc.anim !== 'sleep') {
      const opposite = { up: 'down', down: 'up', left: 'right', right: 'left' };
      target.npc.dir = opposite[this.player.dir];
    }
    this.hooks.onInteract?.(target);
  }

  /** Tap or click on the canvas: walk there, and interact if it was a thing. */
  pointer(clientX, clientY) {
    if (this.paused || !this.player) return;
    const rect = this.canvas.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * this.viewW + this.camX;
    const ny = ((clientY - rect.top) / rect.height) * this.viewH + this.camY;

    // Topmost sprite under the pointer wins, so tapping the tall part of a
    // rack still counts as tapping the rack.
    const hits = [];
    for (const o of this.map.objects) {
      const x0 = o.x * T + o.ox;
      const y0 = o.y * T + o.oy;
      if (nx >= x0 && nx < x0 + o.canvas.width && ny >= y0 && ny < y0 + o.canvas.height) {
        hits.push({ sort: (o.y + o.h) * T, footprint: o });
      }
    }
    for (const n of this.npcs) {
      if (nx >= n.px && nx < n.px + T && ny >= n.py - 4 + (n.oy || 0) && ny < n.py + T + (n.oy || 0)) {
        hits.push({ sort: n.py + T + 1, footprint: { x: n.x, y: n.y, w: 1, h: n.id === 'runner' ? 2 : 1 } });
      }
    }
    hits.sort((a, b) => b.sort - a.sort);
    const tx = Math.floor(nx / T);
    const ty = Math.floor(ny / T);

    if (hits.length) {
      const f = hits[0].footprint;
      const path = this.pathToAdjacent(f);
      if (path) this.path = { steps: path.steps, face: path.face, interact: true };
      else this.audio?.play('bump');
      return;
    }
    if (!this.blocked(tx, ty)) {
      const steps = this.findPath(tx, ty);
      if (steps) this.path = { steps, interact: false };
    }
  }

  findPath(tx, ty) {
    const goal = (x, y) => x === tx && y === ty;
    const result = this.bfs(goal);
    return result ? result.steps : null;
  }

  pathToAdjacent(f) {
    const inside = (x, y) => x >= f.x && x < f.x + f.w && y >= f.y && y < f.y + f.h;
    const goal = (x, y) => {
      if (inside(x, y) || this.blocked(x, y)) return false;
      return Object.values(DIRS).some(([dx, dy]) => inside(x + dx, y + dy));
    };
    const result = this.bfs(goal);
    if (!result) return null;
    const face = Object.entries(DIRS).find(([, [dx, dy]]) => inside(result.x + dx, result.y + dy))[0];
    return { steps: result.steps, face };
  }

  bfs(goal) {
    const { w, h } = this.map;
    const start = [this.player.x, this.player.y];
    if (goal(start[0], start[1])) return { steps: [], x: start[0], y: start[1] };
    const prev = new Int32Array(w * h).fill(-1);
    const seen = new Uint8Array(w * h);
    const queue = [start[1] * w + start[0]];
    seen[queue[0]] = 1;
    while (queue.length) {
      const idx = queue.shift();
      const x = idx % w;
      const y = (idx - x) / w;
      for (const [name, [dx, dy]] of Object.entries(DIRS)) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const ni = ny * w + nx;
        if (seen[ni] || this.blocked(nx, ny)) continue;
        seen[ni] = 1;
        prev[ni] = idx;
        if (goal(nx, ny)) {
          const steps = [];
          let cur = ni;
          while (cur !== start[1] * w + start[0]) {
            const cx = cur % w;
            const cy = (cur - cx) / w;
            const px = prev[cur] % w;
            const py = (prev[cur] - px) / w;
            steps.unshift(Object.entries(DIRS).find(([, [ddx, ddy]]) => px + ddx === cx && py + ddy === cy)[0]);
            cur = prev[cur];
          }
          void name;
          return { steps, x: nx, y: ny };
        }
        queue.push(ni);
      }
    }
    return null;
  }

  /* ----------------------------------------------------------- update */

  update(dt) {
    this.time += dt;
    this.bumpCooldown = Math.max(0, this.bumpCooldown - dt);

    if (this.fade !== this.fadeTarget) {
      const step = this.fadeSpeed * dt;
      this.fade =
        this.fade < this.fadeTarget
          ? Math.min(this.fadeTarget, this.fade + step)
          : Math.max(this.fadeTarget, this.fade - step);
      if (this.fade === this.fadeTarget && this.fadeResolve) {
        const resolve = this.fadeResolve;
        this.fadeResolve = null;
        resolve();
      }
    } else if (this.fadeResolve) {
      const resolve = this.fadeResolve;
      this.fadeResolve = null;
      resolve();
    }

    if (!this.map) return;
    this.updateNpcs(dt);
    this.updateParticles(dt);
    if (!this.paused) this.updatePlayer(dt);
    else if (this.player.moving) this.advance(dt);
  }

  desiredDirection() {
    const manual = this.input?.direction();
    if (manual) return { dir: manual, auto: false };
    if (this.path) {
      if (this.path.steps.length) return { dir: this.path.steps[0], auto: true };
      return null;
    }
    const dir = this.input?.direction();
    return dir ? { dir, auto: false } : null;
  }

  updatePlayer(dt) {
    const p = this.player;
    if (p.moving) {
      this.advance(dt);
      return;
    }
    // Arrived at the end of a tap path: face the thing and use it.
    if (this.path && !this.path.steps.length) {
      const { face, interact } = this.path;
      this.path = null;
      if (face) p.dir = face;
      this.updateFocus();
      if (interact) this.interact();
      return;
    }
    const want = this.desiredDirection();
    if (!want) {
      p.walkAnim = 0;
      return;
    }
    if (!want.auto && this.path) this.path = null;
    if (want.dir !== p.dir) {
      p.dir = want.dir;
      p.turn = want.auto ? 0 : 0.075;
      this.updateFocus();
      if (!want.auto) return;
    }
    if (p.turn > 0) {
      p.turn -= dt;
      return;
    }
    const [dx, dy] = DIRS[p.dir];
    const nx = p.x + dx;
    const ny = p.y + dy;
    if (this.blocked(nx, ny)) {
      if (this.path) this.path = null;
      p.walkAnim += dt;
      if (this.bumpCooldown <= 0) {
        this.audio?.play('bump');
        this.bumpCooldown = 0.32;
      }
      return;
    }
    if (this.path) this.path.steps.shift();
    this.setFocus(null);
    p.moving = true;
    p.fromX = p.x;
    p.fromY = p.y;
    p.x = nx;
    p.y = ny;
    p.t = 0;
    p.running = !!(this.input?.held.has('b') || this.input?.held.has('run'));
    this.stepParity = !this.stepParity;
  }

  advance(dt) {
    const p = this.player;
    p.t += dt / (p.running ? RUN_TIME : WALK_TIME);
    if (p.t >= 1) {
      p.t = 1;
      p.moving = false;
      p.px = p.x * T;
      p.py = p.y * T;
      this.arrive();
      return;
    }
    p.px = (p.fromX + (p.x - p.fromX) * p.t) * T;
    p.py = (p.fromY + (p.y - p.fromY) * p.t) * T;
  }

  arrive() {
    const p = this.player;
    const trigger = this.map.triggers.find((t) => t.x === p.x && t.y === p.y);
    if (trigger) {
      this.path = null;
      this.hooks.onTrigger?.(trigger);
      return;
    }
    const zone = this.zoneAt(p.x, p.y);
    if (zone && zone !== this.zone) this.hooks.onZone?.(zone);
    this.zone = zone || this.zone;
    this.updateFocus();
    // Keep walking without a stop frame if the direction is still held.
    if (!this.paused) {
      const want = this.desiredDirection();
      if (want && want.dir === p.dir) this.updatePlayer(0);
    }
  }

  updateNpcs(dt) {
    for (const n of this.npcs) {
      if (n.moving) {
        n.t += dt / NPC_TIME;
        if (n.t >= 1) {
          n.moving = false;
          n.x = n.toX;
          n.y = n.toY;
          n.px = n.x * T;
          n.py = n.y * T;
          // Someone may have just walked into, or out of, the tile you face.
          this.updateFocus();
        } else {
          n.px = (n.x + (n.toX - n.x) * n.t) * T;
          n.py = (n.y + (n.toY - n.y) * n.t) * T;
        }
        continue;
      }
      if (!n.wander || this.paused) continue;
      n.wait -= dt;
      if (n.wait > 0) continue;
      n.wait = 1.2 + Math.random() * 2.6;
      const options = Object.keys(DIRS);
      const dir = options[Math.floor(Math.random() * options.length)];
      const [dx, dy] = DIRS[dir];
      const tx = n.x + dx;
      const ty = n.y + dy;
      const r = n.wander;
      n.dir = dir;
      const inArea = tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h;
      const p = this.player;
      const playerThere = (p.x === tx && p.y === ty) || (p.fromX === tx && p.fromY === ty && p.moving);
      if (inArea && !playerThere && !this.blocked(tx, ty)) {
        n.moving = true;
        n.toX = tx;
        n.toY = ty;
        n.t = 0;
      }
    }
  }

  seedDust() {
    const lights = [
      [3.5, 4.5], [16, 3.5], [13.5, 9], [17, 13.5], [27.5, 4.5], [23, 9.5], [4.5, 18], [11, 19],
    ];
    for (let i = 0; i < 42; i++) {
      const [lx, ly] = lights[i % lights.length];
      this.particles.push({
        x: (lx + (Math.random() - 0.5) * 5) * T,
        y: (ly + (Math.random() - 0.5) * 4) * T,
        vx: (Math.random() - 0.5) * 3,
        vy: -1 - Math.random() * 2,
        life: Math.random() * 6,
        max: 5 + Math.random() * 5,
      });
    }
  }

  seedRain() {
    if (this.reducedMotion) return;
    for (let i = 0; i < 70; i++) {
      this.rain.push({ x: Math.random() * this.map.w * T, y: Math.random() * this.map.h * T, v: 170 + Math.random() * 80 });
    }
  }

  updateParticles(dt) {
    if (this.reducedMotion) return;
    for (const d of this.particles) {
      d.life += dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      if (d.life > d.max) {
        d.life = 0;
        d.y += (d.max * -d.vy) * 0.9;
      }
    }
    const maxY = this.map.h * T;
    for (const r of this.rain) {
      r.y += r.v * dt;
      r.x -= r.v * dt * 0.18;
      if (r.y > maxY || r.x < 0) {
        r.y = -8;
        r.x = Math.random() * (this.map.w * T + 60);
        r.splash = 0;
      }
    }
  }

  /* ----------------------------------------------------------- render */

  camera() {
    const map = this.map;
    const mw = map.w * T;
    const mh = map.h * T;
    const usableH = Math.max(80, this.viewH - this.safeBottom);
    const cx = mw <= this.viewW ? (mw - this.viewW) / 2 : clamp(this.player.px + 8 - this.viewW / 2, 0, mw - this.viewW);
    const cy =
      mh <= usableH
        ? (mh - usableH) / 2
        : clamp(this.player.py + 6 - usableH / 2, 0, Math.max(0, mh - usableH));
    this.camX = Math.round(cx);
    this.camY = Math.round(cy);
  }

  characterFrame(sprites, dir, moving, t, parity) {
    const set = sprites[dir];
    if (!moving) return set[0];
    if (t < 0.5) return parity ? set[1] : set[2];
    return set[0];
  }

  render() {
    const ctx = this.ctx;
    if (!this.map || !ctx) return;
    this.camera();
    const cx = this.camX;
    const cy = this.camY;
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#050608';
    ctx.fillRect(0, 0, this.viewW, this.viewH);
    ctx.drawImage(this.backgrounds[this.map.id], -cx, -cy);

    this.drawNeon(ctx, cx, cy);

    const drawables = [];
    for (const o of this.map.objects) {
      drawables.push({ sort: (o.y + o.h) * T, draw: () => ctx.drawImage(o.canvas, o.x * T + o.ox - cx, o.y * T + o.oy - cy) });
    }
    for (const n of this.npcs) {
      drawables.push({ sort: n.py + T + (n.oy || 0) + (n.id === 'runner' ? 12 : 0), draw: () => this.drawNpc(ctx, n, cx, cy) });
    }
    const p = this.player;
    drawables.push({
      sort: p.py + T + 0.5,
      draw: () => {
        const frame = p.flexUntil > performance.now() && !p.moving
          ? this.chars.sree.flex
          : p.moving
          ? this.characterFrame(this.chars.sree, p.dir, true, p.t, this.stepParity)
          : p.walkAnim > 0
            ? this.chars.sree[p.dir][Math.floor(Math.abs(p.walkAnim) * 7) % 2 ? 1 : 2]
            : this.chars.sree[p.dir][0];
        this.shadow(ctx, p.px - cx, p.py - cy);
        ctx.drawImage(frame, Math.round(p.px - cx), Math.round(p.py - cy - 4 - (p.moving && p.running && p.t < 0.5 ? 1 : 0)));
      },
    });
    drawables.sort((a, b) => a.sort - b.sort);
    for (const d of drawables) d.draw();

    // lighting
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(this.map.shade, -cx, -cy);
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(this.map.glow, -cx, -cy);
    this.drawNeonGlow(ctx, cx, cy);
    this.drawParticles(ctx, cx, cy);
    ctx.globalCompositeOperation = 'source-over';

    this.drawMarkers(ctx, cx, cy);
    this.drawRain(ctx, cx, cy);

    if (this.fade > 0) {
      ctx.fillStyle = `rgba(0,0,0,${this.fade})`;
      ctx.fillRect(0, 0, this.viewW, this.viewH);
    }
  }

  shadow(ctx, x, y) {
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.fillRect(Math.round(x + 3), Math.round(y + 14), 10, 2);
    ctx.fillRect(Math.round(x + 4), Math.round(y + 13), 8, 4);
  }

  drawNpc(ctx, n, cx, cy) {
    const x = Math.round(n.px - cx);
    const y = Math.round(n.py - cy + (n.oy || 0));
    if (n.sprite === 'cat') {
      const frames = this.chars.cat;
      const breath = Math.abs(Math.floor((this.time + n.phase) / 1.1)) % 2;
      ctx.drawImage(frames[breath], x + 2, y + 6);
      if (breath) drawText(ctx, 'Z', x + 12, y - 2 - Math.floor((this.time * 4) % 4), 'rgba(255,255,255,0.7)');
      return;
    }
    const sprites = this.chars[n.sprite];
    let frame;
    if (n.anim === 'run') frame = sprites.up[[1, 0, 2, 0][Math.abs(Math.floor(this.time * 9)) % 4]];
    else frame = this.characterFrame(sprites, n.dir, n.moving, n.t, Math.floor(n.px + n.py) % 2 === 0);
    if (n.id !== 'runner') this.shadow(ctx, x, y);
    ctx.drawImage(frame, x, y - 4);
    if (n.anim === 'curl' && n.dir === 'down') {
      const up = Math.abs(Math.floor((this.time + n.phase) / 0.7)) % 2;
      const by = y + (up ? 3 : 8);
      ctx.fillStyle = '#0b0c10';
      ctx.fillRect(x - 3, by - 1, 22, 4);
      ctx.fillStyle = '#c3cad6';
      ctx.fillRect(x - 2, by, 20, 2);
      ctx.fillStyle = '#e2b021';
      ctx.fillRect(x - 3, by - 2, 2, 6);
      ctx.fillRect(x + 17, by - 2, 2, 6);
    }
    if (n.anim === 'mop' && (n.dir === 'left' || n.dir === 'right')) {
      const sx = n.dir === 'right' ? x + 12 : x + 3;
      const ex = n.dir === 'right' ? x + 17 : x - 2;
      ctx.fillStyle = '#8c5a32';
      for (let i = 0; i <= 10; i++) ctx.fillRect(Math.round(sx + ((ex - sx) * i) / 10), y + 5 + i, 1, 1);
      ctx.fillStyle = '#d9d2bd';
      ctx.fillRect(ex - 3, y + 15, 7, 2);
    }
  }

  drawNeon(ctx, cx, cy) {
    const neon = this.map.neon;
    if (!neon) return;
    const flicker = this.reducedMotion ? 1 : this.neonLevel();
    const width = textWidth(neon.text, 1) * neon.scale;
    const x = neon.x - width / 2 - cx;
    const y = neon.y - cy;
    ctx.globalAlpha = 1;
    drawText(ctx, neon.text, x + 1, y + 1, '#1a0a0d', { scale: neon.scale });
    drawText(ctx, neon.text, x, y, flicker > 0.5 ? '#ffd0d4' : '#6b1c24', { scale: neon.scale });
    if (neon.sub) {
      const sw = textWidth(neon.sub.text);
      drawText(ctx, neon.sub.text, neon.x - sw / 2 - cx, y + 5 * neon.scale + 4, neon.sub.color);
    }
  }

  neonLevel() {
    const t = this.time;
    // Mostly steady, with the odd stutter like a tired tube.
    const cycle = t % 7.3;
    if (cycle > 6.9 && cycle < 7.0) return 0.2;
    if (cycle > 7.08 && cycle < 7.14) return 0.3;
    return 1;
  }

  drawNeonGlow(ctx, cx, cy) {
    const neon = this.map.neon;
    if (!neon) return;
    const level = this.reducedMotion ? 1 : this.neonLevel();
    const width = textWidth(neon.text, 1) * neon.scale;
    ctx.globalAlpha = 0.55 * level;
    drawText(ctx, neon.text, neon.x - width / 2 - cx, neon.y - cy, neon.color, { scale: neon.scale });
    ctx.globalAlpha = 1;
  }

  drawParticles(ctx, cx, cy) {
    if (this.reducedMotion) return;
    for (const d of this.particles) {
      const a = Math.sin((d.life / d.max) * Math.PI) * 0.5;
      if (a <= 0.02) continue;
      ctx.fillStyle = `rgba(255,240,215,${a.toFixed(3)})`;
      ctx.fillRect(Math.round(d.x - cx), Math.round(d.y - cy), 1, 1);
    }
  }

  drawRain(ctx, cx, cy) {
    if (!this.rain.length) return;
    ctx.fillStyle = 'rgba(170,190,230,0.35)';
    for (const r of this.rain) {
      const x = Math.round(r.x - cx);
      const y = Math.round(r.y - cy);
      ctx.fillRect(x, y, 1, 3);
      ctx.fillRect(x - 1, y + 3, 1, 2);
    }
  }

  drawMarkers(ctx, cx, cy) {
    const bob = this.reducedMotion ? 0 : Math.round(Math.sin(this.time * 4) * 1.5);
    for (const o of this.map.objects) {
      if (!o.station || o.id !== o.station) continue;
      const state = this.status[o.station];
      if (!state) continue;
      const x = Math.round((o.x + o.w / 2) * T - cx - 4);
      const y = Math.round(o.y * T + o.oy - cy - 11 + bob);
      this.bubble(ctx, x, y, state);
    }
    for (const n of this.npcs) {
      const state = this.status[`npc:${n.id}`];
      if (!state) continue;
      this.bubble(ctx, Math.round(n.px - cx + 4), Math.round(n.py - cy - 14 + bob), state);
    }
  }

  bubble(ctx, x, y, state) {
    const fill = state === 'done' ? '#e2b021' : state === 'boss' ? '#ff3b4c' : '#ffffff';
    ctx.fillStyle = '#0b0c10';
    ctx.fillRect(x - 1, y, 10, 9);
    ctx.fillRect(x, y - 1, 8, 11);
    ctx.fillRect(x + 3, y + 9, 3, 2);
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, 8, 9);
    ctx.fillRect(x + 4, y + 9, 1, 1);
    if (state === 'done') {
      // star
      const s = ['...#....', '..###...', '#######.', '.#####..', '.##.##..', '.#...#..'];
      ctx.fillStyle = '#0b0c10';
      s.forEach((row, ry) => [...row].forEach((c, rx) => c === '#' && ctx.fillRect(x + rx, y + 2 + ry, 1, 1)));
    } else {
      ctx.fillStyle = state === 'boss' ? '#ffffff' : '#d41f2b';
      ctx.fillRect(x + 3, y + 2, 2, 4);
      ctx.fillRect(x + 3, y + 7, 2, 1);
    }
  }
}
