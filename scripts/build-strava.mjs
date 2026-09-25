#!/usr/bin/env node
/**
 * Turns a Strava bulk export into src/data/strava.json, the small public file
 * PR Quest reads for runs, walks and rides.
 *
 *   npm run strava                                  reads ./strava-export
 *   npm run strava -- --export=path/to/export --tz=Asia/Kolkata
 *
 * The export is mostly private: contacts, login IPs, device IDs, messages and
 * the privacy zones themselves. This script opens only activities.csv, the
 * track files in activities/ and privacy_zones.csv. What it writes has no
 * absolute coordinates, Strava IDs, gear, notes, descriptions, weather or
 * media. Routes are shapes in a unit box with both ends cut away, so they can
 * be drawn but not placed on a map, and the output is checked for leaks
 * before it is written.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARGS = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((arg) => arg.startsWith('--'))
    .map((arg) => {
      const [key, ...rest] = arg.slice(2).split('=');
      return [key, rest.join('=')];
    })
);
const EXPORT_DIR = path.resolve(ROOT, ARGS.export || 'strava-export');
const TRACK_DIR = path.join(EXPORT_DIR, 'activities');
const OUT_FILE = path.join(ROOT, 'src', 'data', 'strava.json');

/**
 * Strava writes every date in UTC; the page shows the athlete's wall clock.
 * Asia/Kolkata is where the Hevy log's morning sessions line up.
 */
const TIMEZONE = ARGS.tz || process.env.STRAVA_TZ || 'Asia/Kolkata';

/** Cut from each end of a route, and the radius kept clear around each end. */
const TRIM_METRES = 300;
/** A route shorter than this after trimming says little and gives away a lot. */
const MIN_ROUTE_METRES = 1000;
const MAX_ROUTE_POINTS = 160;
/** Douglas–Peucker never simplifies finer than this; GPS is not that precise. */
const MIN_ROUTE_TOLERANCE = 2;
/** Extra clearance around a Strava privacy zone, beyond its own radius. */
const ZONE_BUFFER = 50;
/** Points per elevation, heart-rate and pace profile. */
const SAMPLES = 60;
/** A hole in the recording longer than this is a pause: no time, no distance. */
const GAP_SECONDS = 10;
/**
 * Slower than this over ±SPEED_WINDOW seconds is standing still. Only a
 * fallback: measureTrack solves the threshold per activity from Strava's own
 * moving time when the CSV has one.
 */
const STOP_SPEED = 0.5;
const SPEED_WINDOW = 5;
/** GPS wander smaller than this between fixes is noise, not movement. */
const MIN_STEP = 3;
/** Pace profile clips (s/km): faster than PACE_FLOOR on foot is a GPS jump. */
const PACE_FLOOR = { Run: 150, Walk: 150, Hike: 150 };
const DEFAULT_PACE_FLOOR = 60;
const PACE_CAP = 1800;
/** Share of a best-effort window that may be covered while the clock was stopped. */
const FREE_DISTANCE = 0.05;
/**
 * On foot, a sustained speed this many times the activity's average (and at
 * least VEHICLE_FLOOR m/s) is a car or a bus, not a finishing kick.
 */
const VEHICLE_FACTOR = 2.5;
const VEHICLE_FLOOR = 4.5;
const ON_FOOT = new Set(['Run', 'Walk', 'Hike', 'TrailRun', 'VirtualRun']);
const EARTH_RADIUS = 6371008.8;
const RAD = Math.PI / 180;

/**
 * Average speeds (m/s) nobody manages for the type. Above these the activity
 * is listed but kept out of bests and per-type totals.
 */
const PLAUSIBLE_SPEED = { Run: 7, Walk: 3, Hike: 3, Swim: 2.5, Ride: 20, EBikeRide: 25 };
/** Instantaneous speeds (m/s) no human reaches: GPS spikes, not efforts. */
const TOP_SPEED = { Run: 12.5, Walk: 12.5, Hike: 12.5, Swim: 3, Ride: 30, EBikeRide: 30 };
const DEFAULT_TOP_SPEED = 30;

const SUSPECT_TAIL = {
  Swim: 'faster than the world record, probably a GPS glitch or a ride logged as a swim',
  Run: 'world-record pace, probably a GPS glitch or a ride logged as a run',
  Walk: 'too fast for a walk, probably a run or a ride logged as a walk',
  Hike: 'too fast for a hike, probably a run or a ride logged as a hike',
  Ride: 'faster than the hour record, probably a GPS glitch or a drive logged as a ride',
};

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

const die = (message) => {
  console.error(`\n  ${message}\n`);
  process.exit(1);
};

const round = (value, digits = 0) => {
  const factor = 10 ** digits;
  const result = Math.round(value * factor) / factor;
  return Object.is(result, -0) ? 0 : result;
};

const pad = (value) => String(value).padStart(2, '0');

const toNumber = (value) => {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

/* ------------------------------------------------------------------------ */
/* CSV                                                                      */
/* ------------------------------------------------------------------------ */

/**
 * RFC 4180 rows as arrays. activities.csv repeats header names ("Distance"
 * is km in the owner's units at one index and metres at another), so rows are
 * kept positional rather than turned into name → value objects, which would
 * silently keep only one of each pair.
 */
export function parseCsvRows(text) {
  const source = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (quoted) {
      if (c !== '"') field += c;
      else if (source[i + 1] === '"') {
        field += '"';
        i++;
      } else quoted = false;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c !== '\r') field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ''));
}

/** Index of the nth column with this header, or -1. */
export function columnIndex(header, name, occurrence = 0) {
  let seen = 0;
  for (let i = 0; i < header.length; i++) {
    if (header[i].trim() === name && seen++ === occurrence) return i;
  }
  return -1;
}

/* ------------------------------------------------------------------------ */
/* Dates                                                                    */
/* ------------------------------------------------------------------------ */

