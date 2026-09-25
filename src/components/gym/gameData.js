/**
 * Everything the game knows about the lifts comes from here, and all of it is
 * derived from the Hevy export in src/data/workouts.csv. Drop a newer export in
 * that file and the stations, records, levels and log all follow.
 */
import rawLog from '@/data/workouts.csv?raw';
import { buildTrainingLog, currentStreak } from '@/lib/hevy';

export const LOG = buildTrainingLog(rawLog);

/* ------------------------------------------------------------------ groups */

export const GROUPS = {
  chest: { name: 'CHEST', badge: 'PLATE BADGE', color: '#ff4655' },
  back: { name: 'BACK', badge: 'WING BADGE', color: '#35c2ff' },
  legs: { name: 'LEGS', badge: 'QUAD BADGE', color: '#ffb938' },
  shoulders: { name: 'SHOULDERS', badge: 'BOULDER BADGE', color: '#c3cad8' },
  arms: { name: 'ARMS', badge: 'PUMP BADGE', color: '#a878ff' },
  core: { name: 'CORE', badge: 'CORE BADGE', color: '#3ee08f' },
};
export const GROUP_ORDER = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];

/* ---------------------------------------------------------------- stations */

export const STATIONS = {
  rack: { name: 'SQUAT RACK', zone: 'legs' },
  smith: { name: 'SMITH MACHINE', zone: 'legs' },
  legpress: { name: 'LEG PRESS', zone: 'legs' },
  hack: { name: 'HACK SQUAT', zone: 'legs' },
  legmachine: { name: 'LEG EXT / CURL', zone: 'legs' },
  calf: { name: 'CALF RAISE', zone: 'legs' },
  bench: { name: 'FLAT BENCH', zone: 'push' },
  dumbbells: { name: 'DUMBBELL RACK', zone: 'push' },
  pecdeck: { name: 'PEC DECK', zone: 'push' },
  cables: { name: 'CABLE CROSSOVER', zone: 'push' },
  pulldown: { name: 'LAT PULLDOWN', zone: 'pull' },
  row: { name: 'SEATED ROW', zone: 'pull' },
  tower: { name: 'POWER TOWER', zone: 'pull' },
  isorow: { name: 'PLATE-LOADED', zone: 'pull' },
  preacher: { name: 'PREACHER CURL', zone: 'pull' },
};

/*
 * kind decides both the enemy sprite and the rep mini-game:
 *   barbell / smith / ezbar → power meter    stack / plates → grind (mash)
 *   cable → tempo (rhythm)                   dumbbell → alternate (L/R)
 *   bodyweight / weighted → control (hold)
 */
const MINIGAME_FOR_KIND = {
  barbell: 'meter',
  smith: 'meter',
  ezbar: 'meter',
  stack: 'grind',
  plates: 'grind',
  cable: 'tempo',
  dumbbell: 'alternate',
  bodyweight: 'control',
  weighted: 'control',
};

