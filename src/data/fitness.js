/**
 * 75 Hard training block.
 *
 * Content is transcribed from the personal plan document: a seven-day
 * Push/Pull/Legs + Upper/Lower hybrid, two sessions daily, run as a cut from
 * 78 kg to 71-72 kg on 2,250 kcal and 175 g protein.
 */

export const BLOCK = {
  title: '75 Hard',
  tagline: 'Seven training days. Two sessions daily. No days off.',
  start: '23 September 2026',
  end: '6 December 2026',
  continuesTo: '1 January 2027',
  synopsis:
    'A seven-day Push / Pull / Legs + Upper / Lower hybrid run as a cut. Two sessions a day: a gym session at 6:30 and an easy outdoor session in the evening that satisfies 75 Hard without spending recovery. The tracked lifts hold their weight while the scale drops — holding is the goal, adding is a bonus.',
  genres: ['Strength', 'Hypertrophy', 'Endurance', 'Discipline'],
};

export const STATS = [
  { label: 'Start weight', value: '78', unit: 'kg' },
  { label: 'Target', value: '71–72', unit: 'kg' },
  { label: 'Daily calories', value: '2,250', unit: 'kcal' },
  { label: 'Protein', value: '175', unit: 'g' },
  { label: 'Training days', value: '7', unit: '/ week' },
  { label: 'Sessions', value: '2', unit: '/ day' },
];

export const TRACKED_LIFTS = [
  { name: 'Barbell bench press', scheme: '4 × 5', day: 'Monday', progression: '+2.5 kg' },
  { name: 'Weighted pull-up', scheme: '4 × 6', day: 'Tuesday', progression: '+2.5 kg' },
  { name: 'Back squat', scheme: '4 × 5', day: 'Wednesday', progression: '+5 kg' },
  { name: 'Hip thrust', scheme: '4 × 8', day: 'Friday', progression: '+5 kg' },
];

