import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Fake kernel boot log that plays once per session before the dev terminal.
 *
 * Purely theatre, but it sets the tone for the rest of the page. Skippable with
 * any key or a click, and skipped outright for prefers-reduced-motion.
 */

const LINES = [
  { text: 'StreamVallabh BIOS v2.7.1 — Copyright (C) Sreevallabh Kakarala', delay: 60 },
  { text: 'Detecting hardware...', delay: 180 },
  { text: '  CPU    : Caffeine-powered neural core @ 4.2 GHz', delay: 70 },
  { text: '  Memory : 16 GB (3 GB reserved for open browser tabs)', delay: 70 },
  { text: '  GPU    : CUDA-capable, currently finetuning something', delay: 70 },
  { text: '', delay: 40 },
  { text: '[  OK  ] Mounted /dev/portfolio', delay: 120, ok: true },
  { text: '[  OK  ] Started vector-store.service (FAISS, ChromaDB)', delay: 110, ok: true },
  { text: '[  OK  ] Loaded retrieval pipeline', delay: 110, ok: true },
  { text: '[  OK  ] Reached target Multi-User System', delay: 110, ok: true },
  { text: '[ WARN ] imposter_syndrome.ko loaded — ignoring', delay: 140, warn: true },
  { text: '[  OK  ] Started DevTerm v2.0.0', delay: 120, ok: true },
  { text: '', delay: 40 },
  { text: 'Welcome. Type "help" once you are in.', delay: 200 },
];

const BootSequence = ({ onComplete }) => {
  const prefersReducedMotion = useReducedMotion();
  const [visibleCount, setVisibleCount] = useState(0);
  const finishedRef = useRef(false);

  // Guarded so the timer finishing and a skip keypress cannot both fire it.
  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (prefersReducedMotion) {
      finish();
      return undefined;
    }

    let cancelled = false;
    let timer;

    const step = (index) => {
      if (cancelled) return;
      if (index >= LINES.length) {
        timer = setTimeout(finish, 500);
        return;
      }
      setVisibleCount(index + 1);
      timer = setTimeout(() => step(index + 1), LINES[index].delay);
    };

    step(0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [prefersReducedMotion, finish]);

  // Any key or click skips ahead.
  useEffect(() => {
    const skip = () => finish();
    window.addEventListener('keydown', skip);
    window.addEventListener('click', skip);
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('click', skip);
    };
  }, [finish]);

  if (prefersReducedMotion) return null;

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden bg-black p-6 font-mono text-[13px] leading-relaxed sm:p-10 sm:text-sm">
      {/* CRT scanlines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, rgba(57,255,20,0.25) 0px, rgba(57,255,20,0.25) 1px, transparent 1px, transparent 3px)',
        }}
      />

      <pre className="relative whitespace-pre-wrap text-[#39ff14]">
        {LINES.slice(0, visibleCount).map((line, index) => (
          <div
            key={index}
            className={line.warn ? 'text-amber-400' : line.ok ? 'text-[#39ff14]' : 'text-white/70'}
          >
            {line.text || ' '}
          </div>
        ))}
        <span className="inline-block h-4 w-2 animate-pulse bg-[#39ff14] align-middle" />
      </pre>

      <p className="absolute bottom-6 right-6 text-xs text-white/25">press any key to skip</p>
    </div>
  );
};

export default BootSequence;
