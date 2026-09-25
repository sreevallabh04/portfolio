/**
 * What the page remembers between visits lives in this browser only
 * (localStorage): whether you've been through the intro, and your sound
 * settings. It is a per-visitor convenience — nothing depends on it
 * surviving — so every access is guarded and a fresh save is always valid.
 */
import { BASE_XP, levelForXp } from './gameData';

const KEY = 'pr-quest:v1';

export const freshSave = () => ({
  started: false,
  metDesk: false,
  muted: false,
  music: true,
});

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshSave();
    // Older saves carried PR attempts and XP; only the settings survive.
    const { started, metDesk, muted, music } = { ...freshSave(), ...JSON.parse(raw) };
    return { started: !!started, metDesk: !!metDesk, muted: !!muted, music: music !== false };
  } catch {
    return freshSave();
  }
}

export function writeSave(save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    /* private mode or storage full: settings just won't persist */
  }
}

/** The level comes from real training volume and nothing else. */
export const totalXp = () => BASE_XP;

export const playerLevel = () => levelForXp(BASE_XP);
