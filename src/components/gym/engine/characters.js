/**
 * Character sprites: one 16×20 template drawn in three facings (right is the
 * mirror of left), recoloured per character, with small accessory patches for
 * caps, ponytails, beards. Outlines are added automatically afterwards.
 */
import { fromRows, outline, flipX } from './pixel';

const R = (pad, core = '') => ('.'.repeat(pad) + core).padEnd(16, '.').slice(0, 16);

const DOWN_TOP = [
  R(0),
  R(5, 'hhhhhh'),
  R(4, 'hhhhhhhh'),
  R(3, 'hhhHHhhhhh'),
  R(3, 'hhHhhhhhhh'),
  R(3, 'hhhhhhhhhh'),
  R(3, 'hssssssssh'),
  R(3, 'hsessssesh'),
  R(3, 'hsessssesh'),
  R(4, 'SssssssS'),
  R(3, 'sttSSSStts'),
  R(3, 'stttttttts'),
  R(3, 'sTttuuttTs'),
  R(3, 'STttttttTS'),
  R(4, 'bbbbbbbb'),
  R(4, 'bbbBBbbb'),
];

const UP_TOP = [
  R(0),
  R(5, 'hhhhhh'),
  R(4, 'hhhhhhhh'),
  R(3, 'hhhhHHhhhh'),
  R(3, 'hhhhhhHhhh'),
  R(3, 'hhhhhhhhhh'),
  R(3, 'hhhhhhhhhh'),
  R(3, 'hhhhhhhhhh'),
  R(3, 'shhhhhhhhs'),
  R(4, 'ShhhhhhS'),
  R(3, 'sttSSSStts'),
  R(3, 'stttttttts'),
  R(3, 'sTttttttTs'),
  R(3, 'STttttttTS'),
  R(4, 'bbbbbbbb'),
  R(4, 'bbbBBbbb'),
];

const LEFT_TOP = [
  R(0),
  R(6, 'hhhhh'),
  R(5, 'hhhhhhh'),
  R(4, 'hhhHHhhhh'),
  R(4, 'hhhhhhhhh'),
  R(4, 'shhhhhhhh'),
  R(3, 'sssshhhhhh'),
  R(3, 'sesssShhhh'),
  R(3, 'sesssShhhh'),
  R(4, 'SssssShh'),
  R(5, 'tSSttt'),
  R(5, 'ttsstt'),
  R(5, 'TtsstT'),
  R(5, 'TtSStT'),
  R(5, 'bbbbbb'),
  R(5, 'bbbbBb'),
];

const LEGS = {
  down: {
    stand: [R(5, 'ss..ss'), R(5, 'ff..ff'), R(5, 'FF..FF'), R(0)],
    stepA: [R(5, 'ss..ss'), R(5, 'ff..FF'), R(5, 'FF'), R(0)],
    stepB: [R(5, 'ss..ss'), R(5, 'FF..ff'), R(9, 'FF'), R(0)],
  },
  left: {
    stand: [R(6, 'sss'), R(5, 'ffff'), R(5, 'FFFF'), R(0)],
    stepA: [R(5, 'ss.ss'), R(4, 'fff.ff'), R(4, 'FFF.FF'), R(0)],
    stepB: [R(5, 'ss.ss'), R(4, 'fff.ff'), R(4, 'FFF.FF'), R(0)],
  },
};

// Arm swing for the side view: the visible arm moves forward, then back.
const LEFT_ARMS = {
  stepA: [R(5, 'tssttt'), R(5, 'TssttT'), R(5, 'TSSttT')],
  stepB: [R(5, 'tttsst'), R(5, 'TttssT'), R(5, 'TttSST')],
};

