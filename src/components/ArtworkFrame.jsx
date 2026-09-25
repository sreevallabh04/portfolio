import React, { useState } from 'react';

/**
 * Renders project artwork without ever cropping it.
 *
 * The art in this portfolio is a mix of wide photography and square logo
 * lockups. A plain `object-cover` fills the card but slices the top and bottom
 * off every square logo, so the Telangana seal, the WellDoc wordmark and the
 * VIT crest were all showing half cut off.
 *
 * Instead: a blurred, over-scaled copy fills the frame as a backdrop, and the
 * real image sits on top with `object-contain` so all of it stays visible. It
 * is the treatment streaming services use for exactly this reason, and it works
 * for photography too, where the backdrop simply matches the photo.
 *
 * Logos on a white background get a white mat instead of the blur (a blurred
 * white square just reads as grey bars), inset by `matPadding` so captions
 * laid over the frame do not cover the lettering.
 */

// True when all four corners of the image are opaque near-white.
function hasWhiteMatte(img) {
  try {
    const size = 24;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, size, size);
    return [
      [0, 0],
      [size - 1, 0],
      [0, size - 1],
      [size - 1, size - 1],
    ].every(([x, y]) => {
      const [r, g, b, a] = ctx.getImageData(x, y, 1, 1).data;
      return a > 240 && r > 235 && g > 235 && b > 235;
    });
  } catch {
    return false; // cross-origin or decode failure: keep the blurred backdrop
  }
}

const ArtworkFrame = ({ src, title, className = '', rounded = '', matPadding = 'p-4', children }) => {
  const [failed, setFailed] = useState(false);
  const [matte, setMatte] = useState(false);
  const showFallback = !src || failed;
  // Callers that pass `absolute inset-0` must win: Tailwind emits `.relative`
  // after `.absolute`, so adding both left the frame height:auto and every
  // image rendered at its natural size, clipped by the card.
  const positioned = /(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className);

  return (
    <div
      className={`${positioned ? '' : 'relative'} overflow-hidden ${matte ? 'bg-white' : 'bg-zinc-900'} ${rounded} ${className}`}
    >
      {showFallback ? (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 px-4">
          <span className="netflix-font text-center text-lg leading-tight text-white/40">
            {title}
          </span>
        </div>
      ) : (
        <>
          {/* Backdrop: fills the frame, blurred so the crop never reads as one */}
          {!matte && (
            <img
              src={src}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 h-full w-full scale-125 object-cover opacity-45 blur-xl"
            />
          )}
          {/* Foreground: the whole image, uncropped */}
          <img
            src={src}
            alt=""
            aria-hidden="true"
            loading="lazy"
            onLoad={(e) => setMatte(hasWhiteMatte(e.currentTarget))}
            onError={() => setFailed(true)}
            className={`absolute inset-0 h-full w-full object-contain ${matte ? matPadding : ''}`}
          />
        </>
      )}
      {children}
    </div>
  );
};

export default ArtworkFrame;