// [station, group, kind, display name]
const KNOWN = {
  'Bench Press (Barbell)': ['bench', 'chest', 'barbell', 'BENCH PRESS'],
  'Incline Bench Press (Smith Machine)': ['smith', 'chest', 'smith', 'SMITH INCLINE'],
  'Incline Bench Press (Dumbbell)': ['dumbbells', 'chest', 'dumbbell', 'INCLINE DB PRESS'],
  'Chest Fly (Machine)': ['pecdeck', 'chest', 'stack', 'MACHINE FLY'],
  'Butterfly (Pec Deck)': ['pecdeck', 'chest', 'stack', 'PEC DECK FLY'],
  'Cable Fly Crossovers': ['cables', 'chest', 'cable', 'CABLE CROSSOVER'],
  'Squat (Barbell)': ['rack', 'legs', 'barbell', 'BACK SQUAT'],
  'Squat (Smith Machine)': ['smith', 'legs', 'smith', 'SMITH SQUAT'],
  'Leg Press (Machine)': ['legpress', 'legs', 'plates', 'LEG PRESS'],
  'Hack Squat (Machine)': ['hack', 'legs', 'plates', 'HACK SQUAT'],
  'Leg Extension (Machine)': ['legmachine', 'legs', 'stack', 'LEG EXTENSION'],
  'Lying Leg Curl (Machine)': ['legmachine', 'legs', 'stack', 'LYING LEG CURL'],
  'Seated Leg Curl (Machine)': ['legmachine', 'legs', 'stack', 'SEATED LEG CURL'],
  'Standing Calf Raise (Barbell)': ['rack', 'legs', 'barbell', 'STANDING CALF'],
  'Seated Calf Raise': ['calf', 'legs', 'plates', 'SEATED CALF'],
  'Lat Pulldown (Cable)': ['pulldown', 'back', 'cable', 'LAT PULLDOWN'],
  'Lat Pulldown - Close Grip (Cable)': ['pulldown', 'back', 'cable', 'CLOSE-GRIP PULLDOWN'],
  'Lat Pulldown (Machine)': ['pulldown', 'back', 'stack', 'MACHINE PULLDOWN'],
  'Pull Up': ['tower', 'back', 'bodyweight', 'PULL-UP'],
  'Pull Up (Weighted)': ['tower', 'back', 'weighted', 'WEIGHTED PULL-UP'],
  'Seated Cable Row - V Grip (Cable)': ['row', 'back', 'cable', 'V-GRIP ROW'],
  'Seated Cable Row - Bar Grip': ['row', 'back', 'cable', 'BAR-GRIP ROW'],
  'Single Arm Cable Row': ['row', 'back', 'cable', 'ONE-ARM ROW'],
  'Iso-Lateral Low Row': ['isorow', 'back', 'plates', 'ISO LOW ROW'],
  'Chest Supported Incline Row (Dumbbell)': ['dumbbells', 'back', 'dumbbell', 'CHEST-SUPPORTED ROW'],
  'Shoulder Press (Dumbbell)': ['dumbbells', 'shoulders', 'dumbbell', 'DB SHOULDER PRESS'],
  'Shoulder Press (Machine Plates)': ['isorow', 'shoulders', 'plates', 'MACHINE PRESS'],
  'Lateral Raise (Cable)': ['cables', 'shoulders', 'cable', 'CABLE LATERAL'],
  'Single Arm Lateral Raise (Cable)': ['cables', 'shoulders', 'cable', 'ONE-ARM LATERAL'],
  'Lateral Raise (Dumbbell)': ['dumbbells', 'shoulders', 'dumbbell', 'DB LATERAL'],
  'Seated Lateral Raise (Dumbbell)': ['dumbbells', 'shoulders', 'dumbbell', 'SEATED LATERAL'],
  'Face Pull': ['cables', 'shoulders', 'cable', 'FACE PULL'],
  'Rear Delt Reverse Fly (Machine)': ['pecdeck', 'shoulders', 'stack', 'REAR DELT FLY'],
  'Reverse Fly Single Arm (Cable)': ['cables', 'shoulders', 'cable', 'CABLE REAR FLY'],
  'Triceps Pushdown': ['cables', 'arms', 'cable', 'TRICEPS PUSHDOWN'],
  'Triceps Rope Pushdown': ['cables', 'arms', 'cable', 'ROPE PUSHDOWN'],
  'Single Arm Triceps Pushdown (Cable)': ['cables', 'arms', 'cable', 'ONE-ARM PUSHDOWN'],
  'Triceps Dip': ['tower', 'arms', 'bodyweight', 'DIP'],
  'Triceps Dip (Weighted)': ['tower', 'arms', 'weighted', 'WEIGHTED DIP'],
  'EZ Bar Biceps Curl': ['preacher', 'arms', 'ezbar', 'EZ-BAR CURL'],
  'Preacher Curl (Machine)': ['preacher', 'arms', 'stack', 'PREACHER CURL'],
  'Seated Incline Curl (Dumbbell)': ['dumbbells', 'arms', 'dumbbell', 'INCLINE CURL'],
  'Bicep Curl (Dumbbell)': ['dumbbells', 'arms', 'dumbbell', 'DB CURL'],
  // Logged as a barbell curl, which in this gym means the squat rack.
  'Bicep Curl (Barbell)': ['rack', 'arms', 'barbell', 'BARBELL CURL'],
  'Hammer Curl (Dumbbell)': ['dumbbells', 'arms', 'dumbbell', 'HAMMER CURL'],
  'Cable Crunch': ['cables', 'core', 'cable', 'CABLE CRUNCH'],
  'Hanging Knee Raise': ['tower', 'core', 'bodyweight', 'KNEE RAISE'],
};

