import React, { useEffect, useRef } from 'react';
import { LAYER, useInputLayer } from '../engine/input';
import { EXERCISES, LOG, formatDate, formatVolume } from '../gameData';

const short = (name) => EXERCISES.find((e) => e.name === name)?.short || name.toUpperCase();

/** End credits: the real training log, oldest session first. */
export default function Credits({ input, audio, onClose }) {
  const scroller = useRef(null);

  useEffect(() => {
    audio?.music('street');
    const el = scroller.current;
    if (!el) return undefined;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;
    let frame = 0;
    let last = performance.now();
    const tick = (now) => {
      el.scrollTop += ((now - last) / 1000) * 34;
      last = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const stop = () => cancelAnimationFrame(frame);
    el.addEventListener('wheel', stop, { once: true });
    el.addEventListener('touchstart', stop, { once: true });
    return () => {
      stop();
      el.removeEventListener('wheel', stop);
      el.removeEventListener('touchstart', stop);
    };
  }, [audio]);

  useInputLayer(
    input,
    {
      onPress(button) {
        if (button === 'a' || button === 'b' || button === 'start') onClose();
        if (button === 'down' && scroller.current) scroller.current.scrollTop += 60;
        if (button === 'up' && scroller.current) scroller.current.scrollTop -= 60;
      },
    },
    LAYER.title
  );

  const t = LOG.totals;
  return (
    <div className="gym-credits" role="dialog" aria-label="Credits">
      <div className="gym-credits-scroll" ref={scroller}>
        <div className="gym-credits-inner">
          <p className="px-font gym-credits-kicker">CHAMPION</p>
          <h2 className="px-font gym-credits-title">SREE</h2>
          <p className="gym-credits-lead">Every session that built this save file.</p>
          <ol className="gym-credits-list">
            {LOG.sessions.map((s) => (
              <li key={s.key}>
                <span className="gym-credits-date">{formatDate(s.start)}</span>
                <span className="gym-credits-what">{s.exercises.map(short).join(' · ')}</span>
                <span className="gym-credits-num">{s.volume ? formatVolume(s.volume) : `${s.reps} REPS`}</span>
              </li>
            ))}
          </ol>
          <dl className="gym-credits-totals">
            <div><dt>SESSIONS</dt><dd>{t.sessions}</dd></div>
            <div><dt>SETS</dt><dd>{t.sets}</dd></div>
            <div><dt>REPS</dt><dd>{t.reps.toLocaleString('en-US')}</dd></div>
            <div><dt>MOVED</dt><dd>{formatVolume(t.volume)}</dd></div>
          </dl>
          <p className="gym-credits-end">Logged in Hevy. Lifted for real. Thanks for playing.</p>
          <p className="gym-tribute">
            David Goggins appears as a fan tribute. Not affiliated with or endorsed by him.
          </p>
          <button type="button" className="gym-press-start px-font" onClick={onClose}>
            BACK TO THE GYM
          </button>
        </div>
      </div>
    </div>
  );
}
