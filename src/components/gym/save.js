/**
 * Game progress lives in this browser only (localStorage). It is a per-visitor
 * convenience — nothing depends on it surviving — so every access is guarded
 * and a fresh save is always a valid fallback.
 */
import {
  ACTIVE_GROUPS,
  BASE_XP,
  BADGES_FOR_BOSS,
  EXERCISES,
  EXERCISE_BY_ID,
  badgeRequirement,
  levelForXp,
} from './gameData';

const KEY = 'pr-quest:v1';

export const freshSave = () => ({
  started: false,
  prs: {},
  xp: 0,
  bossBeaten: false,
  metDesk: false,
  chalkBonus: 0,
  muted: false,
  music: true,
  battles: 0,
  perfects: 0,
});

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshSave();
    const parsed = JSON.parse(raw);
    const save = { ...freshSave(), ...parsed };
    // Drop records for lifts a newer export no longer contains.
    save.prs = Object.fromEntries(Object.entries(save.prs || {}).filter(([id]) => EXERCISE_BY_ID[id]));
    return save;
  } catch {
    return freshSave();
  }
}

export function writeSave(save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    /* private mode or storage full: progress just won't persist */
  }
}

export const starsFor = (save, id) => save.prs[id]?.stars || 0;

export const caughtCount = (save) => Object.keys(save.prs).length;

export function badgesEarned(save) {
  return ACTIVE_GROUPS.filter((group) => {
    const beaten = EXERCISES.filter((e) => e.group === group && save.prs[e.id]).length;
    return beaten >= badgeRequirement(group);
  });
}

export const bossUnlocked = (save) => Number.isFinite(BADGES_FOR_BOSS) && badgesEarned(save).length >= BADGES_FOR_BOSS;

export const totalXp = (save) => BASE_XP + (save.xp || 0);

export const playerLevel = (save) => levelForXp(totalXp(save));
