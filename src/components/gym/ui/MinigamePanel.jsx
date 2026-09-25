import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { LAYER, useInputLayer } from '../engine/input';
import { MINIGAMES } from '../engine/minigames';

/**
 * Hosts one rep of a mini-game: owns the canvas and the frame loop, routes
 * input to it, and reports the grade once.
 */
export default function MinigamePanel({ kind, difficulty, mods, audio, input, width = 240, height = 44, onResult }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const reported = useRef(false);
  const onResultRef = useRef(onResult);
  useLayoutEffect(() => {
    onResultRef.current = onResult;
  });

  useEffect(() => {
    // Development-only: `window.__gymAuto = 'perfect'` resolves every rep, for testing flows.
    if (import.meta.env.DEV && window.__gymAuto) {
      const t = setTimeout(() => onResultRef.current({ grade: window.__gymAuto, note: '' }), 300);
      return () => clearTimeout(t);
    }
    const Game = MINIGAMES[kind] || MINIGAMES.meter;
    const game = new Game({ difficulty, mods, W: width, H: height, audio });
    gameRef.current = game;
    reported.current = false;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    let frame = 0;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const result = game.update(dt);
      game.draw(ctx);
      if (result && !reported.current) {
        reported.current = true;
        onResultRef.current(result);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    game.draw(ctx);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // A new rep is a new mount (keyed by the parent).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useInputLayer(
    input,
    {
      onPress(button, meta) {
        if (meta?.repeat) return;
        gameRef.current?.press?.(button);
      },
      onRelease(button) {
        gameRef.current?.release?.(button);
      },
    },
    LAYER.minigame
  );

  // Taps: the dumbbell game splits the panel into left and right halves.
  const pointerButton = (event) => {
    if (kind !== 'alternate') return 'a';
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientX - rect.left < rect.width / 2 ? 'left' : 'right';
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="gym-canvas gym-minigame"
      style={{ aspectRatio: `${width} / ${height}` }}
      aria-label="Rep mini-game"
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture?.(e.pointerId);
        const button = pointerButton(e);
        e.currentTarget.dataset.button = button;
        gameRef.current?.press?.(button);
      }}
      onPointerUp={(e) => gameRef.current?.release?.(e.currentTarget.dataset.button || 'a')}
      onPointerCancel={(e) => gameRef.current?.release?.(e.currentTarget.dataset.button || 'a')}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}
