/**
 * Reader for a Hevy workout export (Profile → Settings → Export & Import →
 * Export Workouts). Hevy writes one CSV row per set:
 *
 *   title, start_time, end_time, description, exercise_title, superset_id,
 *   exercise_notes, set_index, set_type, weight_kg, reps, distance_km,
 *   duration_seconds, rpe
 *
 * Pure functions, no browser APIs, so it runs the same in Node and the page.
 */

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/** RFC 4180 CSV: quoted fields, doubled quotes, CRLF or LF line endings. */
export function parseCsv(text) {
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

  const [header = [], ...body] = rows;
  const keys = header.map((key) => key.trim());
  return body
    .filter((cells) => cells.length === keys.length)
    .map((cells) => Object.fromEntries(keys.map((key, i) => [key, cells[i]])));
}

/**
 * Hevy's English export looks like "Sep 25, 2026, 9:07 AM" and is in the
 * phone's local time, so it is read as local time here too.
 */
export function parseHevyDate(value) {
  if (!value) return null;
  const match = /^([A-Za-z]{3})[a-z]*\.? (\d{1,2}),? (\d{4}),? (\d{1,2}):(\d{2})\s*([AP]M)?$/i.exec(
    value.trim()
  );
  if (match) {
    const month = MONTHS[match[1].toLowerCase()];
    let hour = Number(match[4]);
    if (match[6]) hour = (hour % 12) + (/pm/i.test(match[6]) ? 12 : 0);
    if (month !== undefined) {
      return new Date(Number(match[3]), month, Number(match[2]), hour, Number(match[5]));
    }
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed);
}