/** "Sep 25, 2026, 2:13:05 PM", always UTC in a Strava export. Returns ms. */
export function parseStravaDate(value) {
  const text = (value || '').trim();
  const match =
    /^([A-Za-z]{3})[a-z]*\.? (\d{1,2}),? (\d{4}),? (\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AP]M)?$/i.exec(
      text
    );
  if (match) {
    const month = MONTHS[match[1].toLowerCase()];
    let hour = Number(match[4]);
    if (match[7]) hour = (hour % 12) + (/pm/i.test(match[7]) ? 12 : 0);
    if (month !== undefined) {
      return Date.UTC(
        Number(match[3]),
        month,
        Number(match[2]),
        hour,
        Number(match[5]),
        Number(match[6] || 0)
      );
    }
  }
  const parsed = Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(text) ? text : `${text} UTC`);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * ISO 8601 in the athlete's zone with its offset, e.g.
 * 2026-07-14T06:55:03+05:30. Computed through Intl so zones with daylight
 * saving get the offset that applied on the day.
 */
export function zonedIso(ms, timeZone) {
  const whole = Math.floor(ms / 1000) * 1000;
  const parts = {};
  const format = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  for (const { type, value } of format.formatToParts(new Date(whole))) parts[type] = value;
  const wall = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second)
  );
  const offset = Math.round((wall - whole) / 60000);
  const sign = offset < 0 ? '-' : '+';
  const abs = Math.abs(offset);
  const hour = pad(Number(parts.hour) % 24);
  return `${parts.year}-${parts.month}-${parts.day}T${hour}:${parts.minute}:${parts.second}${sign}${pad(
    Math.floor(abs / 60)
  )}:${pad(abs % 60)}`;
}

/* ------------------------------------------------------------------------ */
/* Track files                                                              */
/* ------------------------------------------------------------------------ */

const GPX_POINT = /<trkpt\b([^>]*?)(?:\/>|>([\s\S]*?)<\/trkpt>)/g;
const GPX_LAT = /\blat\s*=\s*["']([^"']+)["']/;
const GPX_LON = /\blon\s*=\s*["']([^"']+)["']/;
const GPX_ELE = /<ele>([^<]+)<\/ele>/;
const GPX_TIME = /<time>([^<]+)<\/time>/;
const GPX_HR = /<(?:[\w-]+:)?hr>([^<]+)</;

const TCX_POINT = /<Trackpoint>([\s\S]*?)<\/Trackpoint>/g;
const TCX_TIME = /<Time>([^<]+)<\/Time>/;
const TCX_LAT = /<LatitudeDegrees>([^<]+)</;
const TCX_LON = /<LongitudeDegrees>([^<]+)</;
const TCX_ALT = /<AltitudeMeters>([^<]+)</;
const TCX_DIST = /<DistanceMeters>([^<]+)</;
const TCX_HR = /<HeartRateBpm>\s*<Value>([^<]+)</;

const pick = (pattern, text) => {
  const match = text && pattern.exec(text);
  return match ? toNumber(match[1]) : null;
};

const pickTime = (pattern, text) => {
  const match = text && pattern.exec(text);
  if (!match) return null;
  const ms = Date.parse(match[1].trim());
  return Number.isNaN(ms) ? null : ms;
};

/** A fix at 0,0 or off the globe is a device that had no signal yet. */
const validFix = (lat, lon) =>
  lat !== null && lon !== null && Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && (lat || lon);

function point(t, lat, lon, ele, hr, dist) {
  const fix = validFix(lat, lon);
  return {
    t,
    lat: fix ? lat : null,
    lon: fix ? lon : null,
    ele,
    hr: hr !== null && hr > 0 ? hr : null,
    dist,
  };
}

function parseGpx(xml) {
  const points = [];
  for (const [, attrs, body = ''] of xml.matchAll(GPX_POINT)) {
    const t = pickTime(GPX_TIME, body);
    if (t === null) continue;
    points.push(
      point(t, pick(GPX_LAT, attrs), pick(GPX_LON, attrs), pick(GPX_ELE, body), pick(GPX_HR, body), null)
    );
  }
  return points;
}

function parseTcx(xml) {
  const points = [];
  for (const [, body] of xml.matchAll(TCX_POINT)) {
    const t = pickTime(TCX_TIME, body);
    if (t === null) continue;
    points.push(
      point(
        t,
        pick(TCX_LAT, body),
        pick(TCX_LON, body),
        pick(TCX_ALT, body),
        pick(TCX_HR, body),
        pick(TCX_DIST, body)
      )
    );
  }
  return points;
}

/**
 * Reads one track from activities/. GPX and TCX (optionally gzipped) are
 * parsed; FIT is a binary format this script does not decode, so those come
 * back as `skipped` and the activity keeps its CSV stats without a track.
 */
export function readTrack(relative) {
  if (!relative) return { points: null, format: 'none' };
  const file = path.resolve(EXPORT_DIR, relative);
  // Only ever read inside activities/, whatever the CSV says.
  if (!file.startsWith(TRACK_DIR + path.sep) || !fs.existsSync(file)) {
    return { points: null, format: 'missing' };
  }
  // The file name is the Strava activity ID, so only the extension is ever reported.
  const format = (/\.((?:gpx|tcx|fit)(?:\.gz)?)$/i.exec(file) || [null, 'unknown'])[1].toLowerCase();
  if (!/^(gpx|tcx)(\.gz)?$/.test(format)) return { points: null, format, skipped: true };

  let buffer = fs.readFileSync(file);
  if (format.endsWith('.gz')) buffer = zlib.gunzipSync(buffer);
  const xml = buffer.toString('utf8');
  const points = format.startsWith('gpx') ? parseGpx(xml) : parseTcx(xml);
  points.sort((a, b) => a.t - b.t);
  return { points: points.length >= 2 ? points : null, format };
}

/* ------------------------------------------------------------------------ */
/* Geometry                                                                 */
/* ------------------------------------------------------------------------ */