export const WEEK = [
  {
    day: 'Monday',
    short: 'Mon',
    title: 'Push',
    intensity: 'Heavy',
    accent: '#e50914',
    focus: 'Chest, shoulders, triceps',
    evening: 'Easy ride, 45 min',
    abs: 'Hanging leg raise 3×12',
    note: 'The bench press is the tracked lift. Hold the weight while the scale drops and the plan is working.',
    exercises: [
      { name: 'Barbell bench press', sets: '4 × 5', rest: '3 min', rpe: 8, cue: 'Feet planted, shoulder blades pinned back and down, brief pause on the lower chest.' },
      { name: 'Standing barbell overhead press', sets: '3 × 8', rest: '2 min', rpe: 8, cue: 'Glutes squeezed, ribs down, bar travels straight up past the face. No leg drive.' },
      { name: 'Incline dumbbell press', sets: '3 × 10', rest: '90 s', rpe: 8, cue: 'Bench at 30°. Elbows at 45°, dumbbells touch at the top, 2-second lower.' },
      { name: 'Dumbbell lateral raise', sets: '3 × 15', rest: '60 s', rpe: 9, cue: 'Lead with the elbows, pause at shoulder height, lower over 2 seconds.' },
      { name: 'Triceps rope pushdown', sets: '3 × 12', rest: '60 s', rpe: 9, cue: 'Elbows pinned to the sides, spread the rope at the bottom.' },
      { name: 'Hanging leg raise', sets: '3 × 12', rest: '60 s', rpe: 9, cue: 'Straight legs to hip height, no swing.' },
    ],
  },
  {
    day: 'Tuesday',
    short: 'Tue',
    title: 'Pull',
    intensity: 'Heavy',
    accent: '#f59e0b',
    focus: 'Back, rear delts, biceps',
    evening: 'Easy run, 30–40 min',
    abs: 'Cable crunch 3×15',
    note: 'Barbell rows are out: the chest-supported row trains the mid-back without loading the lower back the day before squats.',
    exercises: [
      { name: 'Weighted pull-up', sets: '4 × 6', rest: '3 min', rpe: 8, cue: 'Dead-hang start, chin over the bar, 2-second lower. Load with a dipping belt.' },
      { name: 'Chest-supported dumbbell row', sets: '4 × 8', rest: '2 min', rpe: 8, cue: 'Incline bench at 45°, elbows drive toward the hips, 1-second pause at the top.' },
      { name: 'Wide-grip lat pulldown', sets: '3 × 12', rest: '90 s', rpe: 8, cue: 'Slight lean back, bar to the upper chest, full stretch at the top of every rep.' },
      { name: 'Face pull', sets: '3 × 15', rest: '60 s', rpe: 9, cue: 'Rope at face height, pull to the forehead, hands finish beside the ears.' },
      { name: 'Dumbbell curl', sets: '3 × 12', rest: '60 s', rpe: 9, cue: 'Alternating arms, full range, torso still.' },
      { name: 'Cable crunch', sets: '3 × 15', rest: '60 s', rpe: 9, cue: 'Kneeling, hips fixed, ribs crunch toward the pelvis.' },
      { name: 'Forearm block', sets: '3 × 12 / 3 × 15', rest: '45 s', rpe: 9, cue: 'Reverse-grip EZ-bar curl, then seated wrist curl.' },
    ],
  },
  {
    day: 'Wednesday',
    short: 'Wed',
    title: 'Legs',
    intensity: 'Squat focus',
    accent: '#22c55e',
    focus: 'Quads, hamstrings, glutes',
    evening: 'Walk, 45 min',
    abs: 'Long-lever plank 3×45 s',
    note: 'The heaviest day of the week. The evening is a walk so the legs recover for Thursday and Friday.',
    exercises: [
      { name: 'Back squat', sets: '4 × 5', rest: '3 min', rpe: 8, cue: 'Brace, sit between the hips, depth to parallel. Same weight all four sets.' },
      { name: 'Romanian deadlift', sets: '4 × 8', rest: '2 min', rpe: 8, cue: 'Hips travel back, knees soft, bar slides to mid-shin. Stop before the back rounds.' },
      { name: 'Bulgarian split squat', sets: '3 × 10 / leg', rest: '90 s', rpe: 8, cue: 'Rear foot on a bench, front knee over the toes, 2-second lower.' },
      { name: 'Lying leg curl', sets: '3 × 12', rest: '60 s', rpe: 9, cue: 'Control the eccentric, full contraction at the top.' },
      { name: 'Long-lever plank', sets: '3 × 45 s', rest: '60 s', rpe: 9, cue: 'Elbows forward of the shoulders, ribs down, glutes squeezed.' },
    ],
  },
  {
    day: 'Thursday',
    short: 'Thu',
    title: 'Upper',
    intensity: 'Volume',
    accent: '#3b82f6',
    focus: 'Chest and back, higher reps',
    evening: 'Easy ride, 45 min',
    abs: 'Decline sit-up 3×12',
    note: 'The upper/lower half of the hybrid. Chest and back get their second exposure, with recovery complete.',
    exercises: [
      { name: 'Flat dumbbell bench press', sets: '3 × 10', rest: '90 s', rpe: 8, cue: 'Dumbbells touch at the top, lower until the elbows are just below the bench.' },
      { name: 'Neutral-grip lat pulldown', sets: '3 × 10', rest: '90 s', rpe: 8, cue: 'Elbows drive down and back, bar to the upper chest, 1-second pause.' },
      { name: 'Seated dumbbell shoulder press', sets: '3 × 10', rest: '90 s', rpe: 8, cue: 'Back on the pad, press to lockout, lower to ear height.' },
      { name: 'Cable row', sets: '3 × 12', rest: '90 s', rpe: 8, cue: 'Chest tall, elbows past the ribs, no torso swing.' },
      { name: 'Decline sit-up', sets: '3 × 12', rest: '60 s', rpe: 9, cue: 'Roll up one vertebra at a time, no hip flexor yank.' },
      { name: 'Forearm block', sets: '3 × 15 / 3 × 30 s', rest: '45 s', rpe: 9, cue: 'Reverse wrist curl, then plate pinch hold.' },
    ],
  },
  {
    day: 'Friday',
    short: 'Fri',
    title: 'Lower',
    intensity: 'Hinge focus',
    accent: '#a855f7',
    focus: 'Posterior chain',
    evening: 'Easy ride, 45 min',
    abs: 'Hanging knee raise with twist 3×10/side',
    note: 'The hip thrust is the tracked lift. Two heavy leg days never land on consecutive days.',
    exercises: [
      { name: 'Hip thrust', sets: '4 × 8', rest: '2 min', rpe: 8, cue: 'Chin tucked, ribs down, full lockout with a 1-second squeeze.' },
      { name: 'Leg press', sets: '3 × 12', rest: '90 s', rpe: 8, cue: 'Feet mid-platform, knees track the toes, no lower-back rounding at the bottom.' },
      { name: 'Walking lunge', sets: '3 × 12 / leg', rest: '90 s', rpe: 8, cue: 'Long stride, torso upright, knee kisses the floor.' },
      { name: 'Seated leg curl', sets: '3 × 15', rest: '60 s', rpe: 9, cue: 'Pause at peak contraction, 3-second eccentric.' },
      { name: 'Standing calf raise', sets: '4 × 15', rest: '45 s', rpe: 9, cue: 'Full stretch at the bottom, pause at the top.' },
    ],
  },
  {
    day: 'Saturday',
    short: 'Sat',
    title: 'Arms, shoulders, abs',
    intensity: 'Pump',
    accent: '#ec4899',
    focus: 'Isolation only, short rests',
    evening: 'Long easy ride, 60–90 min',
    abs: 'Ab wheel 3×10',
    note: 'Deliberately light. Seven gym days only works because Saturday and Sunday do not spend recovery.',
    exercises: [
      { name: 'Dumbbell lateral raise', sets: '4 × 15', rest: '45 s', rpe: 9, cue: 'Lead with the elbows, no momentum.' },
      { name: 'Cable curl', sets: '3 × 15', rest: '45 s', rpe: 9, cue: 'Elbows pinned, squeeze at the top.' },
      { name: 'Overhead triceps extension', sets: '3 × 15', rest: '45 s', rpe: 9, cue: 'Full stretch overhead, elbows narrow.' },
      { name: 'Rear delt fly', sets: '3 × 20', rest: '45 s', rpe: 9, cue: 'Thumbs down, wide arc, no traps.' },
      { name: 'Ab wheel', sets: '3 × 10', rest: '60 s', rpe: 9, cue: 'Ribs down the whole way out, stop before the back arches.' },
      { name: 'Forearm block', sets: "3 × 40 m / 3 × max", rest: '60 s', rpe: 9, cue: "Farmer's carry, then dead hangs to failure." },
    ],
  },
  {
    day: 'Sunday',
    short: 'Sun',
    title: 'Recovery',
    intensity: 'Light',
    accent: '#64748b',
    focus: 'Mobility, core, light pump',
    evening: 'Walk, 45 min',
    abs: 'Side plank 3×30 s/side',
    note: 'Still a gym session — just not one that spends recovery. From week 7 the evening walk becomes a 30-minute easy run.',
    exercises: [
      { name: 'Full-body mobility flow', sets: '10 min', rest: '—', rpe: 5, cue: 'Hips, thoracic spine, shoulders, ankles.' },
      { name: 'Light pump circuit', sets: '3 rounds', rest: '60 s', rpe: 6, cue: 'Push-ups, band pull-aparts, bodyweight squats.' },
      { name: 'Dead hang', sets: '3 × max', rest: '60 s', rpe: 8, cue: 'Grip work and spinal decompression.' },
      { name: 'Side plank', sets: '3 × 30 s / side', rest: '45 s', rpe: 9, cue: 'Stack the hips, do not let them sag.' },
    ],
  },
];

