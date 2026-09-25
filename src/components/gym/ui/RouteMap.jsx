import React, { memo, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import '../gym-run.css';

/**
 * An activity map without map tiles: the route drawn over a street network
 * generated from the route itself. The grid is aligned to the route's main
 * heading and the streets the route ran along continue past its turns, so it
 * reads like a real map at a glance while making no network requests (and
 * giving away nothing about where the run actually was).
 *
 * No scale bar, on purpose: the build script normalises each route to a unit
 * box so its size can't be matched back to real streets. A made-up scale
 * would be wrong and a real one would undo that.
 */

const ORANGE = '#fc5200';
const NO_INSET = {};

/* ------------------------------------------------------------ geometry */

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const seedOf = (points) => {
  let h = 2166136261;
  const step = Math.max(1, Math.floor(points.length / 24));
  for (let i = 0; i < points.length; i += step) {
    h ^= Math.round(points[i][0] * 9973 + points[i][1] * 7919);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

/** Route in "units": x scaled by the aspect so both axes share a scale. */
function routeGeometry(route) {
  if (!route || !route.points || route.points.length < 2) return null;
  const aspect = route.aspect > 0 ? route.aspect : 1;
  const pts = route.points.map(([x, y]) => [x * aspect, y]);
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  // Main heading, folded into 0..90°, weighted by segment length: most runs
  // follow a street grid, and the generated streets should agree with it.
  const bins = new Array(18).fill(0);
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i - 1][0];
    const dy = pts[i][1] - pts[i - 1][1];
    const len = Math.hypot(dx, dy);
    if (!len) continue;
    const a = ((Math.atan2(dy, dx) % (Math.PI / 2)) + Math.PI / 2) % (Math.PI / 2);
    bins[Math.min(17, Math.floor((a / (Math.PI / 2)) * 18))] += len;
  }
  const peak = bins.indexOf(Math.max(...bins));
  return {
    aspect,
    pts,
    cum,
    length: cum[cum.length - 1] || 1,
    angle: ((peak + 0.5) / 18) * (Math.PI / 2),
    seed: seedOf(route.points),
  };
}

/**
 * Place the route in a w×h box, leaving room for the finish flag and for any
 * HUD the parent lays over the map. `insets` lists alternative clearances
 * (px per side, measured from the edge); the one that lets the route draw
 * biggest wins, so a tall route can use the gap between two HUD cards while
 * a wide one drops below them.
 */
function fitRoute(geo, w, h, insets) {
  const pad = Math.max(18, Math.min(w, h) * 0.11);
  let best = null;
  for (const inset of insets.length ? insets : [{}]) {
    const l = Math.max(pad, inset.left || 0);
    const r = Math.max(pad, inset.right || 0);
    const t = Math.max(pad + 12, inset.top || 0);
    const b = Math.max(pad, inset.bottom || 0);
    const s = Math.max(1, Math.min((w - l - r) / geo.aspect, h - t - b));
    if (!best || s > best.s) best = { s, l, r, t, b };
  }
  const { s, l, r, t, b } = best;
  const ox = l + (w - l - r - geo.aspect * s) / 2;
  const oy = t + (h - t - b - s) / 2;
  const px = geo.pts.map(([x, y]) => [ox + x * s, oy + y * s]);
  return { s, px };
}

function pointAt(geo, px, t) {
  const target = Math.max(0, Math.min(1, t)) * geo.length;
  const { cum } = geo;
  let lo = 0;
  let hi = cum.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] <= target) lo = mid;
    else hi = mid;
  }
  const span = cum[hi] - cum[lo] || 1;
  const f = (target - cum[lo]) / span;
  return [px[lo][0] + (px[hi][0] - px[lo][0]) * f, px[lo][1] + (px[hi][1] - px[lo][1]) * f];
}

