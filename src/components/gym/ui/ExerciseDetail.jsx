import React from 'react';
import { GROUPS, STATIONS, formatDate, formatKg, formatSet, formatVolume, isFreshPr } from '../gameData';

export const dexNo = (n) => `#${String(n).padStart(3, '0')}`;

/** Top set per session, as pixel bars. The record session is gold. */
function History({ exercise }) {
  const points = exercise.history;
  if (points.length < 1) return null;
  const value = (h) => (exercise.weighted ? h.topWeight : h.topReps);
  const max = Math.max(...points.map(value));
  const min = Math.min(...points.map(value));
  const floor = points.length > 1 ? Math.max(0, min - (max - min) * 0.6) : 0;
  const bestSession = points.reduce((top, h) => (value(h) > value(top) ? h : top), points[0]);
  const unit = exercise.weighted ? 'KG' : 'REPS';
  return (
    <figure className="gym-history" aria-label={`Top set per session for ${exercise.name}`}>
      <figcaption>
        <span>TOP SET / SESSION</span>
        <span>
          {formatKg(max)} {unit}
        </span>
      </figcaption>
      <div className="gym-history-bars">
        {points.map((h) => {
          const pct = max === floor ? 100 : ((value(h) - floor) / (max - floor)) * 82 + 18;
          return (
            <span
              key={h.sessionId}
              className={`gym-history-bar ${h === bestSession ? 'is-best' : ''}`}
              style={{ height: `${pct}%` }}
              title={`${formatDate(h.date)} — ${exercise.weighted ? `${formatKg(h.topWeight)} kg × ${h.topReps}` : `${h.topReps} reps`}`}
            />
          );
        })}
      </div>
      <div className="gym-history-axis">
        <span>{formatDate(points[0].date)}</span>
        {points.length > 1 && <span>{formatDate(points[points.length - 1].date)}</span>}
      </div>
    </figure>
  );
}

export default function ExerciseDetail({ exercise, showStation = false }) {
  const group = GROUPS[exercise.group];

  return (
    <div className="gym-detail">
      <div className="gym-detail-head">
        <span className="gym-dexno">{dexNo(exercise.dex)}</span>
        <h3 className="gym-detail-title">{exercise.short}</h3>
        <span className="gym-chip" style={{ '--chip': group.color }}>
          {group.name}
        </span>
      </div>
      <p className="gym-detail-sub">
        {exercise.name}
        {showStation && <> · {STATIONS[exercise.station]?.name}</>}
        {isFreshPr(exercise) && <span className="gym-caught"> · ★ NEW BEST THIS WEEK</span>}
      </p>
      <dl className="gym-stats">
        <div>
          <dt>BEST SET</dt>
          <dd>{formatSet(exercise, exercise.best)}</dd>
        </div>
        {exercise.weighted && exercise.bestEstimate && (
          <div>
            <dt>EST. 1RM</dt>
            <dd>{formatKg(exercise.bestEstimate.e1rm)} KG</dd>
          </div>
        )}
        <div>
          <dt>SESSIONS</dt>
          <dd>{exercise.sessionCount}</dd>
        </div>
        <div>
          <dt>SETS</dt>
          <dd>{exercise.totalSets}</dd>
        </div>
        <div>
          <dt>{exercise.weighted ? 'VOLUME' : 'TOTAL REPS'}</dt>
          <dd>{exercise.weighted ? formatVolume(exercise.volume) : exercise.totalReps}</dd>
        </div>
        <div>
          <dt>LAST DONE</dt>
          <dd>{formatDate(exercise.lastDate)}</dd>
        </div>
      </dl>
      <History exercise={exercise} />
      {exercise.outliers.length > 0 && (
        <p className="gym-note">
          Left out of the record:{' '}
          {exercise.outliers.map((s) => `${formatKg(s.weight)} kg × ${s.reps}`).join(', ')} — almost
          certainly a logging slip.
        </p>
      )}
      {exercise.notes.length > 0 && <p className="gym-note">Note in the log: “{exercise.notes.join('”, “')}”</p>}
    </div>
  );
}