export const DAY_TIMELINE = [
  { time: '6:00', what: 'Wake. 500 ml water, banana, pre-workout with 5 g creatine.' },
  { time: '6:15', what: 'Cycle to the gym — this is the general warm-up.' },
  { time: '6:30', what: 'Session 1: gym.' },
  { time: '7:45', what: 'Breakfast: protein oats, toned milk, whey, chia, pumpkin seeds. B12 + ashwagandha.' },
  { time: '13:00', what: 'Lunch from the recipe list, cooked the night before.' },
  { time: '16:30', what: 'Snack: 200 g hung curd. Zinc.' },
  { time: '18:30', what: 'Session 2: outdoor, as listed for the day.' },
  { time: '19:25', what: "Cook dinner and tomorrow's lunch." },
  { time: '20:05', what: 'Dinner. Ashwagandha dose 2.' },
  { time: '21:30', what: 'Roasted chana. Magnesium. Screens off.' },
  { time: '22:00', what: 'Lights off.' },
];

export const MACROS = [
  { label: 'Calories', weekday: '2,250 kcal', saturday: '2,700 kcal' },
  { label: 'Protein', weekday: '175 g', saturday: '175 g' },
  { label: 'Fat', weekday: '65 g', saturday: '65 g' },
  { label: 'Carbs', weekday: '240 g', saturday: '350 g' },
];

