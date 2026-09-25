import React, { useMemo, useState } from 'react';
import { LAYER } from '../engine/input';
import { EXERCISES, GROUPS, GROUP_ORDER } from '../gameData';
import { caughtCount, starsFor } from '../save';
import ExerciseDetail, { dexNo } from './ExerciseDetail';
import Menu from './Menu';

const TABS = ['all', ...GROUP_ORDER.filter((g) => EXERCISES.some((e) => e.group === g))];

/** Every lift in the log, numbered like a field guide. */
export default function LiftDex({ save, input, audio, onClose }) {
  const [tab, setTab] = useState(0);
  const [selected, setSelected] = useState(0);
  const group = TABS[tab];
  const list = useMemo(() => EXERCISES.filter((e) => group === 'all' || e.group === group), [group]);
  const exercise = list[Math.min(selected, list.length - 1)];

  const switchTab = (delta) => {
    audio?.play('move');
    setTab((t) => (t + delta + TABS.length) % TABS.length);
    setSelected(0);
  };

  return (
    <div className="gym-overlay" role="dialog" aria-label="LiftDex">
      <div className="gym-sheet gym-dex px-box">
        <header className="gym-sheet-head">
          <div>
            <p className="gym-eyebrow">
              LIFTDEX · SEEN {EXERCISES.length} · PR BROKEN {caughtCount(save)}
            </p>
            <h2 className="gym-sheet-title">EVERY LIFT IN THE LOG</h2>
          </div>
          <button type="button" className="gym-close" onClick={onClose}>
            B · CLOSE
          </button>
        </header>
        <div className="gym-tabs" role="tablist">
          {TABS.map((t, i) => (
            <button
              type="button"
              role="tab"
              key={t}
              aria-selected={i === tab}
              className={`gym-tab ${i === tab ? 'is-active' : ''}`}
              style={t !== 'all' ? { '--chip': GROUPS[t].color } : undefined}
              onClick={() => {
                setTab(i);
                setSelected(0);
              }}
            >
              {t === 'all' ? 'ALL' : GROUPS[t].name}
            </button>
          ))}
        </div>
        <div className="gym-sheet-body">
          <div className="gym-sheet-list is-focus">
            <Menu
              key={group}
              items={list.map((e) => ({
                key: e.id,
                label: e.short,
                detail: starsFor(save, e.id) ? '★'.repeat(starsFor(save, e.id)) : dexNo(e.dex),
              }))}
              input={input}
              audio={audio}
              priority={LAYER.sheet + 1}
              onHighlight={(_, i) => setSelected(i)}
              onSelect={() => {}}
              onKey={(b) => (b === 'left' ? switchTab(-1) : b === 'right' ? switchTab(1) : null)}
              onCancel={onClose}
              label="Lifts"
            />
          </div>
          <div className="gym-sheet-detail">{exercise && <ExerciseDetail exercise={exercise} save={save} showStation />}</div>
        </div>
      </div>
    </div>
  );
}
