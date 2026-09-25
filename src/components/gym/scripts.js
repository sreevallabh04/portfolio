/**
 * What happens when you press A on something. Every line that quotes a number
 * reads it from the training log, so the dialogue stays true when the export
 * is replaced.
 */
import { CONTACT } from '@/data/portfolio';
import {
  BADGES_FOR_BOSS,
  EXERCISE_BY_ID,
  LOG,
  STATIONS,
  exercisesAt,
  formatDate,
  formatKg,
  formatSet,
} from './gameData';
import { badgesEarned, bossUnlocked } from './save';

const T = LOG.totals;
const ex = (id) => EXERCISE_BY_ID[id];

const deskIntro = () => [
  'Morning, SREE! Scanning your membership…',
  `Beep. ${T.sessions} sessions on file since ${formatDate(T.firstDate)}. Last one: ${formatDate(T.lastDate)}.`,
  'Every machine in here has your best set on record. Beat one and it counts as a new PR.',
  Number.isFinite(BADGES_FOR_BOSS)
    ? `Break PRs to earn badges. Collect ${BADGES_FOR_BOSS} and COACH will see you on the platform.`
    : 'Break PRs to earn badges, one per muscle group.',
];

async function desk(api) {
  const { say, ask, save, commit, open } = api;
  if (!save().metDesk) {
    await say(deskIntro(), { speaker: 'FRONT DESK' });
    commit({ metDesk: true });
  }
  const choice = await ask('Anything else?', ['TRAINER CARD', 'TRAINING LOG', 'HOW TO PLAY', 'BYE'], {
    speaker: 'FRONT DESK',
  });
  if (choice === 0) open('card');
  else if (choice === 1) open('log');
  else if (choice === 2) open('help');
}

async function coach(api) {
  const { say, ask, save, startBoss, credits } = api;
  const s = save();
  if (s.bossBeaten) {
    await say(["The Big Three, done. Most people never get this far.", "The log doesn't lie, and neither did you."], {
      speaker: 'COACH',
    });
    if ((await ask('Watch the credits again?', ['YES', 'NO'], { speaker: 'COACH' })) === 0) credits();
    return;
  }
  if (!Number.isFinite(BADGES_FOR_BOSS)) {
    await say(["Not today. Log a squat, a bench and a pull-up and we'll talk."], { speaker: 'COACH' });
    return;
  }
  if (!bossUnlocked(s)) {
    const have = badgesEarned(s).length;
    await say(
      [
        'The platform is for people with receipts.',
        `Come back with ${BADGES_FOR_BOSS} badges. You've got ${have}.`,
      ],
      { speaker: 'COACH' }
    );
    return;
  }
  await say(["So you've got the badges.", 'Squat. Bench. Pull-ups. One stamina bar between all three.'], {
    speaker: 'COACH',
  });
  if ((await ask('Take on COACH?', ["LET'S GO", 'NOT YET'], { speaker: 'COACH' })) === 0) startBoss();
}

const NPCS = {
  desk,
  coach,
  async bro({ say, save }) {
    const bench = ex('bench-press-barbell');
    if (!bench) return say(['Bro. Do you even lift?'], { speaker: 'BRO' });
    if (save().prs[bench.id]) return say(["You broke the bench PR?! Protein's on me."], { speaker: 'BRO' });
    return say(
      [
        `What do you bench? …Oh, it's on the board. ${formatSet(bench, bench.best)}, ${formatDate(bench.best.date)}.`,
        `That's a ${formatKg(bench.bestEstimate.e1rm)} KG estimated max. One more rep and it's a PR.`,
      ],
      { speaker: 'BRO' }
    );
  },
  async curler({ say }) {
    const curl = ex('bicep-curl-barbell');
    return say(
      [
        "Don't mind me. Just curling in the squat rack.",
        curl
          ? `Your log says you did the same thing. ${formatSet(curl, curl.best)}, right here.`
          : 'Everybody does it eventually.',
        "We're the same, you and I.",
      ],
      { speaker: 'SQUAT RACK GUY' }
    );
  },
  async runner({ say }) {
    return say([
      "(She's deep in the zone and doesn't look up.)",
      T.cardioKm > 0
        ? `The log has ${T.cardioKm.toFixed(1)} KM of cardio in it. Respectable.`
        : 'Your log contains exactly 0.0 KM of cardio. The treadmills have noticed.',
    ]);
  },
  async janitor({ say }) {
    const press = ex('leg-press-machine');
    return say(
      [
        'Somebody left plates on the leg press again.',
        press ? `${formatKg(press.best.weight)} KG of them. …Was that you?` : '…Was that you?',
      ],
      { speaker: 'JANITOR' }
    );
  },
  async cat({ say }) {
    return say(['A cat, asleep on the warm step.', 'It has trained zero days this year and seems fine with it.']);
  },
};

const clockTime = () =>
  new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toUpperCase();

