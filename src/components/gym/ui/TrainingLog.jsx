import React from 'react';
import { LAYER } from '../engine/input';
import { EXERCISES, LOG, formatDate, formatVolume } from '../gameData';
import Menu from './Menu';

const short = (name) => EXERCISES.find((e) => e.name === name)?.short || name.toUpperCase();

const clock = (date) =>
  date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(' ', ' ');

/** Every session in the export, newest first. */
export default function TrainingLog({ input, audio, onClose }) {
  const sessions = [...LOG.sessions].reverse();
  return (
    <div className="gym-overlay" role="dialog" aria-label="Training log">
      <div className="gym-sheet gym-log px-box">
        <header className="gym-sheet-head">
          <div>
            <p className="gym-eyebrow">
              TRAINING LOG · {LOG.totals.sessions} SESSIONS · {formatVolume(LOG.totals.volume)}
            </p>
            <h2 className="gym-sheet-title">STRAIGHT FROM HEVY</h2>
          </div>
          <button type="button" className="gym-close" onClick={onClose}>
            B · CLOSE
          </button>
        </header>
        <Menu
          className="gym-log-list"
          items={sessions.map((s) => ({
            key: s.key,
            label: (
              <span className="gym-log-row">
                <span className="gym-log-date">
                  {formatDate(s.start)} · {clock(s.start)}
                </span>
                <span className="gym-log-title">{s.title}</span>
                <span className="gym-log-lifts">{s.exercises.map(short).join(' · ')}</span>
              </span>
            ),
            detail: (
              <span className="gym-log-stats">
                <span>{s.minutes ? `${s.minutes} MIN` : '—'}</span>
                <span>{s.sets} SETS</span>
                <span>{s.volume ? formatVolume(s.volume) : `${s.reps} REPS`}</span>
              </span>
            ),
          }))}
          input={input}
          audio={audio}
          priority={LAYER.sheet + 1}
          onSelect={() => {}}
          onCancel={onClose}
          label="Sessions"
        />
      </div>
    </div>
  );
}
