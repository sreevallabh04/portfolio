/**
 * Runtime view of src/data/strava.json, the sanitised Strava export written by
 * scripts/build-strava.mjs (`npm run strava`). Pure data and formatting, no
 * browser APIs, so it works the same in the page and in Node.
 *
 * Shapes worth knowing before drawing anything:
 *   - `start` is ISO 8601 with the athlete's offset; `startDate` is the Date.
 *   - `route` is null or { aspect, points }. Points are [x, y] with each axis
 *     scaled to 0..1 independently and y growing downwards (north up), so
 *     draw them into a box whose width / height is `aspect`, or use fitRoute.
 *   - `elevation` (metres above the activity's lowest point), `heartRate`
 *     (bpm) and `pace` (s/km) are null or up to 60 samples evenly spaced
 *     along the distance.
 *   - `maxSpeed` is null when the export's value was a GPS spike.
 *   - Flags of kind 'suspect' mark data no one could have produced (a 5 km
 *     swim in 17 minutes); those activities are listed but left out of RUNS,
 *     BESTS and the totals. Flags of kind 'note' are just explanations.
 */
import raw from '@/data/strava.json';

export function isSuspect(activity) {
  return Boolean(activity?.flags?.some((flag) => flag.kind === 'suspect'));
}

/** Newest first, each with `startDate`. */
export const ACTIVITIES = raw.activities
  .map((activity) => ({ ...activity, startDate: new Date(activity.start) }))
  .sort((a, b) => b.startDate - a.startDate);

export const STRAVA = { ...raw, activities: ACTIVITIES };

export const TOTALS = raw.totals;

export const RUNS = ACTIVITIES.filter((activity) => activity.type === 'Run' && !isSuspect(activity));

const BY_ID = new Map(ACTIVITIES.map((activity) => [activity.id, activity]));

export function activityById(id) {
  return BY_ID.get(id) ?? null;
}

/** { id, [key] } → { activity, [key] }, or null if either side is missing. */
const resolve = (best, key) => {
  const activity = best ? activityById(best.id) : null;
  return activity && best[key] !== undefined ? { activity, [key]: best[key] } : null;
};

export const BESTS = {
  longestRun: resolve(raw.bests?.longestRun, 'distance'),
  fastest1k: resolve(raw.bests?.fastest1k, 'seconds'),
  fastest5k: resolve(raw.bests?.fastest5k, 'seconds'),
  biggestClimb: resolve(raw.bests?.biggestClimb, 'elevationGain'),
};

/** Strava orange for runs; the rest picked to stay apart on the game's dark UI. */
export const TYPE_META = {
  Run: { label: 'RUN', color: '#fc5200' },
  Ride: { label: 'RIDE', color: '#3b82f6' },
  Walk: { label: 'WALK', color: '#3ee08f' },
  Swim: { label: 'SWIM', color: '#35c2ff' },
  default: { label: 'ACTIVITY', color: '#a3a3a3' },
};

/** Moving seconds per km, or null when there is no distance or time to divide. */
export function paceOf(activity) {
  if (!activity || !(activity.distance > 0) || !(activity.movingTime > 0)) return null;
  return activity.movingTime / (activity.distance / 1000);
}

const pad = (value) => String(value).padStart(2, '0');

/** 398.2 → '6:38 /KM'. Unknown pace reads as dashes rather than NaN. */
export function formatPace(secondsPerKm) {
  if (!Number.isFinite(secondsPerKm) || secondsPerKm <= 0) return '--:-- /KM';
  const total = Math.round(secondsPerKm);
  return `${Math.floor(total / 60)}:${pad(total % 60)} /KM`;
}

/** 1991 → '33:11', 5585 → '1:33:05'. */
export function formatDuration(seconds) {
  const total = Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds) : 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = total % 60;
  return hours ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${minutes}:${pad(rest)}`;
}

/** 5005.1 → '5.01 KM'. */
export function formatKm(metres, digits = 2) {
  const value = Number.isFinite(metres) ? metres : 0;
  return `${(value / 1000).toFixed(digits)} KM`;
}

/**
 * Route points in pixels, centred in a width × height box with `padding`
 * on every side and the real proportions restored from `aspect`. Returns []
 * for an activity without a route.
 */
export function fitRoute(route, width, height, padding = 0) {
  if (!route?.points?.length) return [];
  const boxW = Math.max(0, width - padding * 2);
  const boxH = Math.max(0, height - padding * 2);
  const aspect = route.aspect > 0 ? route.aspect : 1;
  const drawW = Math.min(boxW, boxH * aspect);
  const drawH = drawW / aspect;
  const left = (width - drawW) / 2;
  const top = (height - drawH) / 2;
  return route.points.map(([x, y]) => [left + x * drawW, top + y * drawH]);
}
