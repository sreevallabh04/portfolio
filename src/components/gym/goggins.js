/**
 * GOGGINS, the walking partner: a fan tribute to David Goggins, the owner's
 * inspiration. He speaks in his well-known catchphrases, plus short lines
 * built from the real training log, so what he says about SREE is true. No
 * long speeches put in his mouth.
 *
 * Every context is a list whose first entry is the signature line: the first
 * time a context comes up in a session you get that one, after that it's a
 * random pick that never repeats the previous line. Entries can be functions
 * of `ctx` that return a string, or null when the data isn't there. Lines stay
 * short enough for a speech bubble.
 *
 *   gogginsLine(context, ctx)        → string
 *   gogginsSay(context, ctx)         → { text, stinger, speaker, context }
 *   gogginsSession(exercise, index)  → the same, picked for one timeline stop
 */
import { ACTIVITIES, RUNS } from '@/lib/strava';
import { EXERCISES, EXERCISE_BY_ID, LOG, TRAINER, formatDate, formatKg, formatSet, formatVolume } from './gameData';

export const GOGGINS_NAME = 'GOGGINS';

const T = LOG.totals;
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const shortDate = (date) => (date ? `${MONTHS[date.getMonth()]} ${date.getDate()}` : '');
const km = (value) => `${Number(value).toFixed(1)} KM`;
const DAY = 86400000;

/* ------------------------------------------------------------- data lines */

const bench = EXERCISE_BY_ID['bench-press-barbell'];

// The owner really did name a Strava run after the line. He'd notice.
const BOATS = (Array.isArray(ACTIVITIES) ? ACTIVITIES : []).find((a) => /carry the boats/i.test(a?.name || '')) || null;
const runKm = (Array.isArray(RUNS) ? RUNS : []).reduce((sum, run) => sum + (run.distance || 0), 0) / 1000;

// A run from the Strava log: { activity } or { name, km } both work.
const runInfo = (ctx = {}) => {
  const a = ctx.activity || null;
  return { name: ctx.name ?? a?.name ?? null, km: ctx.km ?? (a?.distance > 0 ? a.distance / 1000 : null) };
};

// "60 to 90 KG." when a lift went up; reps for bodyweight lifts.
const climb = ({ fromKg, toKg, fromReps, toReps } = {}) => {
  if (fromKg > 0 && toKg > fromKg) return `${formatKg(fromKg)} to ${formatKg(toKg)} KG.`;
  if (fromReps > 0 && toReps > fromReps) return `${fromReps} to ${toReps} reps.`;
  return null;
};

const LOG_LINES = [
  () => (T.sessions ? `${T.sessions} sessions logged. That's ${T.sessions} mornings you didn't negotiate with yourself.` : null),
  () => (bench ? `${formatSet(bench, bench.best)} on the bench, ${shortDate(bench.best.date)}. They don't know you, son.` : null),
  () => (T.volume ? `${formatVolume(T.volume)} moved, one rep at a time. Stay hard.` : null),
  () => (T.reps ? `${T.reps.toLocaleString('en-US')} reps on the log. Every single one was a choice.` : null),
  () => (T.longestStreak > 1 ? `Longest streak on the log: ${T.longestStreak} days straight. Callus your mind.` : null),
  () =>
    TRAINER.legs
      ? `${TRAINER.legs.short}, ${formatSet(TRAINER.legs, TRAINER.legs.best)}. Legs don't lie. Stay hard.`
      : null,
  () => {
    const memory = cookieJarMemory();
    return memory ? `Reach into the cookie jar: ${memory.text}.` : null;
  },
  // Hevy's cardio column is the running joke of the gym; Strava is the answer.
  () =>
    runKm > 0
      ? `${km(T.cardioKm)} of cardio in Hevy, ${km(runKm)} of running on Strava. Who's gonna carry the boats?`
      : `${km(T.cardioKm)} of cardio on the log. Who's gonna carry the boats?`,
  () =>
    BOATS
      ? `${km(BOATS.distance / 1000)} on ${shortDate(BOATS.startDate)}, and you named it "${BOATS.name}". Roger that.`
      : null,
];

/* ----------------------------------------------------------------- lines */

