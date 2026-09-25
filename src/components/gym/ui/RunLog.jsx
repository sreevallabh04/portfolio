import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { LAYER, useInputLayer } from '../engine/input';
import { buildTimeline, cleanPace, replaySeconds } from '../engine/replay';
import {
  ACTIVITIES,
  BESTS,
  STRAVA,
  TOTALS,
  TYPE_META,
  formatDuration,
  formatKm,
  formatPace,
  isSuspect,
  paceOf,
} from '@/lib/strava';
import Menu from './Menu';
import RouteMap from './RouteMap';
import '../gym-run.css';

const TABS = ['all', 'Run', 'Ride', 'Walk', 'Swim'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAY_MS = 86400000;

const meta = (type) => TYPE_META[type] || TYPE_META.default;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ------------------------------------------------------------- dates */

/**
 * Wall-clock parts in the activity's own timezone. `start` carries its UTC
 * offset, so reading the digits straight off it keeps a 6:55 AM run at
 * 6:55 AM wherever the page is opened.
 */
function localParts(a) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(a.start || '');
  if (!m) {
    const d = a.startDate || new Date(a.start);
    return { y: d.getFullYear(), mo: d.getMonth(), d: d.getDate(), hh: d.getHours(), mm: d.getMinutes(), dow: d.getDay() };
  }
  const [y, mo, d, hh, mm] = m.slice(1).map(Number);
  return { y, mo: mo - 1, d, hh, mm, dow: new Date(Date.UTC(y, mo - 1, d)).getUTCDay() };
}

const shortDate = (a) => {
  const p = localParts(a);
  return `${MONTHS[p.mo]} ${p.d}`;
};

const longDate = (a) => {
  const p = localParts(a);
  const h12 = p.hh % 12 || 12;
  return `${DAYS[p.dow]} ${p.d} ${MONTHS[p.mo]} ${p.y} · ${h12}:${String(p.mm).padStart(2, '0')} ${p.hh < 12 ? 'AM' : 'PM'}`;
};

/** Monday of the week, as a UTC day number, for a local y/m/d. */
const weekOf = (y, mo, d) => {
  const day = Date.UTC(y, mo, d) / DAY_MS;
  const dow = new Date(day * DAY_MS).getUTCDay();
  return day - ((dow + 6) % 7);
};

/** Today in the athlete's timezone, so "this week" matches the log's dates. */
const TODAY = (() => {
  try {
    const s = new Intl.DateTimeFormat('en-CA', { timeZone: STRAVA.timezone || undefined }).format(new Date());
    const [y, mo, d] = s.split('-').map(Number);
    if (y && mo && d) return { y, mo: mo - 1, d };
  } catch {}
  const n = new Date();
  return { y: n.getFullYear(), mo: n.getMonth(), d: n.getDate() };
})();

/* ------------------------------------------------------------ format */

const kmh = (mps) => `${(mps * 3.6).toFixed(1)} KM/H`;
const per100 = (secPerKm) => `${formatDuration(secPerKm / 10)} /100M`;
const bpm = (v) => (v ? `${Math.round(v)} BPM` : '—');
const hours = (s) => {
  const h = s / 3600;
  return h >= 10 ? `${Math.round(h)} H` : `${h.toFixed(1)} H`;
};

/** Pace, or speed for rides, the way the activity's own sport reports it. */
function speedText(type, secPerKm) {
  if (!Number.isFinite(secPerKm) || secPerKm <= 0) return '—';
  if (type === 'Ride') return kmh(1000 / secPerKm);
  if (type === 'Swim') return per100(secPerKm);
  return formatPace(secPerKm);
}

const speedLabel = (type) => (type === 'Ride' ? 'SPEED' : 'PACE');

/** The build script writes flag reasons as lowercase fragments. */
const sentence = (text) => {
  const t = String(text || '').trim();
  if (!t) return '';
  return t[0].toUpperCase() + t.slice(1) + (/[.!?]$/.test(t) ? '' : '.');
};

/* ------------------------------------------------------ weekly chart */

/**
 * Distance per week, stacked by sport, from the first activity to this week.
 * The data is static, so this runs once when the module loads.
 */