const FLEX = [
  R(0),
  R(5, 'hhhhhh'),
  R(4, 'hhhhhhhh'),
  R(3, 'hhhHHhhhhh'),
  R(3, 'hhHhhhhhhh'),
  R(3, 'hhhhhhhhhh'),
  R(0, 'SS.hssssssssh.SS'),
  R(0, 'ss.hsessssesh.ss'),
  R(0, 'sS.hsessssesh.Ss'),
  R(0, '.sS.SssssssS.Ss.'),
  R(1, 'sSsttSSSSttsSs'),
  R(3, 'stttttttts'),
  R(3, 'tTttuuttTt'),
  R(4, 'TttttttT'),
  R(4, 'bbbbbbbb'),
  R(4, 'bbbBBbbb'),
  R(4, 'ss....ss'),
  R(4, 'ff....ff'),
  R(4, 'FF....FF'),
  R(0),
];

const toGrid = (rows) => rows.map((row) => row.split(''));
const toRows = (grid) => grid.map((row) => row.join(''));
const put = (grid, x, y, ch) => {
  if (grid[y] && x >= 0 && x < 16) grid[y][x] = ch;
};

/** Accessory patches, applied per facing before outlining. */
const PATCHES = {
  ponytail(grid, facing) {
    if (facing === 'up') {
      for (let y = 8; y <= 11; y++) {
        put(grid, 7, y, 'h');
        put(grid, 8, y, y === 11 ? 'h' : 'H');
      }
    } else if (facing === 'left') {
      for (let y = 5; y <= 9; y++) put(grid, 13, y, 'h');
      put(grid, 14, 7, 'h');
      put(grid, 14, 8, 'h');
    } else if (facing === 'down') {
      put(grid, 13, 7, 'h');
      put(grid, 13, 8, 'h');
    }
  },
  cap(grid, facing, { backwards = false } = {}) {
    for (let y = 1; y <= 4; y++) {
      for (let x = 0; x < 16; x++) {
        if (grid[y][x] === 'h' || grid[y][x] === 'H') grid[y][x] = y === 1 || grid[y][x] === 'H' ? 'C' : 'c';
      }
    }
    const brimFront = !backwards;
    if (facing === 'down') {
      if (brimFront) for (let x = 3; x <= 12; x++) put(grid, x, 5, 'C');
      else for (let x = 4; x <= 11; x++) put(grid, x, 4, 'c');
    } else if (facing === 'up') {
      if (!brimFront) for (let x = 3; x <= 12; x++) put(grid, x, 5, 'C');
    } else if (facing === 'left') {
      if (brimFront) for (let x = 1; x <= 4; x++) put(grid, x, 5, 'C');
      else for (let x = 12; x <= 14; x++) put(grid, x, 5, 'C');
    }
  },
  beard(grid, facing) {
    if (facing === 'down') {
      put(grid, 4, 8, 'g');
      put(grid, 11, 8, 'g');
      for (let x = 4; x <= 11; x++) put(grid, x, 9, 'g');
      for (let x = 6; x <= 9; x++) put(grid, x, 10, 'g');
    } else if (facing === 'left') {
      for (let x = 3; x <= 8; x++) put(grid, x, 9, 'g');
      put(grid, 7, 8, 'g');
      put(grid, 5, 10, 'g');
      put(grid, 6, 10, 'g');
    }
  },
};

/*
 * GOGGINS, the walking partner. He gets his own body rather than a recolour
 * of the shared template: a bald dome instead of hair volume, a thick neck
 * running straight into the traps, two-pixel arms, and shoulders one pixel
 * wider on each side than everyone else, so he reads as the biggest person
 * in the room at 16×20. H/W are the shine on the scalp, g the beard.
 */
const GOGGINS_DOWN = [
  R(0),
  R(5, 'sHHsss'),
  R(4, 'sHWHsssS'),
  R(4, 'sHHssssS'),
  R(4, 'sssssssS'),
  R(3, 'SsggssggsS'),
  R(3, 'SsweSSewsS'),
  R(4, 'sssSSssS'),
  R(4, 'gsggggsg'),
  R(3, 'ssggggggss'),
  R(2, 'ssstSSSStsss'),
  R(2, 'sSttuSSuttSs'),
  R(2, 'sSttttttttSs'),
  R(2, 'sSTttttttTSs'),
  R(2, 'SSbbbbbbbbSS'),
  R(4, 'bbbBBbbb'),
];

