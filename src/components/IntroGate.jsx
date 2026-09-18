import React, { useMemo } from 'react';
import { Play, Volume2 } from 'lucide-react';
import LogoUnfold from '@/components/LogoUnfold';

/**
 * The cold-open shown before the splash jingle.
 *
 * The click is not decorative: browsers refuse to start audio without a user
 * gesture, so this screen exists to capture one. It now looks like the first
 * frame of the experience rather than a bare button on black - a tilted,
 * drifting wall of title art behind a kinetic wordmark.
 *
 * Every animation here is CSS. This screen is the only way into the site, so
 * nothing on it may depend on a JS animation frame actually running in order to
 * become visible; `.rise-in` uses `animation-fill-mode: both`, which always
 * lands on the end state, and honours prefers-reduced-motion.
 */

// Artwork and photography only. Logo lockups read as floating white
// rectangles rather than posters, and the profile avatars are excluded because
// they headline the very next screen. Everything here already ships with the
// site, so the gate adds no new network weight.
const TILE_ART = [
  '/games/Netflix hacker.jpeg',
  '/HopeCore.png',
  '/GitAlong.jpg',
  '/games/code breaker (1).jpeg',
  '/Sarah_AI_agent.jpeg',
  '/games/Terminal racer.jpeg',
  '/telangana2.jpeg',
  '/games/snake.jpeg',
  '/photo1.jpg',
  '/telangana.jpeg',
];

// Each row starts from a different point in the list so the wall never stacks
// the same poster vertically.
const rowTiles = (offset) => [...TILE_ART.slice(offset), ...TILE_ART.slice(0, offset)];

const ROWS = [
  { offset: 0, speed: 78, reverse: false },
  { offset: 3, speed: 104, reverse: true },
  { offset: 6, speed: 88, reverse: false },
  { offset: 8, speed: 116, reverse: true },
  { offset: 1, speed: 94, reverse: false },
];

const TitleRow = ({ offset, speed, reverse }) => {
  // Duplicated so the marquee can loop seamlessly at -50%.
  const tiles = useMemo(() => {
    const base = rowTiles(offset);
    return [...base, ...base];
  }, [offset]);

  return (
    <div
      className="flex w-max gap-3"
      style={{
        animation: `intro-marquee ${speed}s linear infinite`,
        animationDirection: reverse ? 'reverse' : 'normal',
      }}
    >
      {tiles.map((src, index) => (
        <div
          key={`${src}-${index}`}
          className="h-28 w-48 flex-shrink-0 overflow-hidden rounded-md bg-zinc-900 ring-1 ring-white/5"
        >
          <img
            src={src}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};

const IntroGate = ({ onEnter }) => {

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-black px-6">
      {/* Tilted wall of title art. Desaturated and dimmed so the wordmark on
          top stays legible and the artwork reads as one surface. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div
          className="flex w-full flex-col gap-3 opacity-[0.32] saturate-[0.3]"
          style={{
            transform: 'perspective(1400px) rotateX(24deg) scale(1.45)',
            transformOrigin: 'center 40%',
          }}
        >
          {ROWS.map((row) => (
            <TitleRow key={row.offset} {...row} />
          ))}
        </div>
      </div>

      {/* Vignette: pins attention to the centre and kills the hard edges of the
          tile grid at the viewport bounds. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 62% 48% at 50% 48%, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.82) 42%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.9) 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, #000 0%, transparent 22%, transparent 78%, #000 100%)',
        }}
      />
      {/* Red key light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 48% 34% at 50% 46%, rgba(229,9,20,0.22) 0%, transparent 70%)',
        }}
      />
      {/* Film grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* Scrim directly behind the copy. The vignette alone left the artwork's
          own lettering showing through the strapline and sound hint. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 44% 42% at 50% 52%, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 45%, transparent 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <p className="rise-in mb-5 flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.5em] text-white/45 sm:text-xs">
          <span className="netflix-font text-base text-[#e50914]">N</span>
          A Portfolio Original
        </p>

        <LogoUnfold />

        <div
          className="rise-in mt-6 h-[2px] w-44 bg-gradient-to-r from-transparent via-[#e50914] to-transparent sm:w-72"
          style={{ animationDelay: '2.4s', boxShadow: '0 0 24px rgba(229,9,20,0.8)' }}
        />

        <p
          className="rise-in mt-6 max-w-md text-sm leading-relaxed text-white/60 sm:text-base"
          style={{ animationDelay: '2.55s' }}
        >
          Four profiles. One AI engineer. Pick how you want to watch the story.
        </p>

        {/* The wrapper carries the entrance animation. `.rise-in` fills `both`,
            so putting it on the button itself would pin its transform and kill
            the hover scale. */}
        <span className="rise-in mt-9 inline-block" style={{ animationDelay: '2.7s' }}>
          <button
            onClick={onEnter}
            className="group inline-flex items-center gap-3 rounded-full bg-white px-9 py-4 text-base font-bold text-black shadow-[0_8px_60px_-10px_rgba(229,9,20,0.85)] transition-transform duration-200 hover:scale-105 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/60 sm:text-lg"
          >
            <Play
              size={22}
              fill="currentColor"
              className="transition-transform duration-200 group-hover:scale-110"
            />
            Start watching
          </button>
        </span>

        <p
          className="rise-in mt-6 flex items-center gap-2 text-xs text-white/35"
          style={{ animationDelay: '2.9s' }}
        >
          <Volume2 size={14} />
          Best with sound on
        </p>
      </div>
    </div>
  );
};

export default IntroGate;