export const MEALS = [
  { time: '6:00', meal: 'Pre-workout', what: '1 banana', kcal: 100, protein: 1 },
  { time: '7:45', meal: 'Breakfast', what: '60 g protein oats, 250 ml toned milk, 1 scoop whey, chia, pumpkin seeds', kcal: 620, protein: 55 },
  { time: '13:00', meal: 'Lunch', what: 'One meal from the recipe list', kcal: 600, protein: 45 },
  { time: '16:30', meal: 'Snack', what: '200 g hung curd', kcal: 130, protein: 16 },
  { time: '20:05', meal: 'Dinner', what: 'One meal from the recipe list', kcal: 600, protein: 45 },
  { time: '21:30', meal: 'Night', what: '40 g roasted chana', kcal: 150, protein: 8 },
];

export const SUPPLEMENTS = [
  { name: 'Creatine monohydrate', dose: '5 g', when: '6:00, in the pre-workout', why: 'Timing is irrelevant; mixing it in makes it automatic.' },
  { name: 'Vitamin B12', dose: '1,500 mcg', when: '7:45, with breakfast', why: 'Measured at 188 pg/mL — the floor of normal on an egg-vegetarian diet.' },
  { name: 'Vitamin D3', dose: '60,000 IU', when: 'Sundays', why: 'Measured at 19.2 ng/mL. Breakfast fat carries the absorption.' },
  { name: 'Ashwagandha KSM-66', dose: '300 mg × 2', when: 'Breakfast and dinner', why: '8 weeks on, 4 weeks off. Recovery and sleep under a deficit.' },
  { name: 'Zinc', dose: '20 mg', when: '16:30, with the curd', why: 'Kept four hours from magnesium — the two compete for absorption.' },
  { name: 'Magnesium glycinate', dose: '400 mg', when: '21:30', why: 'Thirty minutes before lights off. Glycinate does not upset the stomach.' },
];

export const RULES = [
  'Two reps in the tank on every compound set. A grinding rep on a deficit costs three days of recovery and gains nothing.',
  'Rest exactly as listed. Long rests on the tracked lifts are what keep the weight on the bar at 2,250 kcal.',
  'Evening sessions are always easy. If the morning was brutal, the evening becomes a walk regardless of the table.',
  'Body weight daily — the seven-day average is the only number that matters.',
  'Two flat sessions in a row: drop the last two exercises for the rest of the week and fix sleep before touching food.',
  'Sharp, localised pain that worsens during a set: stop that exercise, walk in the evening, reassess in two days.',
  'Rain or a late day at the office: the outdoor session becomes a brisk 45-minute walk. Bedtime never moves.',
  'No lifting straps on any row, pulldown or pull-up for the full 15 weeks. Every pulling set is grip work.',
  'Log every session: exercise, weight, reps per set. The log tells you whether the plan is working.',
];

export const PROGRESSION = [
  { type: 'Tracked lifts', how: 'Same weight across all working sets. Clean target reps two weeks running, then +2.5 kg (bench, pull-up) or +5 kg (squat, hip thrust).' },
  { type: 'Secondary lifts', how: 'Add one rep per set each week within the range. At the top of the range, add the smallest increment and drop back to the bottom.' },
  { type: 'Isolation lifts', how: 'Add weight only when the top of the range is clean with a pause. Never grind these.' },
  { type: 'Abs', how: 'When the reps feel easy, slow the eccentric to 3 seconds; then add a plate. Never add sets.' },
];