const GOGGINS_UP = [
  R(0),
  R(5, 'sHHsss'),
  R(4, 'sHWHsssS'),
  R(4, 'sHHssssS'),
  R(4, 'sssssssS'),
  R(3, 'SssssssssS'),
  R(3, 'SssssssssS'),
  R(4, 'ssssssSS'),
  R(4, 'gSssssSg'),
  R(3, 'ssSSSSSSss'),
  R(2, 'sssttttttsss'),
  R(2, 'sSttttttttSs'),
  R(2, 'sSttttttttSs'),
  R(2, 'sSTttttttTSs'),
  R(2, 'SSbbbbbbbbSS'),
  R(4, 'bbbBBbbb'),
];

const GOGGINS_LEFT = [
  R(0),
  R(6, 'HHss'),
  R(5, 'HWHsss'),
  R(4, 'sHHssssS'),
  R(4, 'ssssssssS'),
  R(3, 'ggsssssssS'),
  R(3, 'sesssSsssS'),
  R(2, 'ssssssSSssS'),
  R(3, 'ggssggsssS'),
  R(3, 'gggggsSSs'),
  R(4, 'ttsssttT'),
  R(4, 'ttssSttT'),
  R(4, 'TtssSttT'),
  R(4, 'TtsSSttT'),
  R(4, 'bbSSSbbb'),
  R(4, 'bbbbbbBb'),
];

// Side-view arm swing: forward past the chest, then back past the lats.
const GOGGINS_LEFT_ARMS = {
  stepA: [R(4, 'tssStttT'), R(3, 'ssStttttT'), R(2, 'SSSttttttT')],
  stepB: [R(4, 'tttssStT'), R(4, 'TtttssST'), R(4, 'TttttSSSS')],
};

const GOGGINS_LEGS = {
  down: {
    stand: [R(4, 'sss..sss'), R(4, 'fff..fff'), R(4, 'FFF..FFF'), R(0)],
    stepA: [R(4, 'sss..sss'), R(4, 'fff..FFF'), R(4, 'FFF'), R(0)],
    stepB: [R(4, 'sss..sss'), R(4, 'FFF..fff'), R(9, 'FFF'), R(0)],
  },
  left: {
    stand: [R(5, 'ssss'), R(4, 'fffff'), R(4, 'FFFFF'), R(0)],
    stepA: [R(4, 'sss.sss'), R(3, 'ffff.fff'), R(3, 'FFFF.FFF'), R(0)],
    stepB: [R(4, 'sss.sss'), R(3, 'ffff.fff'), R(3, 'FFFF.FFF'), R(0)],
  },
};

// Front double biceps. The mirror gets two of them.
const GOGGINS_FLEX = [
  R(0),
  R(5, 'sHHsss'),
  R(4, 'sHWHsssS'),
  R(4, 'sHHssssS'),
  R(0, 'SS..sssssssS..SS'),
  R(0, 'ss.SsggssggsS.ss'),
  R(0, 'sS.SsweSSewsS.Ss'),
  R(0, 'sS..sssSSssS..Ss'),
  R(0, '.sS.gsggggsg.Ss.'),
  R(0, '.sSsssggggggsSs.'),
  R(1, 'sSsstSSSStssSs'),
  R(2, 'ssttuSSuttss'),
  R(3, 'tTttttttTt'),
  R(4, 'TttttttT'),
  R(4, 'bbbbbbbb'),
  R(4, 'bbbBBbbb'),
  R(4, 'sss..sss'),
  R(4, 'fff..fff'),
  R(4, 'FFF..FFF'),
  R(0),
];

export const GOGGINS_TEMPLATES = {
  down: GOGGINS_DOWN,
  up: GOGGINS_UP,
  left: GOGGINS_LEFT,
  leftArms: GOGGINS_LEFT_ARMS,
  legs: GOGGINS_LEGS,
  flex: GOGGINS_FLEX,
};