const toNumber = (value) => {
  if (value === undefined || value === null || value === '') return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

/** Epley estimate. A single is its own one-rep max. */
export const estimateOneRepMax = (weight, reps) =>
  reps <= 1 ? weight : Math.round(weight * (1 + reps / 30) * 10) / 10;

export const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const dayKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * A set whose estimated max is far beyond everything else logged for that
 * exercise is almost always a typo (80 kg × 35 on a lift done for 7s). Such
 * sets still count toward volume but are kept out of the personal records.
 */
const OUTLIER_RATIO = 1.35;

function flagOutliers(sets) {
  const weighted = sets.filter((set) => set.weight > 0);
  if (weighted.length < 5) return;
  const ranked = [...weighted].sort((a, b) => b.e1rm - a.e1rm);
  while (ranked.length > 2 && ranked[0].e1rm > ranked[1].e1rm * OUTLIER_RATIO) {
    ranked.shift().outlier = true;
  }
}

function summariseExercise(name, sets, sessionsById) {
  flagOutliers(sets);
  const counted = sets.filter((set) => !set.outlier && set.type !== 'warmup');
  const weighted = counted.some((set) => set.weight > 0);

  // "Heaviest set" is the record Hevy itself leads with: the most weight, and
  // the most reps done at that weight.
  const best = counted.reduce((top, set) => {
    if (!top) return set;
    if (weighted) {
      if (set.weight !== top.weight) return set.weight > top.weight ? set : top;
      return set.reps > top.reps ? set : top;
    }
    return set.reps > top.reps ? set : top;
  }, null);

  const bestEstimate = weighted
    ? counted.reduce((top, set) => (!top || set.e1rm > top.e1rm ? set : top), null)
    : null;

  const bySession = new Map();
  for (const set of counted) {
    const entry = bySession.get(set.sessionId) || {
      sessionId: set.sessionId,
      date: set.date,
      topWeight: 0,
      topReps: 0,
      e1rm: 0,
      volume: 0,
    };
    if (set.weight > entry.topWeight || (set.weight === entry.topWeight && set.reps > entry.topReps)) {
      entry.topWeight = set.weight;
      entry.topReps = set.reps;
    }
    if (!weighted) entry.topReps = Math.max(entry.topReps, set.reps);
    entry.e1rm = Math.max(entry.e1rm, set.e1rm);
    entry.volume += set.weight * set.reps;
    bySession.set(set.sessionId, entry);
  }
  const history = [...bySession.values()].sort((a, b) => a.date - b.date);

  return {
    id: slugify(name),
    name,
    weighted,
    sets,
    best: best && { weight: best.weight, reps: best.reps, date: best.date },
    bestEstimate: bestEstimate && {
      weight: bestEstimate.weight,
      reps: bestEstimate.reps,
      e1rm: bestEstimate.e1rm,
      date: bestEstimate.date,
    },
    maxReps: counted.reduce((most, set) => Math.max(most, set.reps), 0),
    totalSets: sets.length,
    totalReps: sets.reduce((sum, set) => sum + set.reps, 0),
    volume: sets.reduce((sum, set) => sum + set.weight * set.reps, 0),
    sessionCount: bySession.size,
    firstDate: history[0]?.date ?? null,
    lastDate: history[history.length - 1]?.date ?? null,
    history,
    outliers: sets.filter((set) => set.outlier),
    notes: [...new Set(sets.map((set) => set.note).filter(Boolean))],
    sessionTitles: [...new Set(history.map((h) => sessionsById.get(h.sessionId)?.title))],
  };
}

/**
 * Turns the raw export into sessions, per-exercise records and totals.
 * Sets with no reps (Hevy's empty placeholder rows) are dropped.
 */
export function buildTrainingLog(csvText) {
  const rows = parseCsv(csvText);
  const sessions = [];
  const sessionsByKey = new Map();
  const setsByExercise = new Map();

  for (const row of rows) {
    const exercise = (row.exercise_title || '').trim();
    const start = parseHevyDate(row.start_time);
    const reps = toNumber(row.reps);
    if (!exercise || !start || reps <= 0) continue;

    const key = `${row.start_time}|${row.title}`;
    let session = sessionsByKey.get(key);
    if (!session) {
      const end = parseHevyDate(row.end_time) || start;
      session = {
        key,
        title: (row.title || 'Workout').trim(),
        description: (row.description || '').trim(),
        start,
        end,
        minutes: Math.max(0, Math.round((end - start) / 60000)),
        sets: 0,
        reps: 0,
        volume: 0,
        exercises: [],
      };
      sessionsByKey.set(key, session);
      sessions.push(session);
    }

    const weight = toNumber(row.weight_kg);
    const set = {
      sessionKey: key,
      date: start,
      weight,
      reps,
      e1rm: weight > 0 ? estimateOneRepMax(weight, reps) : 0,
      type: (row.set_type || 'normal').trim(),
      note: (row.exercise_notes || '').trim(),
      outlier: false,
    };
    session.sets += 1;
    session.reps += reps;
    session.volume += weight * reps;
    if (!session.exercises.includes(exercise)) session.exercises.push(exercise);

    if (!setsByExercise.has(exercise)) setsByExercise.set(exercise, []);
    setsByExercise.get(exercise).push(set);
  }

  sessions.sort((a, b) => a.start - b.start);
  sessions.forEach((session, index) => {
    session.id = index + 1;
  });
  const sessionsById = new Map(sessions.map((session) => [session.id, session]));
  for (const sets of setsByExercise.values()) {
    for (const set of sets) set.sessionId = sessionsByKey.get(set.sessionKey).id;
  }

  const exercises = [...setsByExercise.entries()]
    .map(([name, sets]) => summariseExercise(name, sets, sessionsById))
    .filter((exercise) => exercise.best);

  // Consecutive-day streaks.
  const days = [...new Set(sessions.map((session) => dayKey(session.start)))].sort();
  let longestStreak = days.length ? 1 : 0;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const gap = (new Date(days[i]) - new Date(days[i - 1])) / 86400000;
    run = Math.round(gap) === 1 ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
  }

  const weekdayCounts = new Array(7).fill(0);
  for (const session of sessions) weekdayCounts[session.start.getDay()] += 1;
  const favouriteWeekday = WEEKDAYS[weekdayCounts.indexOf(Math.max(...weekdayCounts))];

  const mostTrained = exercises.reduce(
    (top, exercise) => (!top || exercise.totalSets > top.totalSets ? exercise : top),
    null
  );

  const totals = {
    sessions: sessions.length,
    sets: sessions.reduce((sum, s) => sum + s.sets, 0),
    reps: sessions.reduce((sum, s) => sum + s.reps, 0),
    volume: Math.round(sessions.reduce((sum, s) => sum + s.volume, 0) * 10) / 10,
    minutes: sessions.reduce((sum, s) => sum + s.minutes, 0),
    firstDate: sessions[0]?.start ?? null,
    lastDate: sessions[sessions.length - 1]?.start ?? null,
    trainingDays: days.length,
    longestStreak,
    favouriteWeekday,
    mostTrained: mostTrained?.name ?? null,
    exerciseCount: exercises.length,
    cardioKm: rows.reduce((sum, row) => sum + toNumber(row.distance_km), 0),
  };

  return { sessions, exercises, totals };
}

/**
 * Consecutive training days ending today or yesterday, measured against `now`.
 * Kept separate from buildTrainingLog so the parsed log stays deterministic.
 */
export function currentStreak(sessions, now = new Date()) {
  const days = new Set(sessions.map((session) => dayKey(session.start)));
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