export function haversine(a, b) {
  const dLat = (b.lat - a.lat) * RAD;
  const dLon = (b.lon - a.lon) * RAD;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Linear interpolation of ys at x, for non-decreasing xs; first-reach on flats. */
function interpolate(xs, ys, x) {
  const n = xs.length;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[n - 1]) {
    let i = n - 1;
    while (i > 0 && xs[i - 1] >= x) i--;
    return ys[i];
  }
  let lo = 0;
  let hi = n - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (xs[mid] >= x) hi = mid;
    else lo = mid + 1;
  }
  const span = xs[lo] - xs[lo - 1];
  if (span <= 0) return ys[lo];
  return ys[lo - 1] + ((x - xs[lo - 1]) / span) * (ys[lo] - ys[lo - 1]);
}

/** mulberry32: a small seeded generator, so route trims are stable between builds. */
function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function segmentDistance(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const length = dx * dx + dy * dy;
  let t = length ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / length : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}

function douglasPeucker(points, tolerance) {
  const last = points.length - 1;
  if (last < 2) return points.slice();
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[last] = 1;
  const stack = [[0, last]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let max = 0;
    let index = -1;
    for (let i = a + 1; i < b; i++) {
      const d = segmentDistance(points[i], points[a], points[b]);
      if (d > max) {
        max = d;
        index = i;
      }
    }
    if (index > 0 && max > tolerance) {
      keep[index] = 1;
      stack.push([a, index], [index, b]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

/** The finest Douglas–Peucker simplification that fits in maxPoints. */
function simplifyTo(points, maxPoints) {
  const finest = douglasPeucker(points, MIN_ROUTE_TOLERANCE);
  if (finest.length <= maxPoints) return finest;
  let lo = MIN_ROUTE_TOLERANCE;
  let hi = lo * 2;
  while (douglasPeucker(points, hi).length > maxPoints) hi *= 2;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (douglasPeucker(points, mid).length > maxPoints) lo = mid;
    else hi = mid;
  }
  return douglasPeucker(points, hi);
}

/* ------------------------------------------------------------------------ */
/* Track analysis                                                           */
/* ------------------------------------------------------------------------ */

/**
 * Distance and moving time along a track, counted the way Strava counts them.
 *
 * A hole in the recording longer than GAP_SECONDS is a pause: no time and no
 * distance, so a run carried on with the watch paused cannot show up as a
 * record. Everything else counts toward distance (from the device's odometer
 * when the file has one, otherwise from the fixes, ignoring jumps faster than
 * `topSpeed`), but only stretches faster than a threshold count toward the
 * clock. Strava never says what its threshold is and it differs by sport, so
 * it is solved per activity: the speed at which this track's moving time
 * comes out equal to the moving time Strava reported. That keeps splits and
 * best efforts in step with the headline numbers on the owner's Strava.
 *
 * Returns per-point cumulative arrays:
 *   dist     distance, pauses removed
 *   clock    moving time, calibrated to Strava's
 *   travel   distance covered while `clock` ran (trims routes by real movement)
 *   effort   time spent anywhere but standing still, so pace shows a slow
 *            shuffle as slow rather than as distance for free
 *   vehicle  time above `vehicleSpeed`: an on-foot track suddenly at car
 *            speed is a ride home with the watch still on
 * and a per-segment `moving` mask.
 */
export function measureTrack(
  points,
  { topSpeed = DEFAULT_TOP_SPEED, movingTime = null, avgSpeed = null, vehicleSpeed = Infinity } = {}
) {
  const n = points.length;
  const raw = new Float64Array(n);
  const odometer = points.filter((p) => p.dist !== null).length >= n * 0.5;

  if (odometer) {
    let last = 0;
    for (let i = 0; i < n; i++) {
      const value = points[i].dist;
      if (value !== null && value >= last) last = value;
      raw[i] = last;
    }
  } else {
    let anchor = null;
    let total = 0;
    let rejected = 0;
    for (let i = 0; i < n; i++) {
      const p = points[i];
      if (p.lat !== null) {
        if (!anchor) anchor = p;
        else {
          const step = haversine(anchor, p);
          const dt = (p.t - anchor.t) / 1000;
          const spike = dt > 0 && step / dt > topSpeed;
          if (spike && rejected < 5) rejected++;
          else if (spike) {
            // A jump that persists is a real relocation (signal regained): take
            // the new position but not the distance to it.
            anchor = p;
            rejected = 0;
          } else if (step >= MIN_STEP) {
            total += step;
            anchor = p;
            rejected = 0;
          }
        }
      }
      raw[i] = total;
    }
  }
  if (raw[n - 1] <= 0) return null;

  const dt = new Float64Array(n);
  const dd = new Float64Array(n);
  const skip = new Uint8Array(n);
  for (let i = 1; i < n; i++) {
    dt[i] = (points[i].t - points[i - 1].t) / 1000;
    dd[i] = raw[i] - raw[i - 1];
    skip[i] = dt[i] > GAP_SECONDS || dt[i] <= 0 ? 1 : 0;
  }

  // Speed around each segment over ±SPEED_WINDOW seconds, never across a pause.
  const speed = new Float64Array(n);
  for (let i = 1; i < n; i++) {
    if (skip[i]) continue;
    let lo = i - 1;
    let hi = i;
    while (lo > 0 && !skip[lo] && points[i - 1].t - points[lo - 1].t <= SPEED_WINDOW * 1000) lo--;
    while (hi < n - 1 && !skip[hi + 1] && points[hi + 1].t - points[i].t <= SPEED_WINDOW * 1000) hi++;
    speed[i] = (raw[hi] - raw[lo]) / ((points[hi].t - points[lo].t) / 1000);
  }

  const clockAt = (threshold) => {
    let total = 0;
    for (let i = 1; i < n; i++) if (!skip[i] && speed[i] >= threshold) total += dt[i];
    return total;
  };
  let threshold = STOP_SPEED;
  if (movingTime > 0) {
    // Never so high that genuine running at this activity's own pace stops the clock.
    const ceiling = Math.min(1.5, 0.6 * (avgSpeed || 2.5));
    let lo = 0;
    let hi = ceiling;
    for (let k = 0; k < 30; k++) {
      const mid = (lo + hi) / 2;
      if (clockAt(mid) > movingTime) lo = mid;
      else hi = mid;
    }
    threshold = Math.abs(clockAt(lo) - movingTime) <= Math.abs(clockAt(hi) - movingTime) ? lo : hi;
  }

  const dist = new Float64Array(n);
  const clock = new Float64Array(n);
  const travel = new Float64Array(n);
  const effort = new Float64Array(n);
  const vehicle = new Float64Array(n);
  const moving = new Uint8Array(n);
  const still = Math.min(threshold, STOP_SPEED);
  let vehicleMetres = 0;
  for (let i = 1; i < n; i++) {
    const isMoving = !skip[i] && speed[i] >= threshold;
    const isVehicle = !skip[i] && speed[i] > vehicleSpeed;
    moving[i] = isMoving ? 1 : 0;
    dist[i] = dist[i - 1] + (skip[i] ? 0 : dd[i]);
    clock[i] = clock[i - 1] + (isMoving ? dt[i] : 0);
    travel[i] = travel[i - 1] + (isMoving ? dd[i] : 0);
    effort[i] = effort[i - 1] + (!skip[i] && speed[i] >= still ? dt[i] : 0);
    vehicle[i] = vehicle[i - 1] + (isVehicle ? dt[i] : 0);
    if (isVehicle) vehicleMetres += dd[i];
  }
  if (dist[n - 1] <= 0 || clock[n - 1] <= 0) return null;
  return {
    dist,
    clock,
    travel,
    effort,
    vehicle,
    moving,
    length: dist[n - 1],
    movingTime: clock[n - 1],
    vehicleTime: vehicle[n - 1],
    vehicleMetres,
    threshold,
  };
}

/** Per-km splits on the moving clock; the last one partial with its real distance. */
export function splitsOf(series) {
  const { dist, clock, length } = series;
  const at = (x) => interpolate(dist, clock, x);
  const splits = [];
  const full = Math.floor(length / 1000);
  for (let km = 1; km <= full; km++) {
    splits.push({ km, seconds: round(at(km * 1000) - at((km - 1) * 1000)), distance: 1000 });
  }
  const rest = length - full * 1000;
  if (rest >= 10) {
    splits.push({ km: full + 1, seconds: round(at(length) - at(full * 1000)), distance: round(rest, 1) });
  }
  return splits;
}

/**
 * Fastest moving time to cover `metres` anywhere in the track, or null if too
 * short. As in Strava's moving time, distance shuffled while the clock was
 * stopped still counts; but a window where that is more than FREE_DISTANCE of
 * it is GPS drift rather than an effort, and a window with any vehicle-speed
 * stretch is not an effort at all.
 */
export function bestEffort(series, metres) {
  const { dist, clock, travel, vehicle, length } = series;
  if (length < metres) return null;
  let best = Infinity;
  for (let i = 0; i < dist.length && dist[i] + metres <= length; i++) {
    const end = dist[i] + metres;
    // clock[i] is the last moment at dist[i], so this is the effort after leaving it.
    const seconds = interpolate(dist, clock, end) - clock[i];
    if (!(seconds > 0 && seconds < best)) continue;
    if (metres - (interpolate(dist, travel, end) - travel[i]) > metres * FREE_DISTANCE) continue;
    if (interpolate(dist, vehicle, end) - vehicle[i] > 0) continue;
    best = seconds;
  }
  return Number.isFinite(best) ? round(best) : null;
}

/**
 * Mean of `value(point)` in SAMPLES buckets evenly spaced along distance;
 * empty buckets are filled from their neighbours. Averaging the bucket
 * doubles as smoothing for noisy GPS altitude.
 */
function profile(points, series, value) {
  const sums = new Float64Array(SAMPLES);
  const counts = new Uint32Array(SAMPLES);
  for (let i = 0; i < points.length; i++) {
    const v = value(points[i]);
    if (v === null || v === undefined) continue;
    const k = Math.round((series.dist[i] / series.length) * (SAMPLES - 1));
    sums[k] += v;
    counts[k]++;
  }
  const known = [];
  for (let k = 0; k < SAMPLES; k++) if (counts[k]) known.push(k);
  if (!known.length) return null;
  const xs = known;
  const ys = known.map((k) => sums[k] / counts[k]);
  return Array.from({ length: SAMPLES }, (_, k) => interpolate(xs, ys, k));
}

function elevationProfile(points, series) {
  if (points.filter((p) => p.ele !== null).length < points.length * 0.5) return null;
  const values = profile(points, series, (p) => p.ele);
  if (!values) return null;
  // Relative to the lowest point: the shape of the climb, not the altitude of the town.
  const low = Math.min(...values);
  return values.map((v) => round(v - low, 1));
}

function heartRateProfile(points, series) {
  const withHr = points.filter((p) => p.hr !== null).length;
  if (withHr < 10 || withHr < points.length * 0.1) return null;
  const values = profile(points, series, (p) => p.hr);
  return values && values.map((v) => round(v));
}

/**
 * Seconds per km at each sample, over a window of at least 200 m so single
 * GPS fixes do not show as sprints, then median-of-three to knock out what
 * is left. Timed on the `effort` clock: standing still is off it, but a slow
 * shuffle is on it and shows as slow. The cap handles crawls.
 */
export function paceProfile(series, floor = DEFAULT_PACE_FLOOR) {
  const { dist, effort, length } = series;
  if (length < 200) return null;
  const half = Math.max(100, length / (2 * (SAMPLES - 1)));
  const at = (x) => interpolate(dist, effort, x);
  const raw = Array.from({ length: SAMPLES }, (_, k) => {
    const x = (length * k) / (SAMPLES - 1);
    const from = Math.max(0, x - half);
    const to = Math.min(length, x + half);
    const pace = ((at(to) - at(from)) / (to - from)) * 1000;
    return Math.min(PACE_CAP, Math.max(floor, pace));
  });
  return raw.map((v, k) => {
    const window = [raw[Math.max(0, k - 1)], v, raw[Math.min(SAMPLES - 1, k + 1)]].sort((a, b) => a - b);
    return round(window[1]);
  });
}

/* ------------------------------------------------------------------------ */
/* Routes                                                                   */
/* ------------------------------------------------------------------------ */

/** privacy_zones.csv rows as { lat, lon, radius }. Fails closed on anything unreadable. */
function readPrivacyZones() {
  const file = path.join(EXPORT_DIR, 'privacy_zones.csv');
  if (!fs.existsSync(file)) return [];
  const [header = [], ...rows] = parseCsvRows(fs.readFileSync(file, 'utf8'));
  const where = header.findIndex((name) => /lat/i.test(name));
  const size = header.findIndex((name) => /radius/i.test(name));
  return rows.map((row, i) => {
    const numbers = (row[where] || '').match(/-?\d+(?:\.\d+)?/g) || [];
    const radiusText = (row[size] || '').toLowerCase();
    let radius = toNumber((radiusText.match(/\d+(?:\.\d+)?/) || [])[0]);
    if (/km/.test(radiusText)) radius *= 1000;
    else if (/mi/.test(radiusText)) radius *= 1609.344;
    else if (/ft|feet/.test(radiusText)) radius *= 0.3048;
    const lat = toNumber(numbers[0]);
    const lon = toNumber(numbers[1]);
    if (lat === null || lon === null || !validFix(lat, lon)) {
      die(`privacy_zones.csv row ${i + 1} has no readable position. Refusing to build routes without it.`);
    }
    // An unreadable radius gets Strava's largest zone rather than none.
    return { lat, lon, radius: (radius || 1600) + ZONE_BUFFER };
  });
}

/**
 * A route shape that cannot be put back on a map.
 *
 * Only the stretch between the first and last movement is used, so a watch
 * left running at home adds nothing. From that, TRIM_METRES of movement
 * comes off each end, and so does everything within TRIM_METRES in a straight
 * line of where the recording or the movement started or ended: a trim along
 * the track alone leaves laps of the block past the front door, and a phone
 * left on at home wanders far enough to use the trim up. Strava privacy zones
 * go too. Of what is left, the longest unbroken piece is kept, with another
 * 50–200 m (fixed per activity) off each end so its ends do not sit exactly
 * on the circle around home. It is then projected flat around its own
 * centre, simplified to MAX_ROUTE_POINTS, and scaled so each axis spans 0..1
 * independently: `aspect` is the real width / height, so a renderer draws it
 * in a box of that ratio.
 */
export function routeOf(points, series, zones) {
  const { moving, travel } = series;
  const first = Math.max(0, moving.indexOf(1) - 1);
  const last = moving.lastIndexOf(1);
  if (last < 1) return null;
  const total = travel[last];

  const fixes = [];
  const along = [];
  for (let i = first; i <= last; i++) {
    if (points[i].lat === null) continue;
    fixes.push(points[i]);
    along.push(travel[i]);
  }
  if (fixes.length < 10) return null;
  const recorded = points.filter((p) => p.lat !== null);
  const ends = [recorded[0], recorded[recorded.length - 1], fixes[0], fixes[fixes.length - 1]];

  const keep = fixes.map(
    (p, i) =>
      along[i] >= TRIM_METRES &&
      along[i] <= total - TRIM_METRES &&
      ends.every((end) => haversine(end, p) > TRIM_METRES) &&
      zones.every((zone) => haversine(zone, p) > zone.radius)
  );

  let best = null;
  for (let i = 0; i < fixes.length; ) {
    if (!keep[i]) {
      i++;
      continue;
    }
    let j = i;
    while (j + 1 < fixes.length && keep[j + 1]) j++;
    const length = along[j] - along[i];
    if (!best || length > best.length) best = { from: i, to: j, length };
    i = j + 1;
  }
  if (!best) return null;

  // Deterministic, so rebuilding does not churn the file, but not guessable from the output.
  const random = seededRandom(points[0].t);
  const from = along[best.from] + 50 + 150 * random();
  const to = along[best.to] - 50 - 150 * random();
  if (to - from < MIN_ROUTE_METRES) return null;
  while (along[best.from] < from) best.from++;
  while (along[best.to] > to) best.to--;

  const piece = fixes.slice(best.from, best.to + 1);
  const lat0 = piece.reduce((sum, p) => sum + p.lat, 0) / piece.length;
  const lon0 = piece.reduce((sum, p) => sum + p.lon, 0) / piece.length;
  const scaleX = EARTH_RADIUS * RAD * Math.cos(lat0 * RAD);
  const scaleY = EARTH_RADIUS * RAD;
  const flat = [];
  for (const p of piece) {
    const xy = [(p.lon - lon0) * scaleX, (p.lat - lat0) * scaleY];
    const prev = flat[flat.length - 1];
    if (!prev || Math.hypot(xy[0] - prev[0], xy[1] - prev[1]) >= 1) flat.push(xy);
  }
  const simple = simplifyTo(flat, MAX_ROUTE_POINTS);

  const xs = simple.map((p) => p[0]);
  const ys = simple.map((p) => p[1]);
  let minX = Math.min(...xs);
  let maxX = Math.max(...xs);
  let minY = Math.min(...ys);
  let maxY = Math.max(...ys);
  // A near-straight line would have one axis blown up from a few metres of wobble.
  const floor = Math.max(maxX - minX, maxY - minY) * 0.05;
  if (maxX - minX < floor) [minX, maxX] = [(minX + maxX - floor) / 2, (minX + maxX + floor) / 2];
  if (maxY - minY < floor) [minY, maxY] = [(minY + maxY - floor) / 2, (minY + maxY + floor) / 2];
  const width = maxX - minX;
  const height = maxY - minY;

  const out = [];
  for (const [x, y] of simple) {
    // y grows downwards, as in SVG and canvas, so north stays up.
    const next = [round((x - minX) / width, 3), round((maxY - y) / height, 3)];
    const prev = out[out.length - 1];
    if (!prev || prev[0] !== next[0] || prev[1] !== next[1]) out.push(next);
  }
  return { aspect: round(width / height, 2), points: out };
}

/* ------------------------------------------------------------------------ */
/* Names and flags                                                          */
/* ------------------------------------------------------------------------ */

/** Words after "with" that are not somebody's name. */
const NOT_A_NAME = new Set(
  `a an the my me myself him her them us you everyone someone nobody friends friend buddy buddies
  pals mates family team crew club squad gang group boys girls colleagues coworkers work mom mum
  dad bro sis wife husband partner kids kid son daughter brother sister parents cousin cousins
  dog dogs pup puppy music podcast weights weight ankle vest stroller pram rain pain style purpose
  headphones intervals strides hills sprints`
    .split(/\s+/)
    .filter(Boolean)
);

/**
 * Activity titles are the owner's own words and stay, but other people in
 * them do not: "Run with Sam" → "Run with a friend", "with Sam and Alex" →
 * "with friends", "@sam" → "a friend".
 */
export function redactName(name) {
  let result = name.trim();
  const named = (word) => !NOT_A_NAME.has(word.replace(/^@/, '').toLowerCase());

  result = result.replace(
    /\b(with|w\/|ft\.?|feat\.?)\s+(@?[A-Za-z]+(?:\s*(?:,|and|&)\s*@?[A-Za-z]+)+)\s*$/i,
    (whole, _lead, list) =>
      list.split(/\s*(?:,|\band\b|&)\s*/i).filter(Boolean).some(named) ? 'with friends' : whole
  );
  result = result.replace(/\b(with|w\/|ft\.?|feat\.?)\s+(@?[A-Za-z]+)\s*$/i, (whole, _lead, word) =>
    named(word) ? 'with a friend' : whole
  );
  // A capitalised name mid-title: "Run with Sam today".
  result = result.replace(/\bwith\s+(@?[A-Z][a-z]+)(?=\s)/g, (whole, word) =>
    named(word) ? 'with a friend' : whole
  );
  result = result.replace(/(^|\s)@[\w.]+/g, '$1a friend');
  return { name: result, redacted: result !== name.trim() };
}

function minutesText(seconds) {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

/* ------------------------------------------------------------------------ */
/* Output                                                                   */
/* ------------------------------------------------------------------------ */

const isFlatArray = (value) =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      item === null ||
      typeof item !== 'object' ||
      (Array.isArray(item) && item.every((x) => x === null || typeof x !== 'object'))
  );

/** Readable JSON that keeps number arrays on one line, so diffs stay small. */
function toJson(value, indent = '') {
  const compact = JSON.stringify(value);
  if (value === null || typeof value !== 'object' || compact.length <= 96 || isFlatArray(value)) {
    return compact;
  }
  const inner = `${indent}  `;
  if (Array.isArray(value)) {
    return `[\n${value.map((item) => inner + toJson(item, inner)).join(',\n')}\n${indent}]`;
  }
  const entries = Object.entries(value).filter(([, item]) => item !== undefined);
  return `{\n${entries
    .map(([key, item]) => `${inner}${JSON.stringify(key)}: ${toJson(item, inner)}`)
    .join(',\n')}\n${indent}}`;
}

/**
 * Last line of defence before anything is written: no coordinate-shaped keys,
 * every route point inside the unit box, and no raw export value (activity
 * IDs, file names, notes, gear) anywhere in the text. Messages never echo the
 * offending value.
 */
function assertSanitised(data, text, secrets) {
  const walk = (value, where) => {
    if (Array.isArray(value)) value.forEach((item, i) => walk(item, `${where}[${i}]`));
    else if (value && typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) {
        if (/^(lat|lon|lng|latitude|longitude|coords?|position|gear|note|filename)$/i.test(key)) {
          die(`Refusing to write: field "${key}" at ${where}.`);
        }
        walk(item, `${where}.${key}`);
      }
    }
  };
  walk(data, 'strava');
  for (const activity of data.activities) {
    const route = activity.route;
    if (!route) continue;
    if (route.points.length > MAX_ROUTE_POINTS) die(`Refusing to write: ${activity.id} route too long.`);
    for (const [x, y] of route.points) {
      if (!(x >= 0 && x <= 1 && y >= 0 && y <= 1)) die(`Refusing to write: ${activity.id} route leaves the unit box.`);
    }
  }
  for (const secret of secrets) {
    if (secret && secret.length >= 4 && text.includes(secret)) {
      die('Refusing to write: a raw value from the export (ID, file name, note or gear) is in the output.');
    }
  }
}

/* ------------------------------------------------------------------------ */
/* Build                                                                    */
/* ------------------------------------------------------------------------ */

function build() {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE });
  } catch {
    die(`Unknown time zone "${TIMEZONE}". Use an IANA name such as Asia/Kolkata.`);
  }
  const csvFile = path.join(EXPORT_DIR, 'activities.csv');
  if (!fs.existsSync(csvFile)) die(`No activities.csv in ${EXPORT_DIR}. Unzip the Strava export there first.`);

  const [header, ...rows] = parseCsvRows(fs.readFileSync(csvFile, 'utf8'));
  const col = (name, occurrence = 0) => columnIndex(header, name, occurrence);
  const either = (name) => (col(name, 1) >= 0 ? col(name, 1) : col(name, 0));
  const C = {
    id: col('Activity ID'),
    date: col('Activity Date'),
    name: col('Activity Name'),
    type: col('Activity Type'),
    note: col('Activity Private Note'),
    gear: col('Activity Gear'),
    file: col('Filename'),
    // The second "Distance" is metres; the first is km or miles, per the owner's units.
    distance: col('Distance', 1),
    elapsed: either('Elapsed Time'),
    moving: col('Moving Time'),
    maxSpeed: col('Max Speed'),
    avgSpeed: col('Average Speed'),
    elevationGain: col('Elevation Gain'),
    maxHr: either('Max Heart Rate'),
    avgHr: col('Average Heart Rate'),
    calories: col('Calories'),
  };
  for (const key of ['date', 'type', 'distance', 'moving']) {
    if (C[key] < 0) die(`activities.csv has no column for ${key}; the export format has changed.`);
  }

  // Which "Distance" is metres? The one that matches average speed × moving time.
  const agrees = rows.filter((row) => {
    const metres = toNumber(row[C.distance]);
    const speed = toNumber(row[C.avgSpeed]);
    const moving = toNumber(row[C.moving]);
    return metres && speed && moving && Math.abs(speed * moving - metres) / metres < 0.05;
  }).length;
  if (agrees < rows.length * 0.8) die('The second "Distance" column is not in metres; check the export.');

  const zones = readPrivacyZones();
  const secrets = [];
  const report = { formats: {}, skipped: {}, redacted: 0, distanceRatios: [], movingRatios: [] };

  const parsed = rows.map((row, index) => {
    const cell = (key) => (C[key] >= 0 ? row[C[key]] : '');
    secrets.push(cell('id'), cell('file'), cell('note'), cell('gear'));
    const startMs = parseStravaDate(cell('date'));
    if (startMs === null) die(`Row ${index + 1} of activities.csv has an unreadable date.`);

    const type = (cell('type') || 'Workout').trim();
    const { name, redacted } = redactName(cell('name') || `${type}`);
    if (redacted) report.redacted++;

    const track = readTrack(cell('file'));
    report.formats[track.format] = (report.formats[track.format] || 0) + 1;
    if (track.skipped) report.skipped[track.format] = (report.skipped[track.format] || 0) + 1;

    let distance = toNumber(cell('distance'));
    let movingTime = toNumber(cell('moving'));
    let elapsedTime = toNumber(cell('elapsed'));
    const csvSpeed = toNumber(cell('avgSpeed')) ?? (distance && movingTime ? distance / movingTime : null);
    const implausible = csvSpeed !== null && csvSpeed > (PLAUSIBLE_SPEED[type] ?? Infinity);
    const topSpeed = TOP_SPEED[type] ?? DEFAULT_TOP_SPEED;

    // A suspect activity is probably another sport, so its track is not filtered as this one.
    const series = track.points
      ? measureTrack(track.points, {
          topSpeed: implausible ? DEFAULT_TOP_SPEED : topSpeed,
          movingTime,
          avgSpeed: csvSpeed,
          vehicleSpeed:
            ON_FOOT.has(type) && !implausible
              ? Math.max(VEHICLE_FLOOR, VEHICLE_FACTOR * (csvSpeed || 0))
              : Infinity,
        })
      : null;
    let route = null;
    if (series) {
      // Fall back to the track for anything the CSV left blank.
      if (!distance) distance = series.length;
      if (!movingTime) movingTime = series.movingTime;
      if (!elapsedTime) elapsedTime = (track.points[track.points.length - 1].t - track.points[0].t) / 1000;
      report.distanceRatios.push(series.length / distance);
      report.movingRatios.push(series.movingTime / movingTime);
      // Trimmed on real metres, before the rescale below.
      route = routeOf(track.points, series, zones);
      // Stretch the track onto Strava's own distance so splits add up to the headline.
      const scale = distance / series.length;
      if (scale > 0.5 && scale < 2) {
        for (let i = 0; i < series.dist.length; i++) {
          series.dist[i] *= scale;
          series.travel[i] *= scale;
        }
        series.length = distance;
      }
    }
    distance = distance || 0;
    movingTime = movingTime || 0;
    elapsedTime = elapsedTime || movingTime;
    const avgSpeed = csvSpeed ?? (movingTime ? distance / movingTime : null);

    const flags = [];
    if (implausible) {
      const tail =
        SUSPECT_TAIL[type] ||
        `implausibly fast for a ${type.toLowerCase()}, probably a GPS glitch or the wrong activity type`;
      flags.push({
        kind: 'suspect',
        reason: `${round(distance / 1000, 1)} km ${type.toLowerCase()} in ${minutesText(movingTime)} — ${tail}`,
      });
    }
    if (series && series.vehicleTime >= 30) {
      flags.push({
        kind: 'note',
        reason: `${round(series.vehicleMetres / 1000, 1)} km at vehicle speed, probably a ride with the recording still on; left out of best efforts`,
      });
    }
    if (type === 'Run' && /\bwalk/i.test(name)) {
      flags.push({ kind: 'note', reason: 'logged as a run, named a walk' });
    }
    let maxSpeed = toNumber(cell('maxSpeed'));
    if (maxSpeed !== null && maxSpeed > topSpeed) {
      flags.push({ kind: 'note', reason: `max speed of ${round(maxSpeed, 1)} m/s dropped as a GPS spike` });
      maxSpeed = null;
    }
    if (elapsedTime - movingTime > 3600 && elapsedTime > movingTime * 3) {
      flags.push({
        kind: 'note',
        reason: `recording left running: ${minutesText(elapsedTime)} elapsed for ${minutesText(movingTime)} moving`,
      });
    }

    const hr = (key) => {
      const value = toNumber(cell(key));
      return value ? round(value) : null;
    };
    const calories = toNumber(cell('calories'));
    return {
      index,
      startMs,
      endMs: startMs + elapsedTime * 1000,
      activity: {
        id: null,
        type,
        name,
        start: zonedIso(startMs, TIMEZONE),
        distance: round(distance, 1),
        movingTime: round(movingTime),
        elapsedTime: round(elapsedTime),
        elevationGain: round(toNumber(cell('elevationGain')) || 0, 1),
        avgHeartRate: hr('avgHr'),
        maxHeartRate: hr('maxHr'),
        avgSpeed: avgSpeed === null ? null : round(avgSpeed, 2),
        maxSpeed: maxSpeed === null ? null : round(maxSpeed, 2),
        calories: calories ? round(calories) : null,
        splits: series ? splitsOf(series) : [],
        route,
        elevation: series ? elevationProfile(track.points, series) : null,
        heartRate: series ? heartRateProfile(track.points, series) : null,
        pace: series ? paceProfile(series, PACE_FLOOR[type] ?? DEFAULT_PACE_FLOOR) : null,
        flags,
      },
      series,
    };
  });

  // Oldest first for ids, so a01 is the first activity ever and ids stay stable.
  parsed.sort((a, b) => a.startMs - b.startMs || a.index - b.index);
  const width = Math.max(2, String(parsed.length).length);
  parsed.forEach((entry, i) => {
    entry.activity.id = `a${String(i + 1).padStart(width, '0')}`;
  });

  // Two devices recording the same outing (a watch and a phone).
  for (const a of parsed) {
    for (const b of parsed) {
      if (a === b) continue;
      const overlap = Math.min(a.endMs, b.endMs) - Math.max(a.startMs, b.startMs);
      const shorter = Math.min(a.endMs - a.startMs, b.endMs - b.startMs);
      if (shorter > 0 && overlap >= shorter * 0.5) {
        a.activity.flags.push({
          kind: 'note',
          reason: `recorded at the same time as ${b.activity.id}, probably on a second device`,
        });
      }
    }
  }

  const suspect = (entry) => entry.activity.flags.some((flag) => flag.kind === 'suspect');
  const counted = parsed.filter((entry) => !suspect(entry));

  const byType = {};
  for (const { activity } of counted) {
    const bucket = (byType[activity.type] ||= { count: 0, distance: 0, movingTime: 0, elevationGain: 0 });
    bucket.count++;
    bucket.distance += activity.distance;
    bucket.movingTime += activity.movingTime;
    bucket.elevationGain += activity.elevationGain;
  }
  for (const bucket of Object.values(byType)) {
    bucket.distance = round(bucket.distance, 1);
    bucket.elevationGain = round(bucket.elevationGain, 1);
  }
  const sum = (key) => counted.reduce((total, { activity }) => total + activity[key], 0);

  const runs = counted.filter(({ activity }) => activity.type === 'Run');
  const top = (list, score) =>
    list.reduce((best, entry) => {
      const value = score(entry);
      return value !== null && value !== undefined && (!best || value > best.value) ? { entry, value } : best;
    }, null);
  const longest = top(runs, ({ activity }) => activity.distance || null);
  const fastest = (metres) => {
    const winner = top(runs, ({ series }) => {
      const seconds = series ? bestEffort(series, metres) : null;
      return seconds ? -seconds : null;
    });
    return winner ? { id: winner.entry.activity.id, seconds: -winner.value } : null;
  };
  const climb = top(counted, ({ activity }) => activity.elevationGain || null);

  const newestFirst = [...parsed].reverse().map(({ activity }) => activity);
  const data = {
    version: 1,
    timezone: TIMEZONE,
    source: 'Strava bulk export',
    totals: {
      activities: parsed.length,
      // Distance, time and climbing leave out suspect activities, so they equal the sum of byType.
      excluded: parsed.length - counted.length,
      distance: round(sum('distance'), 1),
      movingTime: round(sum('movingTime')),
      elevationGain: round(sum('elevationGain'), 1),
      firstDate: parsed.length ? parsed[0].activity.start : null,
      lastDate: parsed.length ? parsed[parsed.length - 1].activity.start : null,
      byType,
    },
    bests: {
      longestRun: longest ? { id: longest.entry.activity.id, distance: longest.value } : null,
      fastest1k: fastest(1000),
      fastest5k: fastest(5000),
      biggestClimb: climb ? { id: climb.entry.activity.id, elevationGain: climb.value } : null,
    },
    activities: newestFirst,
  };

  const text = `${toJson(data)}\n`;
  assertSanitised(data, text, secrets);
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, text);
  summarise(data, report, Buffer.byteLength(text));
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/** Aggregates only: no names, coordinates or Strava IDs reach the terminal. */
function summarise(data, report, bytes) {
  const { totals, bests, activities } = data;
  const types = Object.entries(
    activities.reduce((acc, a) => ({ ...acc, [a.type]: (acc[a.type] || 0) + 1 }), {})
  )
    .map(([type, count]) => `${type} ${count}`)
    .join(', ');
  const mmss = (s) => `${Math.floor(s / 60)}:${pad(s % 60)}`;
  const flags = activities.flatMap((a) => a.flags);
  const routes = activities.filter((a) => a.route).length;
  const points = activities.reduce((n, a) => n + (a.route ? a.route.points.length : 0), 0);
  const formats = Object.entries(report.formats)
    .map(([format, count]) => `${count} ${format}`)
    .join(', ');
  const skipped = Object.entries(report.skipped)
    .map(([format, count]) => `${count} ${format}`)
    .join(', ');

  console.log(`\n  Strava → ${path.relative(ROOT, OUT_FILE)}`);
  console.log(`  ${totals.activities} activities (${types}), ${totals.firstDate.slice(0, 10)} → ${totals.lastDate.slice(0, 10)}, ${data.timezone}`);
  console.log(
    `  ${round(totals.distance / 1000, 1)} km, ${minutesText(totals.movingTime)} moving, ${round(totals.elevationGain)} m climbed` +
      (totals.excluded ? ` (leaving out ${totals.excluded} suspect)` : '')
  );
  console.log(
    `  bests: longest run ${bests.longestRun ? `${bests.longestRun.id} ${round(bests.longestRun.distance / 1000, 2)} km` : '-'}` +
      ` · 1k ${bests.fastest1k ? `${bests.fastest1k.id} ${mmss(bests.fastest1k.seconds)}` : '-'}` +
      ` · 5k ${bests.fastest5k ? `${bests.fastest5k.id} ${mmss(bests.fastest5k.seconds)}` : '-'}` +
      ` · climb ${bests.biggestClimb ? `${bests.biggestClimb.id} ${bests.biggestClimb.elevationGain} m` : '-'}`
  );
  console.log(
    `  flags: ${flags.filter((f) => f.kind === 'suspect').length} suspect, ${flags.filter((f) => f.kind === 'note').length} notes` +
      ` · names redacted: ${report.redacted}`
  );
  console.log(`  routes: ${routes} kept (${points} points), ${activities.length - routes} null`);
  console.log(
    `  tracks: ${formats}${skipped ? `; skipped ${skipped} (not parsed)` : ''}` +
      ` · track/Strava distance ×${round(median(report.distanceRatios) || 1, 3)}, moving time ×${round(median(report.movingRatios) || 1, 3)}`
  );
  console.log(`  wrote ${round(bytes / 1024, 1)} KB\n`);
}

// Importable for checks without side effects; builds when run directly.
const samePath = (a, b) => (process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b);
if (process.argv[1] && samePath(path.resolve(process.argv[1]), fileURLToPath(import.meta.url))) build();
