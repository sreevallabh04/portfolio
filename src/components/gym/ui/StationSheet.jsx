import React, { useMemo, useState } from 'react';
import { LAYER } from '../engine/input';
import { MINIGAME_INFO } from '../engine/minigames';
import { STATIONS, exercisesAt, formatKg } from '../gameData';
import { starsFor } from '../save';
import ExerciseDetail, { dexNo } from './ExerciseDetail';
import Menu from './Menu';

export const challengeTarget = (exercise, c) =>
  exercise.weighted ? `${formatKg(c.weight)} KG × ${c.reps}` : `${c.reps} REPS`;

/**
 * What a station shows when you use it: the lifts logged there, the record
 * for each, and the three PR attempts on offer.
 */
export default function StationSheet({ stationId, save, input, audio, onClose, onChallenge }) {
  const list = useMemo(() => exercisesAt(stationId), [stationId]);
  const [selected, setSelected] = useState(0);
  const [focus, setFocus] = useState(list.length === 1 ? 'challenges' : 'list');
  const exercise = list[selected];
  const station = STATIONS[stationId];
  const beaten = starsFor(save, exercise.id);

  const listItems = list.map((e) => ({
    key: e.id,
    label: e.short,
    detail: starsFor(save, e.id) ? '★'.repeat(starsFor(save, e.id)) : dexNo(e.dex),
  }));

  const challengeItems = exercise.challenges.map((c) => ({
    key: `${exercise.id}-${c.stars}`,
    label: (
      <>
        <span className="gym-stars" aria-label={`${c.stars} star`}>
          {'★'.repeat(c.stars)}
          <span className="gym-stars-off">{'★'.repeat(3 - c.stars)}</span>
        </span>
        <span className="gym-challenge-name">{c.label}</span>
      </>
    ),
    detail: (
      <>
        {challengeTarget(exercise, c)}
        {beaten >= c.stars && <span className="gym-beaten"> ✓</span>}
      </>
    ),
    value: c,
  }));

  return (
    <div className="gym-overlay" role="dialog" aria-label={station.name}>
      <div className="gym-sheet px-box">
        <header className="gym-sheet-head">
          <div>
            <p className="gym-eyebrow">STATION</p>
            <h2 className="gym-sheet-title">{station.name}</h2>
          </div>
          <button type="button" className="gym-close" onClick={onClose} aria-label="Close">
            B · CLOSE
          </button>
        </header>
        <div className={`gym-sheet-body ${list.length === 1 ? 'is-single' : ''}`}>
          {list.length > 1 && (
            <div className={`gym-sheet-list ${focus === 'list' ? 'is-focus' : ''}`}>
              <p className="gym-eyebrow">{list.length} LIFTS LOGGED HERE</p>
              <Menu
                items={listItems}
                input={input}
                audio={audio}
                priority={LAYER.sheet + 1}
                active={focus === 'list'}
                initial={selected}
                onHighlight={(_, i) => setSelected(i)}
                onSelect={() => setFocus('challenges')}
                onKey={(b) => b === 'right' && setFocus('challenges')}
                onCancel={onClose}
                label="Lifts"
              />
            </div>
          )}
          <div className="gym-sheet-detail">
            <ExerciseDetail exercise={exercise} save={save} />
            <div className={`gym-challenges ${focus === 'challenges' ? 'is-focus' : ''}`}>
              <p className="gym-eyebrow">
                ATTEMPT A PR · <span className="gym-muted">{MINIGAME_INFO[exercise.minigame].name}</span>
              </p>
              <Menu
                key={exercise.id}
                items={challengeItems}
                input={input}
                audio={audio}
                priority={LAYER.sheet + 1}
                active={focus === 'challenges'}
                onSelect={(item) => onChallenge(exercise, item.value)}
                onKey={(b) => b === 'left' && list.length > 1 && setFocus('list')}
                onCancel={() => (list.length > 1 ? setFocus('list') : onClose())}
                className="gym-challenge-menu"
                label="PR attempts"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
