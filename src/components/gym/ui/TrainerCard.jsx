import React, { useEffect, useRef } from 'react';
import { LAYER, useInputLayer } from '../engine/input';
import { ACTIVE_GROUPS, GROUPS, EXERCISES, TRAINER, formatDate, formatKg, formatVolume, xpForLevel } from '../gameData';
import { badgesEarned, caughtCount, playerLevel, totalXp } from '../save';
import BadgeIcon from './BadgeIcon';

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

/** The trainer card: real training stats, plus what's been won in here. */
export default function TrainerCard({ save, input, audio, onClose, sprite }) {
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
  const level = playerLevel(save);
  const xp = totalXp(save);
  const into = xp - xpForLevel(level);
  const span = xpForLevel(level + 1) - xpForLevel(level);
  const earned = badgesEarned(save);
  const hours = Math.floor(t.minutes / 60);
  const mins = t.minutes % 60;
  const most = EXERCISES.find((e) => e.name === t.mostTrained);

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
              <span className="gym-xpbar" aria-label={`${into} of ${span} XP to next level`}>
                <span style={{ width: `${Math.max(2, (into / span) * 100)}%` }} />
              </span>
              <span className="gym-muted">{(span - into).toLocaleString('en-US')} XP TO GO</span>
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
        <div className="gym-card-badges">
          <p className="gym-eyebrow">
            BADGES {earned.length}/{ACTIVE_GROUPS.length} · PRS BROKEN {caughtCount(save)}/{EXERCISES.length}
          </p>
          <ul>
            {ACTIVE_GROUPS.map((g) => (
              <li key={g} className={earned.includes(g) ? 'is-earned' : ''} title={GROUPS[g].badge}>
                <BadgeIcon group={g} earned={earned.includes(g)} />
                <span>{GROUPS[g].badge.replace(' BADGE', '')}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="gym-card-foot">Every number above comes from the Hevy log. A · CLOSE</p>
      </div>
    </div>
  );
}
