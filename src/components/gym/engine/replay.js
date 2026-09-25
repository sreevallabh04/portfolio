/**
 * A recorded activity as something you can play back: where it was at each
 * second, and what the pace, heart rate and elevation read there.
 *
 * The data has per-km splits (exact) and up to 60 pace samples along the
 * distance (the shape inside each km). The timeline uses the samples for the
 * shape and rescales every km to its recorded split, so the replay's clock
 * crosses each km line at the same time the watch did.
 */

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, t) => a + (b - a) * t;

/** Linear read of samples spread evenly over 0..total. */
function sampler(samples, total) {
  if (!samples || samples.length < 2) return null;
  const n = samples.length - 1;
  return (d) => {
    const x = clamp(d / total, 0, 1) * n;
    const i = Math.min(n - 1, Math.floor(x));
    const a = samples[i];
    const b = samples[i + 1];
    if (a == null || b == null) return a ?? b ?? null;
    return lerp(a, b, x - i);
  };
}

/**
 * Pause and GPS spikes show up as absurd paces; clamp around the median so a
 * red light doesn't read as 40:00 /km.
 */
export function cleanPace(samples) {
  const raw = (samples || []).filter((p) => Number.isFinite(p) && p > 0);
  if (raw.length < 4) return null;
  const sorted = [...raw].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  return samples.map((p) => (Number.isFinite(p) && p > 0 ? clamp(p, median * 0.6, median * 1.8) : median));
}

export function buildTimeline(activity) {
  const total = Math.max(1, activity.distance || 0);
  // About 10 m a cell, so km lines fall close to a cell edge and splits come out exact.
  const steps = Math.min(3000, Math.max(240, Math.ceil(total / 10)));
  const splits = (activity.splits || []).filter((s) => s.seconds > 0 && s.distance > 0);
  const avgSpeed = activity.movingTime > 0 ? total / activity.movingTime : activity.avgSpeed || 2.5;
  const pace = cleanPace(activity.pace);
  const paceAtRaw = pace ? sampler(pace, total) : () => 1000 / avgSpeed;

  const step = total / steps;
  const seg = new Float64Array(steps);
  for (let i = 0; i < steps; i++) seg[i] = (paceAtRaw((i + 0.5) * step) / 1000) * step;

  if (splits.length) {
    let start = 0;
    for (const s of splits) {
      const end = start + s.distance;
      let sum = 0;
      const idx = [];
      for (let i = 0; i < steps; i++) {
        const mid = (i + 0.5) * step;
        if (mid >= start && mid < end) {
          sum += seg[i];
          idx.push(i);
        }
      }
      if (sum > 0) {
        // Split distances don't always add up to the grid exactly; scale by
        // the share of the split this stretch of grid actually covers.
        const seconds = s.seconds * Math.min(1, (idx.length * step) / s.distance);
        for (const i of idx) seg[i] *= seconds / sum;
      }
      start = end;
    }
    for (let i = 0; i < steps; i++) if ((i + 0.5) * step >= start) seg[i] = step / avgSpeed;
  }
  // Rounded splits can drift a few seconds from the moving time; the clock
  // should end on the number the stats show.
  if (activity.movingTime > 0) {
    const sum = seg.reduce((x, y) => x + y, 0);
    for (let i = 0; i < steps; i++) seg[i] *= activity.movingTime / sum;
  }

  const times = new Float64Array(steps + 1);
  for (let i = 0; i < steps; i++) times[i + 1] = times[i] + seg[i];
  const duration = times[steps];

  const hrAt = sampler(activity.heartRate, total);
  const eleAt = sampler(activity.elevation, total);

  return {
    total,
    duration,
    /** Seconds on the clock when the activity reached `d` metres. */
    timeAt(d) {
      const x = clamp(d, 0, total) / step;
      const i = Math.min(steps - 1, Math.floor(x));
      return lerp(times[i], times[i + 1], x - i);
    },
    /** Metres covered `t` seconds in. */
    distanceAt(t) {
      if (t <= 0) return 0;
      if (t >= duration) return total;
      let lo = 0;
      let hi = steps;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (times[mid] <= t) lo = mid;
        else hi = mid;
      }
      return (lo + (t - times[lo]) / (times[lo + 1] - times[lo] || 1)) * step;
    },
    /** Seconds per km around `d`, from the same timeline the dot moves on. */
    paceAt(d) {
      const i = clamp(Math.floor(d / step), 0, steps - 1);
      // A short window so the readout doesn't flicker cell to cell.
      const a = Math.max(0, i - 2);
      const b = Math.min(steps, i + 3);
      return ((times[b] - times[a]) / ((b - a) * step)) * 1000;
    },
    hrAt: hrAt ? (d) => hrAt(d) : () => null,
    eleAt: eleAt ? (d) => eleAt(d) : () => null,
  };
}

/** Seconds of real time a replay takes: long enough to read, short enough to watch. */
export const replaySeconds = (distance) => clamp(5 + (distance / 1000) * 0.9, 7, 14);