const LINES = {
  // Walking in the doors, once a session.
  enterGym: [
    () => LOG_LINES[0](),
    'Stay hard! Nobody is coming to save you.',
    'Get comfortable being uncomfortable. Go to work.',
    'Be uncommon amongst uncommon people.',
    () => (T.lastDate ? `Last session on the log: ${formatDate(T.lastDate)}. Roger that. Go get another.` : null),
  ],

  // Pressing A on him.
  idle: [
    "They don't know me, son!",
    "Who's gonna carry the boats?!",
    'Stay hard!',
    'Callus your mind.',
    "Don't stop when you're tired. Stop when you're done.",
    "The 40% rule: when you think you're done, you're only 40% in.",
    'When it gets hard, reach into the cookie jar.',
    'Get comfortable being uncomfortable.',
    'Be uncommon amongst uncommon people.',
    'Nobody is coming to save you.',
    "Can't hurt me.",
    'Roger that.',
    'Taking souls.',
  ],

  // Walking up to a machine. ctx: { exercise }
  station: [
    'Callus your mind. Pick one.',
    'Stay hard.',
    'Get comfortable being uncomfortable.',
    ({ exercise } = {}) =>
      exercise?.best ? `${exercise.short}: ${formatSet(exercise, exercise.best)}. Roger that.` : null,
  ],

  // Watching a lift's replay. ctx: { exercise }
  showcase: [
    'Stay hard.',
    'Callus your mind.',
    "Don't stop when you're tired. Stop when you're done.",
    'Get comfortable being uncomfortable.',
    "Can't hurt me.",
    ({ exercise } = {}) =>
      exercise?.sessionCount > 1 ? `${exercise.sessionCount} sessions of ${exercise.short}. Callus your mind.` : null,
  ],

  // The timeline lands on the session with the all-time best. ctx: { exercise, date }
  prSession: [
    "They don't know me, son!",
    'Taking souls.',
    ({ exercise, date } = {}) =>
      exercise?.best
        ? `${formatSet(exercise, exercise.best)}, ${shortDate(date || exercise.best.date)}. They don't know you, son!`
        : null,
    "Can't hurt me!",
  ],

  // The lift went up over time. ctx: { exercise, fromKg, toKg } (or fromReps/toReps)
  progress: [
    (ctx) => {
      const up = climb(ctx);
      return up && ctx.exercise ? `${ctx.exercise.short}: ${up} Callus your mind.` : null;
    },
    (ctx) => (climb(ctx) ? `${climb(ctx)} Stay hard.` : null),
    (ctx) => (climb(ctx) ? `${climb(ctx)} Don't stop when you're tired.` : null),
    'Stay hard! Keep climbing.',
  ],

  // The first time a lift was logged. ctx: { exercise, date }
  firstSession: [
    ({ exercise, date } = {}) => {
      const day = date || exercise?.firstDate;
      return day ? `Day one: ${shortDate(day)}. Get comfortable being uncomfortable.` : null;
    },
    'Day one. Callus your mind.',
    'Day one. Stay hard.',
  ],

  // Back on a lift after 30+ days away. ctx: { exercise, days }
  comeback: [
    ({ days } = {}) => (days >= 30 ? `${days} days off. Nobody is coming to save you.` : null),
    'Back under the bar. Roger that.',
    "Can't hurt me. Stay hard.",
  ],

  // After the mirror flex.
  mirror: [
    'The accountability mirror. Be honest with it.',
    'Look him in the eye. Stay hard.',
    'Stick the goals on the mirror. Then go get them.',
    () => (T.sessions ? `The mirror knows: ${T.sessions} sessions. Make it ${T.sessions + 1}.` : null),
  ],

  // The Strava run log. ctx: { activity } (a Strava activity) or { name, km }
  run: [
    (ctx) =>
      BOATS && !runInfo(ctx).name
        ? `"${BOATS.name}": ${km(BOATS.distance / 1000)}, ${shortDate(BOATS.startDate)}. Stay hard.`
        : null,
    "Who's gonna carry the boats?!",
    "Don't stop when you're tired. Stop when you're done.",
    'Get comfortable being uncomfortable.',
    'Stay hard!',
    (ctx) => {
      const { km: distance } = runInfo(ctx);
      return distance > 0 ? `${km(distance)}. Now do it again.` : null;
    },
  ],

  // Out on the street, in the rain.
  street: [
    "It's raining. Good. Nobody else is out here.",
    'Everybody else stayed in bed. Stay hard.',
    'Rain. Good. Callus your mind.',
  ],
};

// Big moments get the STAY HARD stinger (audio.play('stayHard')).
const STINGER = new Set(['prSession']);

// On a lift's timeline the real numbers are the point, so the lines built
// from them come up twice as often as the bare catchphrases.
const DATA_HEAVY = new Set(['prSession', 'progress', 'firstSession', 'comeback']);

/* ------------------------------------------------------------------ pick */

// Lines that win outright whenever they apply, before any variety.
const PRIORITY = {
  run: (ctx) => {
    const { name } = runInfo(ctx);
    return name && /carry the boats/i.test(name) ? `"${name}." You named a run after it. Roger that.` : null;
  },
};