function frame(topRows, legRows, palette, patches, facing) {
  const grid = toGrid([...topRows, ...legRows]);
  for (const [name, options] of patches) PATCHES[name]?.(grid, facing, options);
  return outline(fromRows(toRows(grid), palette), palette.o || '#0b0c10');
}

/**
 * Builds { down:[stand,stepA,stepB], up:[...], left:[...], right:[...], flex }.
 * `accessories` is a list of [patchName, options]; `templates` swaps in a
 * different body (see GOGGINS_TEMPLATES) for anyone who isn't the default build.
 */
export function buildCharacter(palette, accessories = [], templates = {}) {
  const fullPalette = { e: '#120e14', w: '#ffffff', ...palette };
  const tpl = { down: DOWN_TOP, up: UP_TOP, left: LEFT_TOP, leftArms: LEFT_ARMS, legs: LEGS, flex: FLEX, ...templates };
  const leftTop = (arms) => {
    if (!arms) return tpl.left;
    return [...tpl.left.slice(0, 11), ...arms, ...tpl.left.slice(14)];
  };

  const down = ['stand', 'stepA', 'stepB'].map((f) =>
    frame(tpl.down, tpl.legs.down[f], fullPalette, accessories, 'down')
  );
  const up = ['stand', 'stepA', 'stepB'].map((f) =>
    frame(tpl.up, tpl.legs.down[f], fullPalette, accessories, 'up')
  );
  const left = [
    frame(leftTop(null), tpl.legs.left.stand, fullPalette, accessories, 'left'),
    frame(leftTop(tpl.leftArms.stepA), tpl.legs.left.stepA, fullPalette, accessories, 'left'),
    frame(leftTop(tpl.leftArms.stepB), tpl.legs.left.stepB, fullPalette, accessories, 'left'),
  ];
  const right = left.map(flipX);
  const flexGrid = toGrid(tpl.flex);
  for (const [name, options] of accessories) PATCHES[name]?.(flexGrid, 'down', options);
  const flex = outline(fromRows(toRows(flexGrid), fullPalette), fullPalette.o || '#0b0c10');
  return { down, up, left, right, flex };
}

export const PALETTES = {
  sree: {
    h: '#1b1411', H: '#3b2b22', s: '#c68a5c', S: '#9f6a42',
    t: '#d91f2b', T: '#96131c', u: '#ff5b66',
    b: '#262b39', B: '#161923', f: '#f3f3f6', F: '#a3a9b8',
  },
  desk: {
    h: '#5a3322', H: '#83503a', s: '#e3ab8a', S: '#bf8466',
    t: '#1f9a72', T: '#146a4e', u: '#48c79b',
    b: '#3a3e4c', B: '#262934', f: '#2a2d38', F: '#15171d',
  },
  coach: {
    h: '#1c1613', H: '#3a2e27', s: '#a8704a', S: '#80522f', g: '#1c1613',
    t: '#3b404d', T: '#262a33', u: '#5c6372',
    b: '#15171d', B: '#0c0d11', f: '#e4e4ea', F: '#9aa0ae',
  },
  bro: {
    h: '#2c1d14', H: '#4a3122', s: '#e6b28c', S: '#c28b66', c: '#2f6fe0', C: '#1d4aa6',
    t: '#eeeff3', T: '#b3b8c3', u: '#ffffff',
    b: '#39414f', B: '#232833', f: '#ff4655', F: '#b82633',
  },
  curler: {
    h: '#e2bd55', H: '#fff0a0', s: '#f0c3a0', S: '#cf9d7a',
    t: '#ff6aab', T: '#c84484', u: '#ffa3cc',
    b: '#1c1f27', B: '#101217', f: '#f3f3f6', F: '#a3a9b8',
  },
  runner: {
    h: '#1f1519', H: '#3d2a31', s: '#8e5a3b', S: '#6b4028',
    t: '#8b5cf6', T: '#6239c9', u: '#b18cff',
    b: '#15171d', B: '#0b0c10', f: '#35c2ff', F: '#1c7fb0',
  },
  janitor: {
    h: '#4a4f5c', H: '#6b7180', s: '#d7a07c', S: '#b27d5a', c: '#59606f', C: '#3c414d',
    t: '#2e5c8a', T: '#1e4163', u: '#4379ad',
    b: '#2a5480', B: '#1b3a5b', f: '#1c1c20', F: '#0e0e10',
  },
  // Bald, so the "hair" is skin; H and W are the shine on the scalp. The
  // black kit is lifted off pure black so it still separates from the outline.
  goggins: {
    h: '#744630', H: '#a0694a', W: '#dcaa85', s: '#744630', S: '#51301f', g: '#17100d',
    e: '#0c0909', w: '#efe9df',
    t: '#2c2f38', T: '#1c1e25', u: '#3f4350',
    b: '#23262e', B: '#17191f', f: '#3b3f4b', F: '#22242b',
    m: '#3b1614', n: '#e7e0d3',
  },
};

