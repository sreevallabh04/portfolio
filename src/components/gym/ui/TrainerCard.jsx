import React, { useEffect, useRef } from 'react';
import { LAYER, useInputLayer } from '../engine/input';
import { GROUPS, EXERCISES, TRAINER, formatDate, formatKg, formatSet, formatVolume, isFreshPr, xpForLevel } from '../gameData';
import { playerLevel, totalXp } from '../save';
import { BESTS, TOTALS, formatDuration, formatKm } from '@/lib/strava';

function Portrait({ sprite }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !sprite) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(sprite, 0, 0, canvas.width, canvas.height);
  }, [sprite]);
  return <canvas ref={ref} width={96} height={120} className="gym-canvas gym-portrait" aria-hidden="true" />;
}

/** The trainer card: every number on it comes from the training logs. */
export default function TrainerCard({ input, audio, onClose, sprite }) {
  useInputLayer(
    input,
    {
      onPress(button) {
        if (button === 'a' || button === 'b' || button === 'start') {
          audio?.play('back');
          onClose();
        }
      },
    },
    LAYER.menu + 1
  );

  const t = TRAINER.totals;
  const level = playerLevel();
  const xp = totalXp();
  const into = xp - xpForLevel(level);
  const span = xpForLevel(level + 1) - xpForLevel(level);
  const hours = Math.floor(t.minutes / 60);
  const mins = t.minutes % 60;
  const most = EXERCISES.find((e) => e.name === t.mostTrained);
  const fresh = EXERCISES.filter(isFreshPr);

  const rows = [
    ['MEMBER SINCE', formatDate(t.firstDate)],
    ['LAST SESSION', formatDate(t.lastDate)],
    ['SESSIONS', t.sessions],
    ['TIME TRAINED', `${hours}H ${String(mins).padStart(2, '0')}M`],
    ['SETS / REPS', `${t.sets} / ${t.reps.toLocaleString('en-US')}`],
    ['TOTAL VOLUME', formatVolume(t.volume)],
    ['LONGEST STREAK', `${t.longestStreak} DAYS`],
    ['FAVOURITE DAY', t.favouriteWeekday.toUpperCase()],
    ['MOST TRAINED', most ? most.short : '—'],
  ];

  // Cardio comes from the Strava export, not Hevy.
  const run = TOTALS.byType.Run;
  const cardio = [
    run && ['RUN DISTANCE', formatKm(run.distance, 1), `${run.count} RUNS`],
    BESTS.fastest5k && ['FASTEST 5K', formatDuration(BESTS.fastest5k.seconds), BESTS.fastest5k.activity.name],
    BESTS.fastest1k && ['FASTEST 1K', formatDuration(BESTS.fastest1k.seconds), BESTS.fastest1k.activity.name],
    BESTS.longestRun && ['LONGEST RUN', formatKm(BESTS.longestRun.distance, 1), BESTS.longestRun.activity.name],
    ['TIME MOVING', `${Math.floor(TOTALS.movingTime / 3600)}H ${String(Math.floor((TOTALS.movingTime % 3600) / 60)).padStart(2, '0')}M`, `${TOTALS.activities} ACTIVITIES`],
    ['CLIMBED', `${Math.round(TOTALS.elevationGain)} M`, 'RUNS, RIDES, WALKS'],
  ].filter(Boolean);

  const lifts = [
    ['PUSH', TRAINER.push],
    ['PULL', TRAINER.pull],
    ['LEGS', TRAINER.legs],
  ].filter(([, e]) => e);

  return (
    <div className="gym-overlay" role="dialog" aria-label="Trainer card" onClick={onClose}>
      <div className="gym-card px-box" onClick={(e) => e.stopPropagation()}>
        <div className="gym-card-top">
          <div className="gym-card-portrait">
            <Portrait sprite={sprite} />
          </div>
          <div className="gym-card-id">
            <p className="gym-eyebrow">TRAINER CARD · IDNo. {String(t.sessions * 1000 + t.sets).padStart(5, '0')}</p>
            <h2 className="gym-card-name">{TRAINER.name}</h2>
            <p className="gym-card-full">{TRAINER.fullName}</p>
            <div className="gym-card-level">
              <span className="px-font">Lv{level}</span>
              <span className="gym-xpbar" aria-label={`${(span - into).toLocaleString('en-US')} kg more lifting to level ${level + 1}`}>
                <span style={{ width: `${Math.max(2, (into / span) * 100)}%` }} />
              </span>
              <span className="gym-muted">{(span - into).toLocaleString('en-US')} KG MORE LIFTING TO Lv{level + 1}</span>
            </div>
          </div>
        </div>
        <dl className="gym-card-rows">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="gym-card-lifts">
          {lifts.map(([label, e]) => (
            <div key={label}>
              <span className="gym-eyebrow">{label} · BEST E1RM</span>
              <strong>{formatKg(e.bestEstimate.e1rm)} KG</strong>
              <span className="gym-muted">{e.short}</span>
            </div>
          ))}
        </div>
        <div className="gym-card-cardio">
          <p className="gym-eyebrow">CARDIO · SYNCED FROM STRAVA</p>
          <dl>
            {cardio.map(([k, v, sub]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
                <span className="gym-muted">{sub}</span>
              </div>
            ))}
          </dl>
        </div>
        {fresh.length > 0 && (
          <div className="gym-card-fresh">
            <p className="gym-eyebrow">NEW BESTS IN THE LAST WEEK OF THE LOG</p>
            <ul>
              {fresh.map((e) => (
                <li key={e.id} style={{ '--chip': GROUPS[e.group].color }}>
                  <span className="gym-card-fresh-star">★</span>
                  <span>{e.short}</span>
                  <strong>{formatSet(e, e.best)}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="gym-card-foot">Every number above comes from the Hevy and Strava logs. A · CLOSE</p>
      </div>
    </div>
  );
}