function simplify(points, tolerance) {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = points[a];
    const [bx, by] = points[b];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    let far = -1;
    let max = tolerance;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((bx - ax) * (ay - points[i][1]) - (ax - points[i][0]) * (by - ay)) / len;
      if (d > max) {
        max = d;
        far = i;
      }
    }
    if (far >= 0) {
      keep[far] = 1;
      stack.push([a, far], [far, b]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

const pathOf = (pts) =>
  pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');

/* ------------------------------------------------------------ streets */

/**
 * Streets built around the route. Long straight stretches of the route become
 * whole streets that run on past its corners; a jittered grid (some streets
 * broken off, each slightly off-angle) fills the gaps, with an arterial or two,
 * parks and maybe a lake.
 */
function buildStreets(w, h, seed, angle, routePx) {
  const rand = mulberry32(seed || 7);
  const cx = w / 2;
  const cy = h / 2;
  const R = Math.hypot(w, h) / 2 + 40;
  const U = [Math.cos(angle), Math.sin(angle)];
  const V = [-U[1], U[0]];
  const at = (u, v) => [cx + U[0] * u + V[0] * v, cy + U[1] * u + V[1] * v];
  const toUV = ([x, y]) => [(x - cx) * U[0] + (y - cy) * U[1], (x - cx) * V[0] + (y - cy) * V[1]];
  const unit = Math.max(26, Math.min(w, h) / 8.5);

  const minor = [];
  const major = [];
  const blocks = [];
  const spurs = [];

  // Streets the route actually ran along. A stretch within ~13° of the grid
  // becomes a full grid street at its exact offset; anything else is a
  // diagonal road extended a way past both ends.
  const routeU = [];
  const routeV = [];
  if (routePx) {
    const simple = simplify(routePx, 3);
    for (let i = 1; i < simple.length; i++) {
      const a = toUV(simple[i - 1]);
      const b = toUV(simple[i]);
      const du = b[0] - a[0];
      const dv = b[1] - a[1];
      const len = Math.hypot(du, dv);
      if (len < unit * 0.7) continue;
      const tilt = Math.abs(dv) > Math.abs(du) ? du / dv : dv / du;
      if (Math.abs(tilt) < 0.23) {
        // Constant-u streets run along v, and vice versa. An out-and-back
        // passes the same street twice; it only needs drawing once.
        const alongV = Math.abs(dv) > Math.abs(du);
        const list = alongV ? routeU : routeV;
        const off = alongV ? a[0] - a[1] * tilt : a[1] - a[0] * tilt;
        if (!list.some((r) => Math.abs(r.off - off) < unit * 0.25)) list.push({ off, tilt });
      } else if (len > unit * 1.3 && spurs.length < 5 && rand() < 0.7) {
        // Only the longer diagonals: a winding route would sprout a hairball.
        const [ax, ay] = simple[i - 1];
        const [bx, by] = simple[i];
        const L = Math.hypot(bx - ax, by - ay);
        const dx = (bx - ax) / L;
        const dy = (by - ay) / L;
        const e1 = unit * (1 + rand() * 3);
        const e2 = unit * (1 + rand() * 3);
        spurs.push(pathOf([[ax - dx * e1, ay - dy * e1], [bx + dx * e2, by + dy * e2]]));
      }
    }
  }

  // Grid offsets, skipping any that would sit right beside a route street.
  const offsets = (spanScale, taken) => {
    const list = [];
    for (let o = -R + rand() * unit; o < R; o += unit * spanScale * (0.65 + rand() * 0.8)) {
      if (taken.some((t) => Math.abs(t.off - o) < unit * 0.45)) continue;
      list.push(o);
    }
    return list;
  };
  const us = offsets(1, routeU);
  const vs = offsets(1.3, routeV);

  // Land-use patches in some grid cells give the blocks a little texture.
  for (let i = 0; i < us.length - 1; i++) {
    for (let j = 0; j < vs.length - 1; j++) {
      const r = rand();
      if (r > 0.3) continue;
      blocks.push({
        d: pathOf([at(us[i], vs[j]), at(us[i + 1], vs[j]), at(us[i + 1], vs[j + 1]), at(us[i], vs[j + 1])]) + 'Z',
        tone: r < 0.1 ? 'b' : 'a',
      });
    }
  }

  const line = (fixed, list, isU, tilt = (rand() - 0.5) * 0.1) => {
    const pts = [];
    for (let t = -R; t <= R; t += 36) {
      const off = fixed + t * tilt;
      pts.push(isU ? at(off, t) : at(t, off));
    }
    // Break some streets into pieces: real grids have dead ends and gaps.
    if (list === minor && rand() < 0.6) {
      let i = 0;
      while (i < pts.length - 1) {
        const n = 2 + Math.floor(rand() * 6);
        if (rand() < 0.72) list.push(pathOf(pts.slice(i, i + n + 1)));
        i += n;
      }
    } else list.push(pathOf(pts));
  };
  us.forEach((u, i) => line(u, i % 4 === 2 ? major : minor, true));
  vs.forEach((v, i) => line(v, i % 3 === 1 ? major : minor, false));
  routeU.forEach((r) => line(r.off, major, true, r.tilt));
  routeV.forEach((r) => line(r.off, major, false, r.tilt));

  // An arterial or two on their own, gently curving headings.
  const arterial = [];
  const arterials = rand() < 0.45 ? 2 : 1;
  for (let k = 0; k < arterials; k++) {
    const a = angle + Math.PI / 4 + (rand() - 0.5) * 0.8 + k * (Math.PI / 2);
    const off = (rand() - 0.5) * Math.min(w, h) * 0.9;
    const dir = [Math.cos(a), Math.sin(a)];
    const nrm = [-dir[1], dir[0]];
    const bend = (rand() - 0.5) * 0.0024;
    const pts = [];
    for (let t = -R; t <= R; t += 24) {
      const o = off + bend * t * t;
      pts.push([cx + dir[0] * t + nrm[0] * o, cy + dir[1] * t + nrm[1] * o]);
    }
    arterial.push(pathOf(pts));
  }

  // Parks and a lake: soft blobs.
  const blob = (bx, by, rx, ry, rot, n = 9) => {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = 0.72 + rand() * 0.4;
      const x = Math.cos(a) * rx * r;
      const y = Math.sin(a) * ry * r;
      pts.push([bx + x * Math.cos(rot) - y * Math.sin(rot), by + x * Math.sin(rot) + y * Math.cos(rot)]);
    }
    // Smooth closed curve through the points (midpoint quadratic).
    const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    let d = `M${mid(pts[n - 1], pts[0]).map((v) => v.toFixed(1)).join(' ')}`;
    for (let i = 0; i < n; i++) {
      const p = pts[i];
      const m = mid(p, pts[(i + 1) % n]);
      d += `Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
    }
    return `${d}Z`;
  };
  const parks = [];
  const parkCount = 2 + Math.floor(rand() * 2);
  for (let i = 0; i < parkCount; i++) {
    const rx = unit * (0.8 + rand() * 1.5);
    parks.push(blob(rand() * w, rand() * h, rx, rx * (0.5 + rand() * 0.5), angle + (rand() - 0.5) * 0.4));
  }
  const water = [];
  if (rand() < 0.7) {
    const rx = unit * (1 + rand() * 1.3);
    const side = rand() < 0.5 ? -1 : 1;
    water.push(blob(cx + side * (w * (0.32 + rand() * 0.22)), rand() * h, rx, rx * (0.45 + rand() * 0.4), rand() * 3, 11));
  }

  return { blocks, minor, major, arterial, parks, water, spurs };
}

/** The static layers, memoised so a moving runner dot doesn't redraw the city. */
const MapBase = memo(function MapBase({ w, h, seed, angle, routeD, routePx, lw }) {
  const streets = useMemo(() => buildStreets(w, h, seed, angle, routePx), [w, h, seed, angle, routePx]);
  return (
    <g className="gym-map-base">
      <rect width={w} height={h} fill="#15171c" />
      {streets.blocks.map((b, i) => (
        <path key={`b${i}`} d={b.d} fill={b.tone === 'b' ? '#1b1e24' : '#181a20'} />
      ))}
      {streets.parks.map((d, i) => (
        <path key={`p${i}`} d={d} fill="#17241c" stroke="#1c2c22" strokeWidth="1" />
      ))}
      {streets.water.map((d, i) => (
        <path key={`w${i}`} d={d} fill="#13202d" stroke="#18293a" strokeWidth="1.2" />
      ))}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {streets.minor.map((d, i) => (
          <path key={`m${i}`} d={d} stroke="#212429" strokeWidth={Math.max(1.1, lw * 0.42)} />
        ))}
        {streets.major.map((d, i) => (
          <path key={`j${i}`} d={d} stroke="#292d35" strokeWidth={Math.max(2.2, lw * 0.9)} />
        ))}
        {streets.spurs.map((d, i) => (
          <path key={`s${i}`} d={d} stroke="#292d35" strokeWidth={Math.max(2.2, lw * 0.9)} />
        ))}
        {streets.arterial.map((d, i) => (
          <g key={`a${i}`}>
            <path d={d} stroke="#2c2f36" strokeWidth={Math.max(4, lw * 1.6)} />
            <path d={d} stroke="#36373a" strokeWidth={Math.max(1.8, lw * 0.65)} />
          </g>
        ))}
        {routeD && <path d={routeD} stroke="#2c3039" strokeWidth={Math.max(3, lw * 1.35)} />}
      </g>
    </g>
  );
});

function useSize(ref) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const w = Math.round(width);
      const h = Math.round(height);
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

/**
 * Props:
 *   route          { aspect, points } from the Strava data, or null
 *   progress       0..1 — draws the runner dot and dims the unrun part
 *   height         CSS height (number = px). Width always fills the parent.
 *   animate        draw the route in on mount
 *   compass        show the north arrow
 *   inset          { top, right, bottom, left } px kept clear of the route, or
 *                  an array of alternatives (the roomiest fit is used)
 */
export default function RouteMap({
  route,
  progress = null,
  height = 240,
  className = '',
  animate = false,
  compass = true,
  inset = NO_INSET,
  emptyNote = 'Either the watch had no GPS, or the whole route stayed too close to home to share.',
}) {
  const wrap = useRef(null);
  const { w, h } = useSize(wrap);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const geo = useMemo(() => routeGeometry(route), [route]);

  // Keyed by value so a parent passing a fresh object each render doesn't refit.
  const insetKey = JSON.stringify(inset);
  const fit = useMemo(
    () => (geo && w > 0 && h > 0 ? fitRoute(geo, w, h, [].concat(JSON.parse(insetKey))) : null),
    [geo, w, h, insetKey]
  );
  const routeD = useMemo(() => (fit ? pathOf(fit.px) : null), [fit]);
  const lw = Math.max(2.6, Math.min(5, Math.min(w, h) / 80));

  const showProgress = progress != null && fit;
  const runner = showProgress ? pointAt(geo, fit.px, progress) : null;
  const start = fit ? fit.px[0] : null;
  const end = fit ? fit.px[fit.px.length - 1] : null;
  const dash = (p) => `${Math.max(0, Math.min(1, p)) * 1000} 1000`;

  const style = { height: typeof height === 'number' ? `${height}px` : height };
  const classes = ['gym-routemap', animate && 'is-animate', !geo && 'is-empty', className].filter(Boolean).join(' ');

  return (
    <div ref={wrap} className={classes} style={style}>
      {w > 0 && h > 0 && (
        <svg className="gym-routemap-svg" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
          <defs>
            <pattern id={`${uid}chk`} width="6" height="6" patternUnits="userSpaceOnUse">
              <rect width="6" height="6" fill="#fff" />
              <rect width="3" height="3" fill="#111" />
              <rect x="3" y="3" width="3" height="3" fill="#111" />
            </pattern>
            <radialGradient id={`${uid}vig`} cx="50%" cy="50%" r="75%">
              <stop offset="55%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
            </radialGradient>
          </defs>

          <MapBase
            w={w}
            h={h}
            seed={geo ? geo.seed : 424242}
            angle={geo ? geo.angle : 0.35}
            routeD={routeD}
            routePx={fit ? fit.px : null}
            lw={lw}
          />

          {fit && (
            <g key={geo.seed} className="gym-route" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {showProgress ? (
                <>
                  {/* The unrun part stays visible but muted, like a planned route. */}
                  <path d={routeD} stroke="#24140d" strokeWidth={lw * 1.9} opacity="0.85" />
                  <path d={routeD} stroke={ORANGE} strokeWidth={lw * 0.85} opacity="0.3" />
                  {progress > 0.0005 && (
                    <>
                      <path d={routeD} pathLength="1000" stroke={ORANGE} strokeWidth={lw * 3.4} opacity="0.1" strokeDasharray={dash(progress)} />
                      <path d={routeD} pathLength="1000" stroke="#3a1400" strokeWidth={lw * 1.9} strokeDasharray={dash(progress)} />
                      <path d={routeD} pathLength="1000" stroke={ORANGE} strokeWidth={lw} strokeDasharray={dash(progress)} />
                    </>
                  )}
                </>
              ) : (
                <>
                  <path className="gym-route-draw" d={routeD} pathLength="1000" stroke={ORANGE} strokeWidth={lw * 3.4} opacity="0.08" />
                  <path className="gym-route-draw" d={routeD} pathLength="1000" stroke={ORANGE} strokeWidth={lw * 2.1} opacity="0.14" />
                  <path className="gym-route-draw" d={routeD} pathLength="1000" stroke="#3a1400" strokeWidth={lw * 1.9} />
                  <path className="gym-route-draw" d={routeD} pathLength="1000" stroke={ORANGE} strokeWidth={lw} />
                </>
              )}

              <g className="gym-route-marks">
                {/* Finish: a checkered flag on a pole, so it reads even on a loop. */}
                <g transform={`translate(${end[0].toFixed(1)} ${end[1].toFixed(1)})`}>
                  <line x1="0" y1="0" x2="0" y2="-19" stroke="#0b0c10" strokeWidth="3.2" />
                  <line x1="0" y1="0" x2="0" y2="-19" stroke="#f2f3f7" strokeWidth="1.4" />
                  <rect x="0.5" y="-19" width="13" height="9" fill={`url(#${uid}chk)`} stroke="#0b0c10" strokeWidth="1" />
                  <circle r={lw * 1.25} fill="#0b0c10" stroke="#f2f3f7" strokeWidth="1.6" />
                </g>
                <circle cx={start[0]} cy={start[1]} r={lw * 1.35} fill="#1fbf5b" stroke="#fff" strokeWidth="2" />
              </g>

              {runner && (
                <g className="gym-route-runner" transform={`translate(${runner[0].toFixed(1)} ${runner[1].toFixed(1)})`}>
                  <circle className="gym-route-pulse" r={lw * 2} fill={ORANGE} />
                  <circle r={lw * 1.8} fill={ORANGE} stroke="#fff" strokeWidth="2.2" />
                  <circle r={lw * 0.55} fill="#fff" />
                </g>
              )}
            </g>
          )}

          <rect width={w} height={h} fill={`url(#${uid}vig)`} pointerEvents="none" />

          {fit && compass && (
            <g className="gym-map-north" transform={`translate(${w - 20} 26)`}>
              <circle r="11" fill="#0b0c10" opacity="0.55" />
              <path d="M0 -7L4 4L0 2L-4 4Z" fill="#f2f3f7" />
              <text y="-12" textAnchor="middle" className="gym-map-label">
                N
              </text>
            </g>
          )}
        </svg>
      )}
      {!geo && (
        <div className="gym-routemap-empty">
          <svg viewBox="0 0 16 16" width="30" height="30" aria-hidden="true" shapeRendering="crispEdges">
            <path d="M6 1h4v1h1v1h1v5h-1v2h-1v2H9v2H7v-2H6v-2H5V8H4V3h1V2h1z" fill="#3a3f4d" />
            <path d="M7 4h2v1h1v2H9v1H7V7H6V5h1z" fill="#15171c" />
            <path d="M1 14L15 2" stroke="#ff3b4c" strokeWidth="2" />
          </svg>
          <p className="px-font">NO MAP FOR THIS ONE</p>
          {emptyNote && <p className="gym-routemap-note">{emptyNote}</p>}
        </div>
      )}
    </div>
  );
}
