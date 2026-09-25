import React, { useEffect, useRef, useState } from 'react';
import { useInputLayer, LAYER } from '../engine/input';
import Menu from './Menu';

const CHARS_PER_TICK = 2;
const TICK_MS = 24;

/**
 * The text box. Pages type out; A (or a tap) finishes the page, then
 * advances. A final page with choices opens a small YES/NO style menu.
 */
export default function Dialog({ dialog, input, audio, onClose }) {
  const { pages, choices, speaker } = dialog;
  const [page, setPage] = useState(0);
  const [shown, setShown] = useState(0);
  const text = pages[page] || '';
  const typing = shown < text.length;
  const last = page >= pages.length - 1;
  const timer = useRef(0);

  useEffect(() => {
    clearInterval(timer.current);
    if (shown >= text.length) return undefined;
    timer.current = setInterval(() => {
      setShown((n) => {
        const next = Math.min(text.length, n + CHARS_PER_TICK);
        if (next % 6 < CHARS_PER_TICK) audio?.play('blip');
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(timer.current);
  }, [text, shown >= text.length, audio]); // eslint-disable-line react-hooks/exhaustive-deps

  const advance = () => {
    if (typing) {
      setShown(text.length);
      return;
    }
    if (!last) {
      audio?.play('blip');
      setPage((p) => p + 1);
      setShown(0);
      return;
    }
    if (!choices) onClose(0);
  };

  useInputLayer(
    input,
    {
      onPress(button) {
        if (button === 'a' || button === 'b') advance();
      },
    },
    LAYER.dialog,
    !(last && !typing && choices)
  );

  return (
    <>
      {/* Tapping anywhere on the scene advances the text, like a handheld. */}
      {!(last && !typing && choices) && (
        <div className="gym-dialog-catch" onClick={advance} aria-hidden="true" />
      )}
      <div className="gym-dialog-wrap" role="dialog" aria-live="polite" aria-label={speaker || 'Message'}>
        {last && !typing && choices && (
          <div className="gym-choices px-box">
            <Menu
              items={choices.map((label, i) => ({
                label,
                key: `${i}-${label}`,
              }))}
              input={input}
              audio={audio}
              priority={LAYER.dialog + 1}
              onSelect={(_, i) => onClose(i)}
              onCancel={() => onClose(choices.length - 1)}
              label="Choose"
            />
          </div>
        )}
        <button type="button" className="gym-dialog px-box" onClick={advance}>
          {speaker && <span className="gym-dialog-speaker">{speaker}</span>}
          <span className="gym-dialog-text">
            {text.slice(0, shown)}
            <span className="gym-ghost" aria-hidden="true">
              {text.slice(shown)}
            </span>
          </span>
          {!typing && !(last && choices) && (
            <span className="gym-dialog-next" aria-hidden="true">
              ▼
            </span>
          )}
        </button>
      </div>
    </>
  );
}
