import React from 'react';

/**
 * Netflix-style wordmark reveal: a single tall "S" that unfolds into
 * SREEVALLABH, the way the Netflix ident opens the N out into NETFLIX.
 *
 * How it works: the word is a flex row of letters. Every letter after the "S"
 * starts at zero width with `overflow: hidden`, then expands to its natural
 * width while un-squashing vertically (scaleY 1.45 -> 1), which reads as a
 * ribbon unfurling. Because the row is centred, the "S" drifts left as the
 * others take up space, so the whole mark grows out of it.
 *
 * All CSS, no animation library: this is the first thing a visitor sees, so it
 * must not depend on a JS animation frame to become visible. The keyframes use
 * `animation-fill-mode: both`, which always settles on the finished wordmark.
 */

const WORD = 'SREEVALLABH';
const SURNAME = 'KAKARALA';

// The "S" holds alone for this long before the rest unfurls.
const HOLD = 0.75;
const LETTER_STAGGER = 0.075;

const LogoUnfold = ({ className = '' }) => {
  const letters = WORD.split('');
  const lastLetterEnd = HOLD + (letters.length - 1) * LETTER_STAGGER + 0.45;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <h1 className="netflix-font relative flex items-center justify-center leading-none text-[#e50914]">
        {/* The animation is decorative; screen readers get the plain name. */}
        <span className="sr-only">Sreevallabh Kakarala</span>

        {letters.map((letter, index) => {
          const isFirst = index === 0;
          return (
            <span
              key={`${letter}-${index}`}
              aria-hidden="true"
              className={isFirst ? 'logo-unfold-lead' : 'logo-unfold-letter'}
              style={
                isFirst
                  ? undefined
                  : { animationDelay: `${HOLD + (index - 1) * LETTER_STAGGER}s` }
              }
            >
              {letter}
            </span>
          );
        })}

        {/* Light sweep across the finished wordmark, as the ident does. */}
        <span
          aria-hidden="true"
          className="logo-unfold-sheen"
          style={{ animationDelay: `${lastLetterEnd}s` }}
        />
      </h1>

      <span
        aria-hidden="true"
        className="logo-unfold-surname netflix-font text-white/70"
        style={{ animationDelay: `${lastLetterEnd + 0.15}s` }}
      >
        {SURNAME}
      </span>
    </div>
  );
};

export default LogoUnfold;