function buildWeeks() {
  const valid = ACTIVITIES.filter((a) => !isSuspect(a));
  if (!valid.length) return null;
  const byWeek = new Map();
  let first = Infinity;
  for (const a of valid) {
    const p = localParts(a);
    const w = weekOf(p.y, p.mo, p.d);
    first = Math.min(first, w);
    const row = byWeek.get(w) || { total: 0, count: 0, types: {} };
    row.total += a.distance;
    row.count += 1;
    row.types[a.type] = (row.types[a.type] || 0) + a.distance;
    byWeek.set(w, row);
  }
  const now = weekOf(TODAY.y, TODAY.mo, TODAY.d);
  const last = Math.max(now, ...byWeek.keys());
  // Keep the bars readable if the log ever spans years.
  const start = Math.max(first, last - 7 * 103);
  const weeks = [];
  for (let w = start; w <= last; w += 7) weeks.push({ w, ...(byWeek.get(w) || { total: 0, count: 0, types: {} }) });
  const max = Math.max(...weeks.map((x) => x.total), 1);
  const best = weeks.reduce((top, x) => (x.total > top.total ? x : top), weeks[0]);
  const types = ['Run', 'Walk', 'Ride', 'Swim'].filter((t) => valid.some((a) => a.type === t));
  // A label on the first week of each month, dropping any that would crowd
  // the one before it. The year goes on January and on the first label.
  // Two densities: the sparse set is what a phone-width chart shows.
  const labelsEvery = (gap) => {
    const out = [];
    let lastLabel = -99;
    let lastMonth = -1;
    for (let i = 0; i < weeks.length; i++) {
      const monday = new Date(weeks[i].w * DAY_MS);
      const month = monday.getUTCMonth();
      if (month === lastMonth) continue;
      lastMonth = month;
      if (i - lastLabel < gap) continue;
      const year = String(monday.getUTCFullYear()).slice(2);
      out.push({ i, text: month === 0 || !out.length ? `${MONTHS[month]} '${year}` : MONTHS[month] });
      lastLabel = i;
    }
    return out;
  };
  const sparse = labelsEvery(Math.ceil(weeks.length / 5));
  const labels = labelsEvery(5).map((l) => ({ ...l, sparse: sparse.some((x) => x.i === l.i) }));
  for (const l of sparse) if (!labels.some((x) => x.i === l.i)) labels.push({ ...l, sparse: true, only: true });
  return { weeks, max, best, now, types, labels };
}

const WEEKS = buildWeeks();

function WeeklyChart({ selected }) {
  const data = WEEKS;
  if (!data) return null;
  const { weeks, max, best, now, types, labels } = data;
  const sel = selected ? localParts(selected) : null;
  const selWeek = sel ? weekOf(sel.y, sel.mo, sel.d) : null;
  const nowIndex = weeks.findIndex((x) => x.w === now);
  const thisWeek = weeks[nowIndex];
  const W = weeks.length * 10;
  const H = 48;
  const weekLabel = (w) => {
    const d = new Date(w * DAY_MS);
    return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
  };

  return (
    <figure className="gym-rl-weeks" aria-label="Distance per week">
      <figcaption>
        <span>WEEKLY DISTANCE</span>
        <span className="gym-rl-weeks-legend">
          {types.map((t) => (
            <span key={t}>
              <i style={{ background: meta(t).color }} />
              {meta(t).label}
            </span>
          ))}
        </span>
        <span className="gym-rl-weeks-sum">
          THIS WEEK <b className="is-gold">{((thisWeek?.total || 0) / 1000).toFixed(1)} KM</b> · BEST{' '}
          <b>{(best.total / 1000).toFixed(1)} KM</b>
        </span>
      </figcaption>
      <div className="gym-rl-weeks-plot">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
          <line x1="0" x2={W} y1={H - 0.5} y2={H - 0.5} className="gym-rl-weeks-base" />
          {weeks.map((x, i) => {
            let y = H;
            const isNow = x.w === now;
            const isSel = x.w === selWeek;
            return (
              <g key={x.w}>
                {(isNow || isSel) && (
                  <rect x={i * 10} y="0" width="10" height={H} className={isSel ? 'gym-rl-weeks-sel' : 'gym-rl-weeks-now'} />
                )}
                {types.map((t) => {
                  const v = x.types[t] || 0;
                  if (!v) return null;
                  const h = Math.max(1.5, (v / max) * (H - 6));
                  y -= h;
                  return <rect key={t} x={i * 10 + 1.5} y={y} width="7" height={h} fill={meta(t).color} />;
                })}
                <title>{`WEEK OF ${weekLabel(x.w)} · ${(x.total / 1000).toFixed(1)} KM · ${x.count} ${x.count === 1 ? 'ACTIVITY' : 'ACTIVITIES'}`}</title>
              </g>
            );
          })}
        </svg>
        {nowIndex >= 0 && (
          <span className="gym-rl-weeks-tag" style={{ left: `${((nowIndex + 0.5) / weeks.length) * 100}%` }}>
            NOW
          </span>
        )}
      </div>
      <div className="gym-rl-weeks-axis" aria-hidden="true">
        {labels.map((l) => (
          <span
            key={l.i}
            className={`${l.sparse ? 'is-sparse' : ''} ${l.only ? 'is-only-sparse' : ''}`}
            style={{ left: `${(l.i / weeks.length) * 100}%` }}
          >
            {l.text}
          </span>
        ))}
      </div>
    </figure>
  );
}

