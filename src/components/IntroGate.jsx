import React from 'react';
import { ArrowRight } from 'lucide-react';
import LogoUnfold from '@/components/LogoUnfold';

/**
 * The cold-open shown before the splash jingle.
 *
 * The click is not decorative: browsers refuse to start audio without a user
 * gesture, so this screen exists to capture one.
 *
 * Design note: this replaced a version that stacked a drifting wall of poster
 * art, four gradient overlays, film grain, a red glow and a specular sweep on
 * top of each other. Every effect was individually plausible and together they
 * read as noise — the artwork in particular was a mix of game covers, logos and
 * a government seal, which is visual clutter rather than a mood. What is left
 * is type, space and a single accent: the wordmark carries the page, and one
 * soft pool of light separates it from the black.
 *
 * All animation is CSS. This screen is the only way into the site, so nothing
 * on it may depend on a JS animation frame running in order to become visible.
 */
const IntroGate = ({ onEnter }) => (
  <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-6 py-16">
    {/* A single, very soft pool of light behind the wordmark. One layer, not
        five — it gives the black some depth without muddying the type. */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse 70% 55% at 50% 42%, rgba(229,9,20,0.10) 0%, transparent 65%)',
      }}
    />

    <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
      <p
        className="rise-in text-[10px] font-medium uppercase tracking-[0.55em] text-white/35 sm:text-[11px]"
        style={{ paddingLeft: '0.55em' }}
      >
        AI Engineer
      </p>

      <div className="mt-7 w-full sm:mt-9">
        <LogoUnfold />
      </div>

      <div
        className="rise-in mt-9 h-px w-full max-w-[13rem] bg-white/15 sm:max-w-xs"
        style={{ animationDelay: '2.4s' }}
      />

      {/* The wrapper carries the entrance animation. `.rise-in` fills `both`,
          so putting it on the button itself would pin its transform and kill
          the hover translate. */}
      <span className="rise-in mt-9" style={{ animationDelay: '2.55s' }}>
        <button
          onClick={onEnter}
          className="group inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/[0.04] py-3.5 pl-7 pr-6 text-sm font-medium tracking-wide text-white backdrop-blur-sm transition-colors duration-300 hover:border-white/40 hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] sm:text-[15px]"
        >
          Enter
          <ArrowRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </button>
      </span>
    </div>

    <p
      className="rise-in absolute inset-x-0 bottom-7 z-10 text-center text-[11px] tracking-wide text-white/25"
      style={{ animationDelay: '2.75s' }}
    >
      Best experienced with sound on
    </p>
  </div>
);

export default IntroGate;
