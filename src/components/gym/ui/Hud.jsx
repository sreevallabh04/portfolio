import React from 'react';
import { LOG, formatVolume, xpForLevel } from '../gameData';
import { playerLevel, totalXp } from '../save';

/** Overworld heads-up display. Everything here is also reachable by keyboard. */
export default function Hud({ save, focusLabel, toast, touch, showHint, onMenu, onCard, onToggleSound }) {
  const level = playerLevel();
  const xp = totalXp();
  const into = xp - xpForLevel(level);
  const span = xpForLevel(level + 1) - xpForLevel(level);

  return (
    <>
      <div className="gym-hud-top">
        <button
          type="button"
          className="gym-hud-chip px-box"
          onClick={onCard}
          aria-label={`Trainer card. Level ${level} from ${formatVolume(LOG.totals.volume)} lifted`}
          title={`${(span - into).toLocaleString('en-US')} kg more lifting to Lv${level + 1}`}
        >
          <span className="gym-hud-name px-font">SREE</span>
          <span className="gym-hud-level px-font">Lv{level}</span>
          <span className="gym-xpbar is-mini" aria-hidden="true">
            <span style={{ width: `${Math.max(3, (into / span) * 100)}%` }} />
          </span>
          <span className="gym-hud-sub">
            {formatVolume(LOG.totals.volume)} · {LOG.totals.sessions} SESSIONS
          </span>
        </button>
        <div className="gym-hud-actions">
          <button
            type="button"
            className="gym-hud-btn px-box"
            onClick={onToggleSound}
            aria-label={save.muted ? 'Unmute' : 'Mute'}
            aria-pressed={!save.muted}
          >
            {save.muted ? (
              <svg viewBox="0 0 12 12" width="14" height="14" shapeRendering="crispEdges" aria-hidden="true">
                <path fill="currentColor" d="M1 4h2v4H1zM3 4h1v4H3zM4 3h1v6H4zM5 2h1v8H5zM8 4h1v1H8zM9 5h1v2H9zM8 7h1v1H8zM10 4h1v1h-1zM10 7h1v1h-1z" />
              </svg>
            ) : (
              <svg viewBox="0 0 12 12" width="14" height="14" shapeRendering="crispEdges" aria-hidden="true">
                <path fill="currentColor" d="M1 4h2v4H1zM3 4h1v4H3zM4 3h1v6H4zM5 2h1v8H5zM7 4h1v4H7zM9 2h1v1H9zM10 3h1v6h-1zM9 9h1v1H9z" />
              </svg>
            )}
          </button>
          <button type="button" className="gym-hud-btn px-box px-font" onClick={onMenu}>
            MENU{!touch && <span className="gym-key">M</span>}
          </button>
        </div>
      </div>

      {toast && (
        <div className="gym-toast px-box px-font" key={toast} role="status">
          {toast}
        </div>
      )}

      {focusLabel && (
        <div className={`gym-prompt ${touch ? 'is-touch' : ''}`} role="status">
          <span className="gym-prompt-key px-font">A</span>
          <span>{focusLabel}</span>
        </div>
      )}

      {showHint && !touch && (
        <div className="gym-hint" role="note">
          <span><b>ARROWS</b> walk</span>
          <span><b>Z</b> use</span>
          <span><b>X</b> back</span>
          <span><b>SHIFT</b> run</span>
          <span><b>M</b> menu</span>
          <span>or click anything</span>
        </div>
      )}
    </>
  );
}