/* ------------------------------------------------------------ charts */

/** Maps a pointer's x over an element to 0..1, for scrubbing. */
const fractionOf = (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  return clamp((e.clientX - r.left) / Math.max(1, r.width), 0, 1);
};

/**
 * One profile in the stacked analysis: an area chart over distance with the
 * replay's playhead on it. `invert` puts low values on top (faster pace up);
 * `minSpan` stops 1 m of GPS noise on a flat run filling the chart.
 */
function Profile({ label, values, color, format, invert = false, minSpan = 0, at, live, caption }) {
  const shape = useMemo(() => {
    const list = (values || []).filter((v) => Number.isFinite(v));
    if (list.length < 3) return null;
    const lo = Math.min(...list);
    const hi = Math.max(...list);
    const pad = Math.max(0, minSpan - (hi - lo)) / 2;
    const min = lo - pad;
    const span = hi + pad - min || 1;
    const y = (v) => 4 + (invert ? (v - min) / span : 1 - (v - min) / span) * 40;
    const pts = list.map((v, i) => [(i / (list.length - 1)) * 200, y(v)]);
    const line = pts.map(([x, py], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${py.toFixed(1)}`).join('');
    return { line, area: `${line}L200 48L0 48Z`, lo, hi, y, n: list.length, list };
  }, [values, invert, minSpan]);
  if (!shape) return null;
  const px = at * 200;
  // The dot sits on the drawn line, read from the same samples.
  const x = at * (shape.n - 1);
  const i = Math.min(shape.n - 2, Math.floor(x));
  const v = shape.list[i] + (shape.list[i + 1] - shape.list[i]) * (x - i);
  return (
    <div className="gym-rl-profile" style={{ '--spark': color }}>
      <div className="gym-rl-profile-head">
        <span>{label}</span>
        <b>{live}</b>
        <span className="gym-rl-profile-range">
          {caption || `${format(invert ? shape.hi : shape.lo)} – ${format(invert ? shape.lo : shape.hi)}`}
        </span>
      </div>
      <div className="gym-rl-profile-plot">
        <svg viewBox="0 0 200 48" preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" x2="200" y1="24" y2="24" className="gym-rl-spark-grid" />
          <path d={shape.area} className="gym-rl-spark-area" />
          <path d={shape.line} className="gym-rl-spark-line" />
          <line x1={px} x2={px} y1="0" y2="48" className="gym-rl-playhead" />
        </svg>
        <span className="gym-rl-profile-dot" style={{ left: `${at * 100}%`, top: `${(shape.y(v) / 48) * 100}%` }} />
      </div>
    </div>
  );
}

/** Per-km splits as horizontal bars: longer is faster, the fastest is gold. */
function Splits({ activity, currentKm }) {
  const splits = (activity.splits || []).filter((s) => s.seconds > 0 && s.distance > 0);
  if (splits.length < 2) return null;
  const ride = activity.type === 'Ride';
  const speed = (s) => s.distance / s.seconds;
  // A partial last split is too short to crown, so only full kms compete.
  const full = splits.filter((s) => s.distance >= 950);
  const pool = full.length ? full : splits;
  const fastest = pool.reduce((top, s) => (speed(s) > speed(top) ? s : top), pool[0]);
  const speeds = splits.map(speed);
  const lo = Math.min(...speeds);
  const hi = Math.max(...speeds);
  return (
    <figure className="gym-rl-splits" aria-label="Splits per kilometre">
      <figcaption>
        <span>SPLITS</span>
        <span>{ride ? 'KM · SPEED' : 'KM · PACE'}</span>
      </figcaption>
      <ol>
        {splits.map((s) => {
          const pct = hi === lo ? 100 : 38 + ((speed(s) - lo) / (hi - lo)) * 62;
          const partial = s.distance < 950;
          const value = ride ? kmh(speed(s)) : formatPace((s.seconds / s.distance) * 1000).replace(' /KM', '');
          const cls = [s === fastest && 'is-best', s.km === currentKm && 'is-now'].filter(Boolean).join(' ');
          return (
            <li key={s.km} className={cls}>
              <span className="gym-rl-split-km">{partial ? (s.distance / 1000).toFixed(2) : s.km}</span>
              <span className="gym-rl-split-pace">{value}</span>
              <span className="gym-rl-split-track">
                <span className="gym-rl-split-bar" style={{ width: `${pct}%` }} />
              </span>
              <span className="gym-rl-split-tag">{s === fastest ? 'FASTEST' : ''}</span>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}

/**
 * The no-map hero: each km as a column (taller is faster, width is the
 * split's distance), the pace line over them, and the replay's playhead.
 */
function Skyline({ activity, at, played, onPointerDown, onPointerMove }) {
  const shape = useMemo(() => {
    const splits = (activity.splits || []).filter((s) => s.seconds > 0 && s.distance > 0);
    const total = activity.distance || 1;
    const speed = (s) => s.distance / s.seconds;
    const full = splits.filter((s) => s.distance >= 950);
    const pool = full.length ? full : splits;
    const fastest = pool.reduce((top, s) => (!top || speed(s) > speed(top) ? s : top), null);
    const speeds = splits.map(speed);
    const lo = speeds.length ? Math.min(...speeds) : 1;
    const hi = speeds.length ? Math.max(...speeds) : 1;
    const floor = lo * 0.8;
    const height = (v) => 34 + ((v - floor) / Math.max(1e-6, hi - floor)) * 116;
    const cols = [];
    for (let i = 0, x = 0; i < splits.length; i++) {
      const s = splits[i];
      const w = (s.distance / total) * 400;
      cols.push({ s, x, w, h: height(speed(s)), best: s === fastest });
      x += w;
    }
    const pace = cleanPace(activity.pace);
    const ys = pace ? pace.map((p) => clamp(190 - height(1000 / p), 8, 190)) : null;
    const line = ys
      ? ys.map((y, i) => `${i ? 'L' : 'M'}${((i / (ys.length - 1)) * 400).toFixed(1)} ${y.toFixed(1)}`).join('')
      : null;
    return { cols, line, ys };
  }, [activity]);
  const px = at * 400;
  // The replay dot rides the pace line, read from the same samples.
  let dotY = null;
  if (shape.ys && played) {
    const x = at * (shape.ys.length - 1);
    const i = Math.min(shape.ys.length - 2, Math.floor(x));
    dotY = shape.ys[i] + (shape.ys[i + 1] - shape.ys[i]) * (x - i);
  }
  return (
    <div className="gym-rl-skyline" onPointerDown={onPointerDown} onPointerMove={onPointerMove}>
      <svg viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden="true">
        {[70, 110, 150].map((y) => (
          <line key={y} x1="0" x2="400" y1={y} y2={y} className="gym-rl-spark-grid" />
        ))}
        {shape.cols.map((c) => {
          const done = !played || c.x + c.w <= px;
          const now = played && px >= c.x && px < c.x + c.w;
          return (
            <rect
              key={c.s.km}
              x={c.x + 1.5}
              y={190 - c.h}
              width={Math.max(1, c.w - 3)}
              height={c.h}
              className={`gym-rl-col ${c.best ? 'is-best' : ''} ${done ? 'is-done' : ''} ${now ? 'is-now' : ''}`}
            />
          );
        })}
        {shape.line && <path d={shape.line} className="gym-rl-skyline-line" />}
        <line x1="0" x2="400" y1="190.5" y2="190.5" className="gym-rl-weeks-base" />
        {played && <line x1={px} x2={px} y1="0" y2="200" className="gym-rl-playhead is-strong" />}
      </svg>
      {dotY != null && (
        <span
          className="gym-rl-profile-dot is-big"
          style={{ '--spark': '#fc5200', left: `${at * 100}%`, top: `calc((100% - 16px) * ${dotY / 200})` }}
        />
      )}
      <div className="gym-rl-skyline-labels" aria-hidden="true">
        {shape.cols.map((c) => (
          <span key={c.s.km} style={{ left: `${((c.x + c.w / 2) / 400) * 100}%` }} className={c.best ? 'is-best' : ''}>
            {c.w > 26 ? (c.s.distance < 950 ? (c.s.distance / 1000).toFixed(1) : `KM${c.s.km}`) : ''}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ detail */

/**
 * One activity, laid out like a real activity page. The hero replays the
 * activity: a dot runs the route (or the splits, when there is no map) at
 * the recorded pace, with live distance, time, pace and heart rate.
 * The parent calls `toggle()` through the ref when A is pressed.
 */
const ActivityDetail = forwardRef(function ActivityDetail({ activity: a }, ref) {
  const timeline = useMemo(() => buildTimeline(a), [a]);
  const [clock, setClock] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(false);
  const clockRef = useRef(0);
  const type = meta(a.type);
  const flags = a.flags || [];
  const stopped = a.elapsedTime - a.movingTime;
  const hasRoute = !!a.route?.points?.length;

  const setBoth = (t) => {
    clockRef.current = t;
    setClock(t);
  };

  const toggle = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (clockRef.current >= timeline.duration - 0.01) setBoth(0);
    setPlayed(true);
    setPlaying(true);
  };
  useImperativeHandle(ref, () => ({ toggle }));

  // Plays once on its own, after the route has drawn in; not at all for
  // anyone who has asked for less motion.
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setTimeout(() => {
      setPlayed(true);
      setPlaying(true);
    }, 1250);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!playing) return undefined;
    const rate = timeline.duration / replaySeconds(timeline.total);
    let frame = 0;
    let last = performance.now();
    const step = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const next = Math.min(timeline.duration, clockRef.current + dt * rate);
      clockRef.current = next;
      setClock(next);
      if (next >= timeline.duration) setPlaying(false);
      else frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [playing, timeline]);

  const scrub = (fraction) => {
    setPlaying(false);
    setPlayed(true);
    setBoth(timeline.timeAt(fraction * timeline.total));
  };
  // Scrubbing follows a finger or a held button across the track or charts.
  const scrubDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    scrub(fractionOf(e));
  };
  const scrubMove = (e) => {
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) scrub(fractionOf(e));
  };

  const finished = played && clock >= timeline.duration - 0.01;
  const live = played && !finished;
  const d = played ? timeline.distanceAt(clock) : timeline.total;
  const at = d / timeline.total;
  const pace = live ? timeline.paceAt(d) : paceOf(a);
  const hr = live ? timeline.hrAt(d) : a.avgHeartRate;
  const ele = timeline.eleAt(d);
  const currentKm = live ? Math.floor(d / 1000) + 1 : null;

  const readout = (
    <dl className={`gym-rl-readout ${live ? 'is-live' : ''}`}>
      <div>
        <dt>DISTANCE</dt>
        <dd>{formatKm(d)}</dd>
      </div>
      <div>
        <dt>{live ? 'TIME' : 'MOVING TIME'}</dt>
        <dd>{formatDuration(played ? clock : a.movingTime)}</dd>
      </div>
      <div>
        <dt>{live ? speedLabel(a.type) : `AVG ${speedLabel(a.type)}`}</dt>
        <dd className="is-orange">{speedText(a.type, pace)}</dd>
      </div>
      <div>
        <dt>{live ? 'HEART RATE' : 'AVG HR'}</dt>
        <dd className="is-red">{bpm(hr)}</dd>
      </div>
    </dl>
  );

  const kmTicks = [];
  for (let k = 1; k * 1000 < timeline.total - 80; k++) kmTicks.push((k * 1000) / timeline.total);
  const axisEvery = timeline.total > 12000 ? 5 : timeline.total > 6000 ? 2 : 1;
  const paceProfile = hasRoute && a.type !== 'Swim' ? cleanPace(a.pace) : null;
  const hasProfiles = !!(paceProfile || a.heartRate || a.elevation);

  return (
    <article className="gym-rl-detail">
      <header className="gym-rl-head">
        <div className="gym-rl-head-meta">
          <span className="gym-chip" style={{ '--chip': type.color }}>
            {type.label}
          </span>
          <span className="gym-rl-date">{longDate(a)}</span>
        </div>
        <h3 className="gym-rl-title">{a.name}</h3>
      </header>

      {/* Flags up top: a replay of impossible data should say so before it plays. */}
      {flags.map((f, i) => (
        <p key={i} className={`gym-rl-flag ${f.kind === 'suspect' ? 'is-suspect' : ''}`}>
          <span className="px-font">{f.kind === 'suspect' ? '⚑ FLAGGED' : 'NOTE'}</span> {sentence(f.reason)}
          {f.kind === 'suspect' && ' Listed, but left out of every total and best.'}
        </p>
      ))}

      <div className={`gym-rl-hero px-box ${hasRoute ? 'has-map' : 'no-map'}`}>
        {hasRoute ? (
          <>
            <RouteMap
              route={a.route}
              height="100%"
              animate
              progress={played ? at : null}
              inset={[{ left: 200 }, { top: 108 }]}
            />
            {readout}
            <span className="gym-rl-maptag">{formatKm(a.distance)}</span>
          </>
        ) : (
          <>
            {readout}
            <Skyline activity={a} at={at} played={played} onPointerDown={scrubDown} onPointerMove={scrubMove} />
            <span className="gym-rl-nomap">NO MAP ON THIS ONE</span>
          </>
        )}
      </div>

      <div className="gym-rl-scrub">
        <button type="button" className="gym-rl-play" onClick={toggle} aria-label={playing ? 'Pause replay' : 'Play replay'}>
          <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" shapeRendering="crispEdges">
            {playing ? (
              <path d="M2 1h2v8H2zM6 1h2v8H6z" fill="currentColor" />
            ) : (
              <path d="M2 1h1v8H2zM3 2h1v6H3zM4 3h1v4H4zM5 4h1v2H5z" fill="currentColor" />
            )}
          </svg>
          <span>{playing ? 'PAUSE' : finished ? 'REPLAY' : 'PLAY'}</span>
          <span className="gym-rl-play-key">A</span>
        </button>
        <span className="gym-rl-scrub-time">{formatDuration(played ? clock : 0)}</span>
        <div
          className="gym-rl-track"
          onPointerDown={scrubDown}
          onPointerMove={scrubMove}
          role="slider"
          aria-label="Replay position"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round((played ? at : 0) * 100)}
        >
          <span className="gym-rl-track-fill" style={{ width: `${(played ? at : 0) * 100}%` }} />
          {kmTicks.map((t) => (
            <span key={t} className="gym-rl-track-tick" style={{ left: `${t * 100}%` }} />
          ))}
          <span className="gym-rl-track-knob" style={{ left: `${(played ? at : 0) * 100}%` }} />
        </div>
        <span className="gym-rl-scrub-time">{formatDuration(timeline.duration)}</span>
      </div>

      <dl className="gym-rl-stats">
        <div>
          <dt>DISTANCE</dt>
          <dd>{formatKm(a.distance)}</dd>
        </div>
        <div>
          <dt>MOVING TIME</dt>
          <dd>{formatDuration(a.movingTime)}</dd>
          {stopped > 60 && <span className="gym-rl-sub">+{formatDuration(stopped)} STOPPED</span>}
        </div>
        <div>
          <dt>{a.type === 'Ride' ? 'AVG SPEED' : 'AVG PACE'}</dt>
          <dd>{speedText(a.type, paceOf(a))}</dd>
        </div>
        <div>
          <dt>ELEVATION GAIN</dt>
          <dd>{Math.round(a.elevationGain || 0)} M</dd>
        </div>
        <div>
          <dt>AVG HR</dt>
          <dd>{bpm(a.avgHeartRate)}</dd>
          {a.maxHeartRate && <span className="gym-rl-sub">MAX {Math.round(a.maxHeartRate)}</span>}
        </div>
        <div>
          <dt>CALORIES</dt>
          <dd>{a.calories ? Math.round(a.calories).toLocaleString('en-US') : '—'}</dd>
        </div>
      </dl>

      {hasProfiles && (
        <section className="gym-rl-analysis" aria-label="Pace, heart rate and elevation over distance">
          <div className="gym-rl-analysis-plots" onPointerDown={scrubDown} onPointerMove={scrubMove}>
            {paceProfile && (
              <Profile
                label={speedLabel(a.type)}
                values={a.type === 'Ride' ? paceProfile.map((p) => 3600 / p) : paceProfile}
                color="#fc5200"
                invert={a.type !== 'Ride'}
                at={at}
                live={live ? speedText(a.type, pace) : ''}
                format={(v) => (a.type === 'Ride' ? `${v.toFixed(0)} KM/H` : formatPace(v).replace(' /KM', ''))}
              />
            )}
            <Profile
              label="HEART RATE"
              values={a.heartRate}
              color="#ff4d5e"
              minSpan={20}
              at={at}
              live={live ? bpm(hr) : ''}
              format={(v) => `${Math.round(v)} BPM`}
            />
            {/* Elevation samples are metres above the activity's lowest point. */}
            <Profile
              label="ELEVATION"
              values={a.elevation}
              color="#8fa3c7"
              minSpan={24}
              at={at}
              live={live && ele != null ? `+${Math.round(ele)} M` : ''}
              format={(v) => `${Math.round(v)} M`}
              caption={a.elevation ? `${Math.round(Math.max(...a.elevation) - Math.min(...a.elevation))} M RANGE` : undefined}
            />
          </div>
          <div className="gym-rl-axis" aria-hidden="true">
            <span style={{ left: 0, transform: 'none' }}>0</span>
            {kmTicks.map((t, i) =>
              (i + 1) % axisEvery === 0 && t < 0.92 ? (
                <span key={t} style={{ left: `${t * 100}%` }}>
                  {i + 1}
                </span>
              ) : null
            )}
            <span style={{ left: '100%', transform: 'translateX(-100%)' }}>{formatKm(a.distance, 1)}</span>
          </div>
        </section>
      )}

      <Splits activity={a} currentKm={currentKm} />
    </article>
  );
});

/* ------------------------------------------------------------ sheet */

/** Every Strava activity: totals, a weekly chart, and a replay of each one. */
export default function RunLog({ input, audio, onClose }) {
  const [tab, setTab] = useState(0);
  const [selected, setSelected] = useState(0);
  const pointerAt = useRef(0);
  const detail = useRef(null);
  const pane = useRef(null);
  const type = TABS[tab];
  const list = useMemo(() => ACTIVITIES.filter((a) => type === 'all' || a.type === type), [type]);
  const activity = list[Math.min(selected, list.length - 1)] || null;

  // The build script's totals already leave out flagged activities; the
  // fallback does the same if an older data file lacks them.
  const totals = useMemo(() => {
    const valid = ACTIVITIES.filter((a) => !isSuspect(a));
    const sum = (key) => valid.reduce((s, a) => s + (a[key] || 0), 0);
    return {
      count: TOTALS?.activities ?? ACTIVITIES.length,
      distance: TOTALS?.distance ?? sum('distance'),
      time: TOTALS?.movingTime ?? sum('movingTime'),
      climb: TOTALS?.elevationGain ?? sum('elevationGain'),
    };
  }, []);
  const counts = useMemo(() => {
    const c = { all: ACTIVITIES.length };
    for (const a of ACTIVITIES) c[a.type] = (c[a.type] || 0) + 1;
    return c;
  }, []);

  const switchTab = (delta) => {
    audio?.play('move');
    setTab((t) => (t + delta + TABS.length) % TABS.length);
    setSelected(0);
  };

  // A fallback layer under the list's Menu, so B and the tab keys still work
  // on a tab with nothing in it (no Menu is mounted there).
  useInputLayer(
    input,
    {
      onPress(button) {
        if (button === 'b' || button === 'start') {
          audio?.play('back');
          onClose();
        } else if (button === 'left') switchTab(-1);
        else if (button === 'right') switchTab(1);
      },
    },
    LAYER.sheet
  );

  const fastest5k = BESTS?.fastest5k;
  const longest = BESTS?.longestRun;

  return (
    <div className="gym-overlay" role="dialog" aria-label="Run club">
      <div className="gym-sheet gym-runlog px-box">
        <header className="gym-sheet-head">
          <div>
            <p className="gym-eyebrow">
              RUN CLUB · <span className="gym-rl-strava">SYNCED FROM STRAVA</span>
            </p>
            <h2 className="gym-sheet-title">EVERY KM ON THE WATCH</h2>
          </div>
          <button type="button" className="gym-close" onClick={onClose}>
            B · CLOSE
          </button>
        </header>

        <div className="gym-rl-top">
          <dl className="gym-rl-totals">
            <div>
              <dt>DISTANCE</dt>
              <dd>{(totals.distance / 1000).toFixed(1)} KM</dd>
            </div>
            <div>
              <dt>MOVING</dt>
              <dd>{hours(totals.time)}</dd>
            </div>
            <div>
              <dt>CLIMBED</dt>
              <dd>{Math.round(totals.climb).toLocaleString('en-US')} M</dd>
            </div>
            <div>
              <dt>ACTIVITIES</dt>
              <dd>{totals.count}</dd>
            </div>
            <div>
              <dt>FASTEST 5K</dt>
              <dd className="is-gold">{fastest5k ? formatDuration(fastest5k.seconds) : '—'}</dd>
            </div>
            <div>
              <dt>LONGEST RUN</dt>
              <dd>{longest ? formatKm(longest.distance) : '—'}</dd>
            </div>
          </dl>
          <WeeklyChart selected={activity} />
        </div>

        <div className="gym-tabs gym-rl-tabs" role="tablist">
          {TABS.map((t, i) => (
            <button
              type="button"
              role="tab"
              key={t}
              aria-selected={i === tab}
              className={`gym-tab ${i === tab ? 'is-active' : ''}`}
              style={t !== 'all' ? { '--chip': meta(t).color } : undefined}
              onClick={() => {
                audio?.play('move');
                setTab(i);
                setSelected(0);
              }}
            >
              {t === 'all' ? 'ALL' : meta(t).label} <span className="gym-rl-count">{counts[t] || 0}</span>
            </button>
          ))}
          <span className="gym-rl-keys" aria-hidden="true">
            ◀▶ SPORT · A REPLAY
          </span>
        </div>

        <div className="gym-sheet-body gym-rl-body">
          <div
            className="gym-sheet-list is-focus gym-rl-list"
            onPointerDownCapture={() => {
              pointerAt.current = performance.now();
            }}
          >
            {list.length ? (
              <Menu
                key={type}
                items={list.map((a) => {
                  const m = meta(a.type);
                  return {
                    key: a.id,
                    label: (
                      <span className="gym-rl-row">
                        <span className="gym-rl-row-meta">
                          <span style={{ color: m.color }}>{m.label}</span> · {shortDate(a)}
                          {isSuspect(a) && <span className="gym-rl-row-flag"> · ⚑</span>}
                        </span>
                        <span className="gym-rl-row-name">{a.name}</span>
                      </span>
                    ),
                    detail: (
                      <span className="gym-rl-row-nums">
                        <span>{formatKm(a.distance)}</span>
                        <span className="gym-muted">{speedText(a.type, paceOf(a))}</span>
                      </span>
                    ),
                  };
                })}
                input={input}
                audio={audio}
                priority={LAYER.sheet + 1}
                onHighlight={(_, i) => {
                  setSelected(i);
                  // On a phone the detail sits under the list; after a tap, bring it up.
                  if (performance.now() - pointerAt.current < 700 && matchMedia('(max-width: 760px)').matches) {
                    requestAnimationFrame(() => pane.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
                  }
                }}
                onSelect={() => {
                  // A tap or click just picks the row; the A button replays it.
                  if (performance.now() - pointerAt.current < 700) return;
                  detail.current?.toggle();
                }}
                onKey={(b) => (b === 'left' ? switchTab(-1) : b === 'right' ? switchTab(1) : null)}
                onCancel={onClose}
                label="Activities"
              />
            ) : (
              <p className="gym-note gym-rl-empty">Nothing logged here yet.</p>
            )}
          </div>
          <div className="gym-sheet-detail gym-rl-pane" ref={pane}>
            {activity && <ActivityDetail key={activity.id} ref={detail} activity={activity} />}
          </div>
        </div>
      </div>
    </div>
  );
}
