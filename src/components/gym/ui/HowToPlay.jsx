import React from 'react';
import { LAYER, useInputLayer } from '../engine/input';
import { LOG } from '../gameData';

/** What this page is and how to get around it — short enough to read in one go. */
export default function HowToPlay({ input, audio, onClose, touch }) {
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
    LAYER.menu + 2
  );

  const keys = touch
    ? [
        ['D-PAD', 'Walk. Or just tap where you want to go.'],
        ['A', 'Use a machine, talk, confirm'],
        ['B', 'Back. Hold while walking to run.'],
        ['MENU', 'LiftDex, runs, trainer card, TV, sound'],
      ]
    : [
        ['ARROWS / WASD', 'Walk. Or click where you want to go.'],
        ['Z / SPACE / ENTER', 'Use a machine, talk, confirm'],
        ['X / ESC', 'Back'],
        ['SHIFT', 'Run'],
        ['M', 'Menu'],
      ];

  return (
    <div className="gym-overlay" role="dialog" aria-label="How it works" onClick={onClose}>
      <div className="gym-sheet gym-help px-box" onClick={(e) => e.stopPropagation()}>
        <header className="gym-sheet-head">
          <div>
            <p className="gym-eyebrow">HOW IT WORKS</p>
            <h2 className="gym-sheet-title">A GYM MADE OF A TRAINING LOG</h2>
          </div>
          <button type="button" className="gym-close" onClick={onClose}>
            A · GOT IT
          </button>
        </header>
        <div className="gym-help-body">
          <p>
            Everything here is built from {LOG.totals.sessions} real sessions logged in Hevy and the runs synced
            from Strava. Walk up to any machine and it replays what was lifted on it: the bar loads with that
            day&apos;s real plates, the top set plays out rep by rep, and you can step through every session to
            watch the weight climb.
          </p>
          <dl className="gym-help-keys">
            {keys.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <ul className="gym-help-games">
            <li>
              <strong>★ GOLD STARS</strong>
              <span>Machines where a new all-time best was set in the log&apos;s last week.</span>
            </li>
            <li>
              <strong>TREADMILLS</strong>
              <span>The run club: every Strava run, with route maps and splits.</span>
            </li>
            <li>
              <strong>THE LOBBY TV</strong>
              <span>David Goggins, in his own words, from official uploads on YouTube.</span>
            </li>
          </ul>
          <p className="gym-muted gym-tribute">
            David Goggins appears as a fan tribute. Not affiliated with or endorsed by him.
          </p>
        </div>
      </div>
    </div>
  );
}