async function pc({ say, ask, navigate }) {
  await say(['SREE booted up the PC.', "It's still the Developer profile, after all. The code lives here."]);
  const choice = await ask("SREE'S PC", ['PROJECTS', 'GITHUB', 'BLOG', 'LOG OFF']);
  if (choice === 0) navigate('/browse/recruiter/projects');
  else if (choice === 1) window.open(CONTACT.github, '_blank', 'noopener,noreferrer');
  else if (choice === 2) navigate('/blog');
}

const OBJECTS = {
  desk,
  pc,
  platformbar: ({ say }) => say(['A competition bar, loaded to 120 KG.', "COACH's warm-up weight, apparently."]),
  chalk: async ({ say, save, commit, audio }) => {
    if ((save().chalkBonus || 0) >= 2) return say(['Your hands are already white.']);
    audio.play('buff');
    commit({ chalkBonus: (save().chalkBonus || 0) + 1 });
    return say(['SREE chalked up.', 'An extra CHALK for the next set.']);
  },
  platetree: ({ say }) => say(['A plate tree. Every plate re-racked.', 'Somebody in here has manners.']),
  treadmill1: ({ say }) => say(['A treadmill.', 'According to the log it has never been used. Not once.']),
  treadmill3: ({ say }) => say(['Another treadmill.', 'Also untouched. The log is consistent, at least.']),
  lockers: ({ say }) => say(['Your locker. Straps, a shaker bottle, and a towel that has seen things.']),
  lounge: ({ say }) => say(['A bench for sitting.', 'The only bench in here nobody presses.']),
  'plant-a': ({ say }) => say(['A very well-watered plant.']),
  'plant-b': ({ say }) => say(['This plant has seen more PRs than most people.']),
  'plant-c': ({ say }) => say(['A plant, thriving on gym air and neon.']),
  cooler: ({ say }) => say(['SREE drinks some water. Hydrated.']),
  kettlebells: ({ say }) => say(['Kettlebells.', 'Not in the log. Yet.']),
  'lamp-l': ({ say }) => say(['The streetlight hums in the rain.']),
  'lamp-r': ({ say }) => say(['The streetlight hums in the rain.']),
  'planter-l': ({ say }) => say(['Wet shrubs.']),
  'planter-r': ({ say }) => say(['Wet shrubs, and a cigarette butt someone should be ashamed of.']),
  bike: ({ say }) => say(['A bike, chained to the rack. Not yours.']),
  hydrant: ({ say }) => say(['A fire hydrant. Heavier than it looks.']),
  trash: ({ say }) => say(['Protein bar wrappers. Suspicious.']),
  car: ({ say }) => say(['Somebody’s car, beaded with rain.']),
  car2: ({ say }) => say(['A blue car. The parking ticket on it is not your problem.']),
};

async function wall(target, api) {
  const { say, world, map } = api;
  if (map() === 'street') {
    const x = target.x;
    if (x === 10 || x === 11) return say(['The gym doors. Walk into them to head inside.']);
    if ((x >= 1 && x <= 7) || (x >= 14 && x <= 20)) return say(['Warm light through the glass, and the sound of plates.']);
    return say(['Brick, wet from the rain.']);
  }
  const x = target.x;
  if ((x >= 1 && x <= 9) || (x >= 22 && x <= 30)) {
    world.flex(1600);
    api.audio.play('buff');
    return say(['SREE hit a front double biceps.', 'The mirror approves.']);
  }
  if (x >= 13 && x <= 18) return say(['LIGHTWEIGHT, it says, in red neon.', 'Ronnie would approve.']);
  if (x === 21) return say([`The clock says ${clockTime()}.`]);
  return say(['The city outside, still half asleep.']);
}

export async function runInteraction(target, api) {
  if (target.type === 'npc') {
    const script = NPCS[target.npc.id];
    if (script) await script(api);
    return;
  }
  if (target.type === 'wall') {
    await wall(target, api);
    return;
  }
  const object = target.object;
  if (object.station) {
    if (!exercisesAt(object.station).length) {
      await api.say([`The ${STATIONS[object.station].name}.`, 'Nothing logged on this one yet.']);
      return;
    }
    api.openStation(object.station);
    return;
  }
  const script = OBJECTS[object.id];
  if (script) await script(api);
}

export const introLines = (time) => [
  `${time}. Rain on the pavement, and the gym lights are on.`,
  'Walk up to the doors to head inside.',
];

/** Label for the on-screen "A" prompt. */
export function focusLabel(target) {
  if (!target) return null;
  if (target.type === 'npc') {
    return (
      { desk: 'TALK', coach: 'COACH', bro: 'TALK', curler: 'TALK', runner: 'LOOK', janitor: 'TALK', cat: 'CAT' }[
        target.npc.id
      ] || 'TALK'
    );
  }
  const o = target.object;
  if (o?.station) return STATIONS[o.station].name;
  return (
    {
      desk: 'FRONT DESK',
      pc: "SREE'S PC",
      chalk: 'CHALK',
      platformbar: 'COMP BAR',
    }[o?.id] || 'LOOK'
  );
}
