/**
 * What happens when you press A on something. Every line that quotes a number
 * reads it from the training logs, so the dialogue stays true when the exports
 * are replaced.
 */
import { CONTACT } from '@/data/portfolio';
import { RUNS, TOTALS as RUN_TOTALS, formatKm } from '@/lib/strava';
import {
  EXERCISES,
  EXERCISE_BY_ID,
  FRESH_PR_STATIONS,
  LOG,
  STATIONS,
  TRAINER,
  exercisesAt,
  formatDate,
  formatKg,
  formatSet,
  isFreshPr,
} from './gameData';
import { GOGGINS_NAME, gogginsLine, gogginsTalk } from './goggins';

const T = LOG.totals;
const ex = (id) => EXERCISE_BY_ID[id];
const runKm = formatKm(RUN_TOTALS.byType.Run?.distance || 0, 1);

const deskIntro = () => [
  'Morning, SREE! Scanning your membership…',
  `Beep. ${T.sessions} sessions on file since ${formatDate(T.firstDate)}. Last one: ${formatDate(T.lastDate)}.`,
  'Every machine replays what you logged on it: the plates, the reps, every session.',
  FRESH_PR_STATIONS.length
    ? `Gold stars mark the ${FRESH_PR_STATIONS.length} machines where you set a new best this week. Your runs are on the treadmills.`
    : 'Your runs are on the treadmills.',
];

async function desk(api) {
  const { say, ask, save, commit, open, credits } = api;
  if (!save().metDesk) {
    await say(deskIntro(), { speaker: 'FRONT DESK' });
    commit({ metDesk: true });
  }
  const choice = await ask('Anything else?', ['TRAINER CARD', 'TRAINING LOG', 'THE WHOLE YEAR', 'BYE'], {
    speaker: 'FRONT DESK',
  });
  if (choice === 0) open('card');
  else if (choice === 1) open('log');
  else if (choice === 2) credits();
}

async function coach({ say, ask, credits }) {
  const strongest = TRAINER.legs || TRAINER.push;
  await say(
    [
      'The platform is for your heaviest days.',
      strongest
        ? `Heaviest estimated max on the log: ${strongest.short}, ${formatKg(strongest.bestEstimate.e1rm)} KG.`
        : 'Log something heavy and it goes up on the board.',
    ],
    { speaker: 'COACH' }
  );
  if ((await ask('Want to see the whole year?', ['ROLL IT', 'LATER'], { speaker: 'COACH' })) === 0) credits();
}

const NPCS = {
  desk,
  coach,
  async bro({ say }) {
    const bench = ex('bench-press-barbell');
    if (!bench) return say(['Bro. Do you even lift?'], { speaker: 'BRO' });
    return say(
      [
        `What do you bench? …Oh, it's on the board. ${formatSet(bench, bench.best)}, ${formatDate(bench.best.date)}.`,
        `That's a ${formatKg(bench.bestEstimate.e1rm)} KG estimated max. The bench replays every session if you want to watch it climb.`,
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
  async runner({ say, ask, open }) {
    await say([
      "(She pulls out an earbud.)",
      RUNS.length
        ? `You're on Strava too? ${RUNS.length} runs, ${runKm}. Not bad for a lifter.`
        : 'Lifters never run. Prove me wrong.',
    ]);
    if (RUNS.length && (await ask('Look at your runs?', ['SHOW ME', 'NOT NOW'])) === 0) open('runs');
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
  async goggins({ say, ask, open }) {
    await say(gogginsTalk(), { speaker: GOGGINS_NAME });
    const choice = await ask('Want to hear it from me?', ['▶ PUT ME ON THE TV', 'ROGER THAT'], { speaker: GOGGINS_NAME });
    if (choice === 0) open('tv');
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

const runs = async ({ say, open }, line) => {
  if (!RUNS.length) return say([line, 'Nothing synced from Strava yet.']);
  await say([line, `${RUNS.length} runs synced from Strava. ${runKm} on the legs.`]);
  open('runs');
};

const freshCount = EXERCISES.filter(isFreshPr).length;

const OBJECTS = {
  desk,
  pc,
  tv: ({ open }) => open('tv'),
  runboard: (api) => runs(api, 'RUN CLUB, chalked on the board.'),
  treadmill1: (api) => runs(api, 'A treadmill. Your runs are on the screen.'),
  treadmill3: (api) => runs(api, 'Another treadmill, same screen.'),
  platformbar: ({ say }) => say(['A competition bar, loaded to 120 KG.', "COACH's warm-up weight, apparently."]),
  chalk: ({ say, audio }) => {
    audio.play('buff');
    return say([
      'SREE chalked up.',
      freshCount ? `${freshCount} new bests in the last week of the log. The chalk was earned.` : 'Force of habit.',
    ]);
  },
  platetree: ({ say }) => say(['A plate tree. Every plate re-racked.', 'Somebody in here has manners.']),
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
    await say(['SREE hit a front double biceps.', 'The mirror approves.']);
    return say([gogginsLine('mirror')], { speaker: GOGGINS_NAME });
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

/** Label for the on-screen "A" prompt: says what pressing A will do. */
export function focusLabel(target) {
  if (!target) return null;
  if (target.type === 'npc') {
    return (
      {
        desk: 'TALK',
        coach: 'TALK TO COACH',
        bro: 'TALK',
        curler: 'TALK',
        runner: 'TALK',
        janitor: 'TALK',
        cat: 'PET THE CAT',
        goggins: 'TALK TO GOGGINS',
      }[target.npc.id] || 'TALK'
    );
  }
  const o = target.object;
  if (o?.station) {
    const count = exercisesAt(o.station).length;
    return count ? `${STATIONS[o.station].name} · ${count} LIFT${count === 1 ? '' : 'S'}` : STATIONS[o.station].name;
  }
  return (
    {
      desk: 'FRONT DESK',
      pc: "SREE'S PC",
      chalk: 'CHALK',
      platformbar: 'COMP BAR',
      tv: 'GOGGINS TV',
      runboard: 'RUN CLUB',
      treadmill1: 'YOUR RUNS',
      treadmill3: 'YOUR RUNS',
    }[o?.id] || 'LOOK'
  );
}