export const CHARACTER_SPECS = {
  sree: [PALETTES.sree, []],
  desk: [PALETTES.desk, [['ponytail']]],
  coach: [PALETTES.coach, [['beard']]],
  bro: [PALETTES.bro, [['cap', { backwards: true }]]],
  curler: [PALETTES.curler, []],
  runner: [PALETTES.runner, [['ponytail']]],
  janitor: [PALETTES.janitor, [['cap']]],
  goggins: [PALETTES.goggins, [], GOGGINS_TEMPLATES],
};

let cache = null;
export function characters() {
  if (!cache) {
    cache = Object.fromEntries(
      Object.entries(CHARACTER_SPECS).map(([id, [palette, acc, templates]]) => [
        id,
        buildCharacter(palette, acc, templates),
      ])
    );
  }
  return cache;
}

/** A sleeping cat, two breathing frames. It lives outside the gym. */
export function buildCat() {
  const palette = { a: '#e08a3c', A: '#b5652a', w: '#f4e3cf', k: '#2a1a12' };
  const base = [
    '.....aa.aa..',
    '....aaaaaa..',
    '..aaaAkaAka.',
    '.aaaaaaaaaaa',
    'aAaaaaaawwaa',
    'aaAaAaaaaaa.',
    '.aaaaaaaaa..',
  ];
  const breathe = [
    '............',
    '.....aa.aa..',
    '....aaaaaa..',
    '..aaaAkaAka.',
    '.aaaaaaaaaaa',
    'aAaaaaaawwaa',
    '.aaaAaaaaaa.',
  ];
  return [base, breathe].map((rows) => outline(fromRows(['............', ...rows], palette), '#0b0c10'));
}

/**
 * SREE from behind, waist up, for the battle scene. Authored as the left half
 * and mirrored, so it is symmetric by construction.
 */
const BACK_LEFT = [
  '............hhhh',
  '..........hhhhhh',
  '.........hhhHHhh',
  '........hhhHHHhh',
  '........hhHHhhhh',
  '........hhhhhhhh',
  '........hhhhhhhh',
  '.......shhhhhhhh',
  '.......Shhhhhhhh',
  '........hhhhhhhh',
  '.........hhhhhhh',
  '..........Shhhhh',
  '...........SSsss',
  '.........sssSsss',
  '......ssssssSsss',
  '....sssssssttsss',
  '...sssssssssttss',
  '..sssssssssssttt',
  '..SsssssTttttttt',
  '..SsssssTttttttt',
  '..SssssSTttttttt',
  '..SSsssSTTtttttt',
  '..Sssss.TTtttttt',
  '..Sssss.Tttttttt',
  '..Sssss.Tttttttt',
  '..SsssS.Tttttttt',
  '...SssS.Tttttttt',
  '...Ssss.Tttttttt',
  '...Ssss.TTtttttt',
  '...Ssss.TTtttttt',
  '...Ssss..Ttttttt',
  '...Ssss..Ttttttt',
  '...Ssss..Ttttttt',
  '...Ssss..TTttttt',
  '....SS...TTttttt',
  '....SS...TTTTTTT',
];