const seen = new Set();
const last = {};

const resolve = (entry, ctx) => (typeof entry === 'function' ? entry(ctx) : entry) || null;

/** A GOGGINS line for `context`, e.g. gogginsLine('run', { km: 5.2 }). Unknown contexts talk like 'idle'. */
export function gogginsLine(context, ctx = {}) {
  const first = PRIORITY[context]?.(ctx);
  if (first) {
    last[context] = first;
    return first;
  }
  const list = LINES[context] || LINES.idle;
  if (!seen.has(context)) {
    seen.add(context);
    const lead = resolve(list[0], ctx);
    if (lead) {
      last[context] = lead;
      return lead;
    }
  }
  const pool = [];
  for (const entry of list) {
    const text = resolve(entry, ctx);
    if (text) pool.push({ text, weight: typeof entry === 'function' && DATA_HEAVY.has(context) ? 2 : 1 });
  }
  if (!pool.length) return 'Stay hard!';
  // Never the same line twice running, when there is anything else to say.
  const fresh = pool.filter((c) => c.text !== last[context]);
  const choices = fresh.length ? fresh : pool;
  let roll = Math.random() * choices.reduce((sum, c) => sum + c.weight, 0);
  const pick = choices.find((c) => (roll -= c.weight) < 0) || choices[choices.length - 1];
  last[context] = pick.text;
  return pick.text;
}

/** React-free: a line plus whether it earns the STAY HARD stinger. */
export function gogginsSay(context, ctx = {}) {
  return { text: gogginsLine(context, ctx), stinger: STINGER.has(context), speaker: GOGGINS_NAME, context };
}

/**
 * What GOGGINS says when a lift's timeline stops on `exercise.history[index]`:
 * the all-time best session beats the first session, which beats a comeback
 * after 30+ days, which beats a new heaviest-so-far; anything else is a
 * generic showcase line.
 */
export function gogginsSession(exercise, index) {
  const history = exercise?.history || [];
  const entry = history[index];
  if (!entry) return gogginsSay('showcase', { exercise });
  const day = (d) => (d ? new Date(d).toDateString() : '');
  if (exercise.best && day(entry.date) === day(exercise.best.date)) {
    return gogginsSay('prSession', { exercise, date: entry.date });
  }
  if (index === 0) return gogginsSay('firstSession', { exercise, date: entry.date });
  const prev = history[index - 1];
  const days = Math.round((entry.date - prev.date) / DAY);
  if (days >= 30) return gogginsSay('comeback', { exercise, days });
  const first = history[0];
  const before = history.slice(0, index);
  if (exercise.weighted) {
    if (entry.topWeight > Math.max(...before.map((h) => h.topWeight)) && entry.topWeight > first.topWeight) {
      return gogginsSay('progress', { exercise, fromKg: first.topWeight, toKg: entry.topWeight });
    }
  } else if (entry.topReps > Math.max(...before.map((h) => h.topReps)) && entry.topReps > first.topReps) {
    return gogginsSay('progress', { exercise, fromReps: first.topReps, toReps: entry.topReps });
  }
  return gogginsSay('showcase', { exercise });
}

/** Talking to him: a catchphrase, and now and then something from the log. */
export function gogginsTalk() {
  const pages = [gogginsLine('idle')];
  if (Math.random() < 0.4) {
    const data = LOG_LINES.map((fn) => fn()).filter(Boolean);
    if (data.length) pages.push(data[Math.floor(Math.random() * data.length)]);
  }
  return pages;
}

/*
 * Barks: the few words he calls out in the overworld, over his head, without
 * stopping the game. Painted in the 3×5 world font, so capitals and short.
 */
const BARKS = {
  enterGym: ['STAY HARD!', 'GO TO WORK.', 'ROGER THAT.'],
  prSession: ["THEY DON'T KNOW ME, SON!", 'TAKING SOULS.', 'STAY HARD!'],
  idle: ['STAY HARD!', "WHO'S GONNA CARRY THE BOATS?!", 'CALLUS YOUR MIND.'],
};

export function gogginsBark(context) {
  const list = BARKS[context] || BARKS.idle;
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * The cookie jar: remember a real best set from the log. Returns
 * { exercise, text } like "BENCH PRESS 90 KG × 7 on JUL 6", or null.
 */
export function cookieJarMemory(rand = Math.random) {
  const list = EXERCISES.filter((e) => e.best?.date);
  if (!list.length) return null;
  const exercise = list[Math.floor(rand() * list.length)];
  return { exercise, text: `${exercise.short} ${formatSet(exercise, exercise.best)} on ${shortDate(exercise.best.date)}` };
}
