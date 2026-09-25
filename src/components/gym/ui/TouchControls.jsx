import React, { useEffect, useRef } from 'react';

const REPEAT_DELAY = 360;
const REPEAT_EVERY = 110;

/**
 * On-screen D-pad and A/B for touch. The pad reads the finger's angle from
 * its centre, so sliding round it changes direction without lifting.
 */
export default function TouchControls({ input, compact = false }) {
  const dir = useRef(null);
  const pressed = useRef(new Set());
  const repeat = useRef({ timeout: 0, interval: 0 });

  const stopRepeat = () => {
    clearTimeout(repeat.current.timeout);
    clearInterval(repeat.current.interval);
  };

  const setDir = (next) => {
    if (dir.current === next) return;
    stopRepeat();
    if (dir.current) input.release(dir.current);
    dir.current = next;
    if (next) {
      input.setSource('touch');
      input.press(next);
      repeat.current.timeout = setTimeout(() => {
        repeat.current.interval = setInterval(() => input.press(next, { repeat: true }), REPEAT_EVERY);
      }, REPEAT_DELAY);
    }
  };

  useEffect(
    () => () => {
      // Opening a menu with A unmounts these controls while the finger is
      // still down; release everything so the next press isn't swallowed.
      stopRepeat();
      if (dir.current) input.release(dir.current);
      pressed.current.forEach((name) => input.release(name));
      pressed.current.clear();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const readPad = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    if (Math.hypot(dx, dy) < rect.width * 0.12) return setDir(null);
    if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 'right' : 'left');
    else setDir(dy > 0 ? 'down' : 'up');
  };

  // A and B share handlers; the button's name travels on data-button.
  const onButtonDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const name = e.currentTarget.dataset.button;
    input.setSource('touch');
    input.stampTouch();
    pressed.current.add(name);
    input.press(name);
  };

  const onButtonUp = (e) => {
    input.stampTouch();
    const name = e.currentTarget.dataset.button;
    pressed.current.delete(name);
    input.release(name);
  };

  const buttonProps = {
    onPointerDown: onButtonDown,
    onPointerUp: onButtonUp,
    onPointerCancel: onButtonUp,
    onLostPointerCapture: onButtonUp,
    onContextMenu: (e) => e.preventDefault(),
  };

  return (
    <div className={`gym-touch ${compact ? 'is-compact' : ''}`} aria-hidden="true">
      <div
        className="gym-dpad"
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture?.(e.pointerId);
          readPad(e);
        }}
        onPointerMove={(e) => {
          if (e.buttons || e.pressure > 0) readPad(e);
        }}
        onPointerUp={() => {
          input.stampTouch();
          setDir(null);
        }}
        onPointerCancel={() => setDir(null)}
        onLostPointerCapture={() => setDir(null)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <span className="gym-dpad-arm is-up" />
        <span className="gym-dpad-arm is-down" />
        <span className="gym-dpad-arm is-left" />
        <span className="gym-dpad-arm is-right" />
        <span className="gym-dpad-hub" />
      </div>
      <div className="gym-ab">
        <button type="button" className="gym-btn is-b" tabIndex={-1} data-button="b" {...buttonProps}>
          B
        </button>
        <button type="button" className="gym-btn is-a" tabIndex={-1} data-button="a" {...buttonProps}>
          A
        </button>
      </div>
    </div>
  );
}