export function buildBackSprite(palette = PALETTES.sree) {
  const rows = BACK_LEFT.map((half) => half + [...half].reverse().join(''));
  // A little asymmetry sells the lighting: a hair highlight on one side only.
  const grid = rows.map((row) => row.split(''));
  [[2, 18], [2, 19], [3, 18], [3, 19], [3, 20], [4, 20], [4, 21]].forEach(([y, x]) => {
    if (grid[y][x] === 'H') grid[y][x] = 'h';
  });
  return outline(fromRows(grid.map((r) => r.join('')), { e: '#120e14', ...palette }), '#0b0c10');
}

/*
 * GOGGINS in your corner during a battle: waist up, facing the camera, at
 * the same 2× the back view of SREE is drawn at so the two read as one team.
 * Arms crossed while you lift; a fist in the air and the mouth open when he
 * has something to say.
 */
const GOGGINS_CORNER = {
  idle: [
    '.........HHssss.........',
    '.......sHWHssssss.......',
    '......sHHHsssssssS......',
    '......sHHssssssssS......',
    '......ssssssssssSS......',
    '.....SsggssssssggsS.....',
    '.....SssgggSSgggssS.....',
    '.....SsswesSSsewssS.....',
    '.....SssssSssSssssS.....',
    '......ssggSSSSggss......',
    '......gsggggggggsg......',
    '......ggggmmmmgggg......',
    '.......gggggggggg.......',
    '....ssssSggggggSssss....',
    '.ssssssttSSSSSSttssssss.',
    '.sssssStttSSSStttSsssss.',
    '.ssssSttuuttttuuttSssss.',
    '.ssssSttttttttttttSssss.',
    '.SssssssssssssssssSssss.',
    '.SsSSSSSSSSSSSSSsssSsss.',
    '.SssssssssssssssssssssS.',
    '..SSSSSSSSSSSSSSSSSSSS..',
    '..TttttttttttttttttttT..',
    '..TttttttttttttttttttT..',
    '..TTttttttttttttttttTT..',
    '..bbbbbbbbbbbbbbbbbbbb..',
  ],
  shout: [
    '.........HHssss.........',
    '.......sHWHssssss.......',
    '......sHHHsssssssS......',
    '.SSSS.sHHssssssssS......',
    '.Ssss.ssssssssssSS......',
    '.SsssSsggssssssggsS.....',
    '.SSSSSssgggSSgggssS.....',
    '..ss.SsswesSSsewssS.....',
    '..ss.SssssSssSssssS.....',
    '..ss..ssggSSSSggss......',
    '.Sss..gsggggggggsg......',
    '.Sss..gggmnnnnmggg......',
    '.Sss...ggmmmmmmgg.......',
    '.SssssssSggggggSssss....',
    '.ssssssttSSSSSSttssssss.',
    '.sssssStttSSSStttSsssss.',
    '.ssssSttuuttttuuttSssss.',
    '..TtttttttttttttttSssss.',
    '..TtttttttttttttttSssss.',
    '..TtttttttttttttttSssss.',
    '..TtttttttttttttttSssss.',
    '..Tttttttttttttttttssss.',
    '..TttttttttttttttttSSSS.',
    '..TttttttttttttttttttT..',
    '..TTttttttttttttttttTT..',
    '..bbbbbbbbbbbbbbbbbbbb..',
  ],
};

export function buildGogginsCorner(palette = PALETTES.goggins) {
  const full = { e: '#120e14', w: '#ffffff', ...palette };
  const make = (rows) => outline(fromRows(rows, full), '#0b0c10');
  return { idle: make(GOGGINS_CORNER.idle), shout: make(GOGGINS_CORNER.shout) };
}
