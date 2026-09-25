/**
 * One input model for keyboard, touch buttons and gamepads. Buttons are
 * 'up' 'down' 'left' 'right' 'a' 'b' 'start'. Screens register layers with a
 * priority; only the top layer receives presses, which is how a dialog box
 * swallows the A button instead of the world behind it.
 */
import { useEffect, useLayoutEffect, useRef } from 'react';

const KEYS = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  KeyZ: 'a', Space: 'a', Enter: 'a', KeyJ: 'a', NumpadEnter: 'a',
  KeyX: 'b', Escape: 'b', Backspace: 'b', KeyK: 'b',
  ShiftLeft: 'run', ShiftRight: 'run',
  KeyM: 'start', KeyP: 'start',
};
const DIRECTIONS = ['up', 'down', 'left', 'right'];

export function createInput() {
  const held = new Set();
  const order = [];
  const layers = [];
  let pads = {};
  let padFrame = 0;
  let attached = false;
  let lastSource = 'keyboard';
  const sourceListeners = new Set();

  const top = () => layers[layers.length - 1] || null;

  const setSource = (source) => {
    if (source === lastSource) return;
    lastSource = source;
    sourceListeners.forEach((fn) => fn(source));
  };

  function press(button, { repeat = false } = {}) {
    if (!repeat) {
      if (held.has(button)) return;
      held.add(button);
      if (DIRECTIONS.includes(button)) order.push(button);
    }
    top()?.onPress?.(button, { repeat });
  }

  function release(button) {
    if (!held.has(button)) return;
    held.delete(button);
    const i = order.lastIndexOf(button);
    if (i >= 0) order.splice(i, 1);
    top()?.onRelease?.(button);
  }

  function releaseAll() {
    [...held].forEach(release);
  }

  const typing = (event) => {
    const el = event.target;
    return el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
  };

  function onKeyDown(event) {
    if (typing(event) || event.metaKey || event.ctrlKey || event.altKey) return;
    const button = KEYS[event.code] || (event.key === ' ' ? 'a' : null);
    if (!button) return;
    event.preventDefault();
    setSource('keyboard');
    if (event.repeat) {
      if (DIRECTIONS.includes(button)) press(button, { repeat: true });
      return;
    }
    press(button);
  }

  function onKeyUp(event) {
    const button = KEYS[event.code] || (event.key === ' ' ? 'a' : null);
    if (button) release(button);
  }

  function pollPads() {
    padFrame = requestAnimationFrame(pollPads);
    const list = navigator.getGamepads ? navigator.getGamepads() : [];
    const now = {};
    for (const pad of list) {
      if (!pad) continue;
      const b = (i) => pad.buttons[i]?.pressed;
      const ax = pad.axes[0] || 0;
      const ay = pad.axes[1] || 0;
      if (b(12) || ay < -0.5) now.up = true;
      if (b(13) || ay > 0.5) now.down = true;
      if (b(14) || ax < -0.5) now.left = true;
      if (b(15) || ax > 0.5) now.right = true;
      if (b(0)) now.a = true;
      if (b(1)) now.b = true;
      if (b(9) || b(8)) now.start = true;
    }
    for (const button of Object.keys(now)) {
      if (!pads[button]) {
        setSource('gamepad');
        press(button);
      }
    }
    for (const button of Object.keys(pads)) if (!now[button]) release(button);
    pads = now;
  }

  function onPadConnect() {
    if (!padFrame) pollPads();
  }

  // When an on-screen button opens a menu, the browser still fires a click
  // for that same tap at the finger's position, which lands on whatever the
  // menu just put there. The root swallows clicks this soon after a pad tap.
  let touchStamp = 0;

  return {
    held,
    stampTouch() {
      touchStamp = performance.now();
    },
    isGhostClick: () => performance.now() - touchStamp < 450,
    direction: () => order[order.length - 1] || null,
    press,
    release,
    releaseAll,
    tap(button) {
      press(button);
      release(button);
    },
    get source() {
      return lastSource;
    },
    setSource,
    onSource(fn) {
      sourceListeners.add(fn);
      return () => sourceListeners.delete(fn);
    },
    pushLayer(layer, priority = 0) {
      const entry = { ...layer, priority };
      let i = layers.length;
      while (i > 0 && layers[i - 1].priority > priority) i--;
      layers.splice(i, 0, entry);
      return () => {
        const index = layers.indexOf(entry);
        if (index >= 0) layers.splice(index, 1);
      };
    },
    isTop: (layer) => top() === layer,
    topPriority: () => top()?.priority ?? -1,
    attach() {
      if (attached) return;
      attached = true;
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      window.addEventListener('blur', releaseAll);
      window.addEventListener('gamepadconnected', onPadConnect);
      if (navigator.getGamepads && [...navigator.getGamepads()].some(Boolean)) onPadConnect();
    },
    detach() {
      attached = false;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', releaseAll);
      window.removeEventListener('gamepadconnected', onPadConnect);
      cancelAnimationFrame(padFrame);
      padFrame = 0;
      layers.length = 0;
      releaseAll();
    },
  };
}

/**
 * Registers a handler object { onPress, onRelease } while `enabled`. The
 * latest handler is always called, without re-registering on every render.
 */
export function useInputLayer(input, handler, priority, enabled = true) {
  const ref = useRef(handler);
  useLayoutEffect(() => {
    ref.current = handler;
  });
  useEffect(() => {
    if (!input || !enabled) return undefined;
    return input.pushLayer(
      {
        onPress: (button, meta) => ref.current?.onPress?.(button, meta),
        onRelease: (button) => ref.current?.onRelease?.(button),
      },
      priority
    );
  }, [input, priority, enabled]);
}

export const LAYER = { world: 0, hud: 5, menu: 10, sheet: 15, dialog: 20, battle: 30, minigame: 40, title: 50 };
