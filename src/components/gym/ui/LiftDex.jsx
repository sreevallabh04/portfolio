import React, { useMemo, useRef, useState } from 'react';
import { LAYER } from '../engine/input';
import { EXERCISES, GROUPS, GROUP_ORDER, isFreshPr } from '../gameData';
import ExerciseDetail, { dexNo } from './ExerciseDetail';
import Menu from './Menu';

const TABS = ['all', ...GROUP_ORDER.filter((g) => EXERCISES.some((e) => e.group === g))];

/** Every lift in the log, numbered like a field guide. */
export default function LiftDex({ input, audio, onClose, onOpen }) {
  const [tab, setTab] = useState(0);
  const [selected, setSelected] = useState(0);
  // A tap on a row only selects it, so touch users get to read the detail;
  // A (or the button in the detail pane) opens the replay.
  const pointerAt = useRef(0);
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
              LIFTDEX · {EXERCISES.length} LIFTS · {EXERCISES.filter(isFreshPr).length} NEW BESTS THIS WEEK
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
          <div
            className="gym-sheet-list is-focus"
            onPointerDownCapture={() => {
              pointerAt.current = performance.now();
            }}
          >
            <Menu
              key={group}
              items={list.map((e) => ({
                key: e.id,
                label: e.short,
                detail: isFreshPr(e) ? `★ ${dexNo(e.dex)}` : dexNo(e.dex),
              }))}
              input={input}
              audio={audio}
              priority={LAYER.sheet + 1}
              onHighlight={(_, i) => setSelected(i)}
              onSelect={(item) => {
                if (performance.now() - pointerAt.current < 700) return;
                onOpen?.(EXERCISES.find((e) => e.id === item.key));
              }}
              onKey={(b) => (b === 'left' ? switchTab(-1) : b === 'right' ? switchTab(1) : null)}
              onCancel={onClose}
              label="Lifts"
            />
          </div>
          <div className="gym-sheet-detail">
            {exercise && <ExerciseDetail exercise={exercise} showStation />}
            {exercise && onOpen && (
              <button type="button" className="gym-open-showcase px-box px-font" onClick={() => onOpen(exercise)}>
                ▶ WATCH THE SESSIONS
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
