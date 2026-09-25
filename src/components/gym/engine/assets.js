/**
 * Builds every sprite and map once. The machines in the overworld are loaded
 * with the real heaviest set from the log, so the bench bar shows 90 kg of
 * plates because that is the heaviest bench on record.
 */
import { characters, buildBackSprite, buildCat, buildGogginsCorner } from './characters';
import { buildProps } from './props';
import { buildGym, buildStreet } from './maps';
import { EXERCISE_BY_ID, platesPerSide } from '../gameData';

const heaviest = (id, fallback) => EXERCISE_BY_ID[id]?.best?.weight ?? fallback;

// Plate-loaded machines have no bar to subtract.
const machinePlates = (total) => platesPerSide(total, { bar: 0 });

let cache = null;

export function buildAssets() {
  if (cache) return cache;
  const chars = { ...characters(), cat: buildCat(), sreeBack: buildBackSprite(), gogginsCorner: buildGogginsCorner() };
  const props = buildProps({
    benchPlates: platesPerSide(heaviest('bench-press-barbell', 60)),
    squatPlates: platesPerSide(heaviest('squat-barbell', 60)),
    smithPlates: platesPerSide(heaviest('incline-bench-press-smith-machine', 60)),
    pressPlates: machinePlates(heaviest('leg-press-machine', 100)).slice(0, 3),
    hackPlates: machinePlates(heaviest('hack-squat-machine', 50)).slice(0, 2),
    calfPlates: machinePlates(heaviest('seated-calf-raise', 50)).slice(0, 2),
    isoPlates: machinePlates(heaviest('iso-lateral-low-row', 20)).slice(0, 2),
  });
  const maps = { gym: buildGym(props), street: buildStreet(props) };
  cache = { chars, props, maps };
  return cache;
}
