import React from 'react';
import { LAYER, useInputLayer } from '../engine/input';
import { MINIGAME_INFO } from '../engine/minigames';
import { BADGES_FOR_BOSS } from '../gameData';

const GAMES = [
  ['meter', 'Barbells & Smith'],
  ['grind', 'Machines'],
  ['tempo', 'Cables'],
  ['control', 'Bodyweight'],
  ['alternate', 'Dumbbells'],
];

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

  return (
    <div className="gym-overlay" role="dialog" aria-label="How to play" onClick={onClose}>
      <div className="gym-sheet gym-help px-box" onClick={(e) => e.stopPropagation()}>
        <header className="gym-sheet-head">
          <div>
            <p className="gym-eyebrow">HOW TO PLAY</p>
            <h2 className="gym-sheet-title">BEAT THE LOG</h2>
          </div>
          <button type="button" className="gym-close" onClick={onClose}>
            A · GOT IT
          </button>
        </header>
        <div className="gym-help-body">
          <p>
            Every machine holds the lifts actually logged on it, with the best set on record. Walk up,
            pick a lift, and try to beat it: <strong>+1 rep</strong>, <strong>+1 plate</strong>, or a{' '}
            <strong>true max single</strong>. Break enough PRs in a muscle group to earn its badge;
            {Number.isFinite(BADGES_FOR_BOSS)
              ? ` ${BADGES_FOR_BOSS} badges and the coach on the platform will see you.`
              : ' collect them all.'}
          </p>
          <dl className="gym-help-keys">
            {touch ? (
              <>
                <div><dt>D-PAD</dt><dd>Walk. Or tap anywhere to walk there.</dd></div>
                <div><dt>A</dt><dd>Use, talk, confirm</dd></div>
                <div><dt>B</dt><dd>Back. Hold while walking to run.</dd></div>
                <div><dt>MENU</dt><dd>LiftDex, trainer card, log, sound</dd></div>
              </>
            ) : (
              <>
                <div><dt>ARROWS / WASD</dt><dd>Walk. Or click anything to walk to it.</dd></div>
                <div><dt>Z / SPACE / ENTER</dt><dd>Use, talk, confirm</dd></div>
                <div><dt>X / ESC</dt><dd>Back</dd></div>
                <div><dt>SHIFT</dt><dd>Run</dd></div>
                <div><dt>M</dt><dd>Menu</dd></div>
              </>
            )}
          </dl>
          <p className="gym-eyebrow">EVERY REP IS A MINI-GAME</p>
          <ul className="gym-help-games">
            {GAMES.map(([id, kit]) => (
              <li key={id}>
                <strong>{MINIGAME_INFO[id].name}</strong>
                <span className="gym-muted">{kit}</span>
                <span>{touch ? MINIGAME_INFO[id].touch : MINIGAME_INFO[id].hint}</span>
              </li>
            ))}
          </ul>
          <p className="gym-muted">
            In a set: CHALK widens the target, PRE-WORKOUT slows everything down, SALTS bring stamina
            back. A missed rep costs stamina; run out and the bar wins.
          </p>
        </div>
      </div>
    </div>
  );
}
