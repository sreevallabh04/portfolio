import React, { useState } from 'react';
import { LAYER, useInputLayer } from '../engine/input';
import { LOG, formatDate } from '../gameData';
import Menu from './Menu';

const monthYear = (d) => d?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();

export default function Title({ input, audio, hasSave, onNew, onContinue, onHelp, onExit, active = true }) {
  const [open, setOpen] = useState(false);

  useInputLayer(
    input,
    {
      onPress(button) {
        if (!open && (button === 'a' || button === 'start')) {
          audio?.unlock();
          audio?.music('street');
          audio?.play('select');
          setOpen(true);
        }
      },
    },
    LAYER.title,
    active && !open
  );

  const items = [
    ...(hasSave ? [{ label: 'CONTINUE', key: 'continue' }] : []),
    { label: hasSave ? 'START OVER' : 'START', key: 'new' },
    { label: 'HOW IT WORKS', key: 'help' },
    { label: 'LEAVE', key: 'exit' },
  ];

  return (
    <div className="gym-title">
      <div className="gym-title-inner">
        <p className="gym-title-kicker px-font">SREEVALLABH&apos;S GYM</p>
        <h1 className="gym-logo px-font" aria-label="PR Quest">
          <span className="gym-logo-pr">PR</span>
          <span className="gym-logo-quest">QUEST</span>
        </h1>
        <p className="gym-title-sub">
          A walk-around gym built from {LOG.totals.sessions} real workouts logged in Hevy and every run synced
          from Strava, {monthYear(LOG.totals.firstDate)} – {monthYear(LOG.totals.lastDate)}. Every machine replays
          what was lifted on it.
        </p>
        {open ? (
          <div className="gym-title-menu px-box">
            <Menu
              items={items}
              input={input}
              audio={audio}
              priority={LAYER.title + 1}
              active={active}
              onSelect={(item) => {
                if (item.key === 'continue') onContinue();
                else if (item.key === 'new') onNew();
                else if (item.key === 'help') onHelp();
                else onExit();
              }}
              onCancel={() => setOpen(false)}
              label="Title menu"
            />
          </div>
        ) : (
          <button
            type="button"
            className="gym-press-start px-font"
            onClick={() => {
              audio?.unlock();
              audio?.music('street');
              audio?.play('select');
              setOpen(true);
            }}
          >
            PRESS START
          </button>
        )}
        <p className="gym-title-foot">
          Last session logged {formatDate(LOG.totals.lastDate)} · Sound on recommended
        </p>
      </div>
    </div>
  );
}
