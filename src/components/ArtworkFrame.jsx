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
 */
const ArtworkFrame = ({ src, title, className = '', rounded = '', children }) => {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  return (
    <div className={`relative overflow-hidden bg-zinc-900 ${rounded} ${className}`}>
      {showFallback ? (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 px-4">
          <span className="netflix-font text-center text-lg leading-tight text-white/40">
            {title}
          </span>
        </div>
      ) : (
        <>
          {/* Backdrop: fills the frame, blurred so the crop never reads as one */}
          <img
            src={src}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full scale-125 object-cover opacity-45 blur-xl"
          />
          {/* Foreground: the whole image, uncropped */}
          <img
            src={src}
            alt=""
            aria-hidden="true"
            loading="lazy"
            onError={() => setFailed(true)}
            className="relative h-full w-full object-contain"
          />
        </>
      )}
      {children}
    </div>
  );
};

export default ArtworkFrame;