/** Best guess for an exercise a future export adds that isn't in KNOWN. */
function inferMeta(name, weighted) {
  const n = name.toLowerCase();
  const group = /crunch|plank|knee raise|leg raise|sit ?up|twist|ab wheel|hollow/.test(n)
    ? 'core'
    : /squat|leg|lunge|calf|glute|hip thrust|romanian|rdl|step ?up/.test(n)
      ? 'legs'
      : /row|pulldown|pull ?up|chin|deadlift|shrug|pullover|back ext/.test(n)
        ? 'back'
        : /shoulder|lateral|overhead|military|arnold|face pull|rear delt|upright/.test(n)
          ? 'shoulders'
          : /bench|chest|fly|pec|push ?up|butterfly/.test(n)
            ? 'chest'
            : 'arms';

  const kind = !weighted
    ? 'bodyweight'
    : /weighted/.test(n)
      ? 'weighted'
      : /smith/.test(n)
        ? 'smith'
        : /ez bar/.test(n)
          ? 'ezbar'
          : /barbell|deadlift/.test(n)
            ? 'barbell'
            : /dumbbell|kettlebell/.test(n)
              ? 'dumbbell'
              : /cable|pushdown|face pull|rope/.test(n)
                ? 'cable'
                : /plate|leg press|hack|iso-lateral|lever/.test(n)
                  ? 'plates'
                  : 'stack';

  let station;
  if (kind === 'bodyweight' || kind === 'weighted') station = 'tower';
  else if (kind === 'smith') station = 'smith';
  else if (kind === 'dumbbell') station = 'dumbbells';
  else if (/pulldown/.test(n)) station = 'pulldown';
  else if (/row/.test(n) && kind === 'cable') station = 'row';
  else if (kind === 'cable') station = 'cables';
  else if (kind === 'barbell' || kind === 'ezbar') station = group === 'chest' ? 'bench' : 'rack';
  else if (/leg press/.test(n)) station = 'legpress';
  else if (/hack/.test(n)) station = 'hack';
  else if (/calf/.test(n)) station = 'calf';
  else
    station = {
      legs: 'legmachine',
      chest: 'pecdeck',
      back: 'isorow',
      shoulders: 'isorow',
      arms: 'preacher',
      core: 'cables',
    }[group];

  const short = name
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .trim()
    .toUpperCase()
    .slice(0, 20);
  return [station, group, kind, short];
}

/* --------------------------------------------------------------- loading */

/** Weight step for a PR attempt, matched to how that kit actually loads. */
export function incrementFor(kind, weight) {
  if (kind === 'barbell' || kind === 'smith' || kind === 'ezbar' || kind === 'weighted') return 2.5;
  if (kind === 'dumbbell') return weight < 10 ? 1 : 2.5;
  if (kind === 'plates') return weight < 20 ? 2.5 : 5;
  return weight < 15 ? 2.5 : 5;
}

const ceilTo = (value, step) => Math.ceil(value / step - 1e-9) * step;
const round1 = (value) => Math.round(value * 100) / 100;

/**
 * The three PR attempts every lift offers:
 *   ★   one more rep at the heaviest weight
 *   ★★  one weight step up for the same reps
 *   ★★★ a true single at (just above) the estimated max
 * Bodyweight lifts step reps instead.
 */
export function challengesFor(exercise) {
  const { best, kind } = exercise;
  if (!exercise.weighted) {
    const reps = best.reps;
    return [
      { stars: 1, label: '+1 REP', weight: 0, reps: reps + 1 },
      { stars: 2, label: '+3 REPS', weight: 0, reps: reps + 3 },
      { stars: 3, label: 'LEGEND', weight: 0, reps: Math.max(reps + 4, Math.ceil(reps * 1.5) + 1) },
    ];
  }
  const step = incrementFor(kind, best.weight);
  const oneRm = exercise.bestEstimate?.e1rm || best.weight;
  const max = Math.max(ceilTo(oneRm + step / 2, step), best.weight + step * 2);
  return [
    { stars: 1, label: '+1 REP', weight: best.weight, reps: best.reps + 1 },
    { stars: 2, label: `+${step} KG`, weight: round1(best.weight + step), reps: best.reps },
    { stars: 3, label: 'MAX OUT', weight: round1(max), reps: 1 },
  ];
}

/* --------------------------------------------------------------- plates */

const PLATE_SIZES = [25, 20, 15, 10, 5, 2.5, 1.25];

/** Plates for one side. Barbells assume a 20 kg bar; under that it's a fixed bar. */
export function platesPerSide(total, { bar = 20 } = {}) {
  let remaining = Math.max(0, (total - bar) / 2);
  const plates = [];
  for (const size of PLATE_SIZES) {
    while (remaining >= size - 1e-9 && plates.length < 8) {
      plates.push(size);
      remaining = round1(remaining - size);
    }
  }
  return plates;
}

/* ------------------------------------------------------------- exercises */

const GROUP_RANK = Object.fromEntries(GROUP_ORDER.map((g, i) => [g, i]));

export const EXERCISES = LOG.exercises
  .map((exercise) => {
    const [station, group, kind, short] =
      KNOWN[exercise.name] || inferMeta(exercise.name, exercise.weighted);
    const resolvedKind = !exercise.weighted && kind !== 'bodyweight' ? 'bodyweight' : kind;
    return {
      ...exercise,
      station,
      group,
      kind: resolvedKind,
      minigame: MINIGAME_FOR_KIND[resolvedKind] || 'grind',
      short,
    };
  })
  .map((exercise) => ({ ...exercise, challenges: challengesFor(exercise) }))
  .sort(
    (a, b) =>
      GROUP_RANK[a.group] - GROUP_RANK[b.group] ||
      b.sessionCount - a.sessionCount ||
      a.short.localeCompare(b.short)
  )
  .map((exercise, index) => ({ ...exercise, dex: index + 1 }));

export const EXERCISE_BY_ID = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

export const exercisesAt = (stationId) => EXERCISES.filter((e) => e.station === stationId);

/** Muscle groups the log actually trained; badges only exist for these. */
export const ACTIVE_GROUPS = GROUP_ORDER.filter((g) => EXERCISES.some((e) => e.group === g));

export const badgeRequirement = (group) =>
  Math.min(3, EXERCISES.filter((e) => e.group === group).length);

/* ------------------------------------------------------------------ level */

// Pokémon's "medium fast" curve: level n needs n³ experience. Real training
// volume in kilograms is the base experience, so the level on the card is
// earned in the actual gym; PRs in here stack on top.
export const levelForXp = (xp) => Math.max(1, Math.min(100, Math.floor(Math.cbrt(Math.max(1, xp)))));
export const xpForLevel = (level) => level ** 3;
export const BASE_XP = Math.round(LOG.totals.volume);

/** XP for landing a PR: the set's tonnage, scaled by how hard the attempt was. */
export function xpForChallenge(exercise, challenge) {
  const load = exercise.weighted ? challenge.weight : 60; // bodyweight counted as ~60 kg
  const multiplier = [0, 2, 3.5, 6][challenge.stars];
  return Math.max(120, Math.round(load * challenge.reps * multiplier));
}

/* ------------------------------------------------------------------ stats */

const bestIn = (predicate) =>
  EXERCISES.filter(predicate).reduce(
    (top, e) => ((e.bestEstimate?.e1rm || 0) > (top?.bestEstimate?.e1rm || 0) ? e : top),
    null
  );

const pushLeader = bestIn((e) => e.group === 'chest' && e.weighted);
const pullLeader = bestIn((e) => e.group === 'back' && e.weighted);
const legLeader = bestIn((e) => e.group === 'legs' && e.weighted && !/calf/i.test(e.name));

export const TRAINER = {
  name: 'SREE',
  fullName: 'Sreevallabh',
  memberSince: LOG.totals.firstDate,
  lastSession: LOG.totals.lastDate,
  totals: LOG.totals,
  push: pushLeader,
  pull: pullLeader,
  legs: legLeader,
  streak: () => currentStreak(LOG.sessions),
};

// The usual time of day for a session, for the opening line: the busiest
// hour of the day in the log, and the middle start time within it.
const byHour = new Map();
for (const session of LOG.sessions) {
  const hour = session.start.getHours();
  byHour.set(hour, [...(byHour.get(hour) || []), session.start.getMinutes()]);
}
const [busiestHour, minutes] = [...byHour.entries()].sort((x, y) => y[1].length - x[1].length)[0] || [6, [30]];
const typicalMinute = [...minutes].sort((x, y) => x - y)[Math.floor(minutes.length / 2)];
export const TYPICAL_START = `${((busiestHour + 11) % 12) + 1}:${String(typicalMinute).padStart(2, '0')} ${busiestHour >= 12 ? 'PM' : 'AM'}`;

/* ------------------------------------------------------------------- boss */

// The gym leader's team: the heaviest lift in legs, chest and back.
const pickBoss = (predicate, fallbackStars) => {
  const exercise = bestIn(predicate);
  return exercise ? { id: exercise.id, stars: fallbackStars } : null;
};

export const BOSS_TEAM = [
  EXERCISE_BY_ID['squat-barbell']
    ? { id: 'squat-barbell', stars: 2 }
    : pickBoss((e) => e.group === 'legs' && e.weighted, 2),
  EXERCISE_BY_ID['bench-press-barbell']
    ? { id: 'bench-press-barbell', stars: 2 }
    : pickBoss((e) => e.group === 'chest' && e.weighted, 2),
  EXERCISE_BY_ID['pull-up']
    ? { id: 'pull-up', stars: 2 }
    : pickBoss((e) => e.group === 'back', 2),
].filter(Boolean);

// No boss when the log has nothing to build a team from.
export const BADGES_FOR_BOSS = BOSS_TEAM.length ? Math.min(3, ACTIVE_GROUPS.length) : Infinity;

/* ------------------------------------------------------------- formatting */

const MONTH_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export const formatDate = (date) =>
  date ? `${MONTH_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}` : '—';

export const formatKg = (kg) => `${Number.isInteger(kg) ? kg : kg.toFixed(kg * 10 % 1 ? 2 : 1)}`;

export const formatSet = (exercise, set) =>
  exercise.weighted ? `${formatKg(set.weight)} KG × ${set.reps}` : `${set.reps} REPS`;

export const formatVolume = (kg) =>
  kg >= 10000 ? `${(kg / 1000).toFixed(1)} T` : `${Math.round(kg).toLocaleString('en-US')} KG`;
