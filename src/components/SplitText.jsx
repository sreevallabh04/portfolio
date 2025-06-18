import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const SplitText = ({
  text,
  className = '',
  delay = 0,
  duration = 0.5,
  ease = 'power2.out',
  splitType = 'chars',
  from = { opacity: 0, y: 20 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '0px',
  textAlign = 'left',
  onLetterAnimationComplete
}) => {
  const containerRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chars = containerRef.current.querySelectorAll('.char');
    let completedAnimations = 0;

    const animateChars = () => {
      gsap.fromTo(
        chars,
        from,
        {
          ...to,
          duration,
          ease,
          stagger: {
            amount: duration * 1.5,
            from: 'start'
          },
          onComplete: () => {
            completedAnimations++;
            if (completedAnimations === chars.length && onLetterAnimationComplete) {
              onLetterAnimationComplete();
            }
          }
        }
      );
    };

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(animateChars, delay);
            observerRef.current.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [text, delay, duration, ease, from, to, threshold, rootMargin, onLetterAnimationComplete]);

  const splitText = () => {
    if (splitType === 'chars') {
      return text.split('').map((char, index) => (
        <span key={index} className="char inline-block">
          {char === ' ' ? '\u00A0' : char}
        </span>
      ));
    }
    return text.split(' ').map((word, index) => (
      <span key={index} className="char inline-block mr-1">
        {word}
      </span>
    ));
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ textAlign }}
    >
      {splitText()}
    </div>
  );
};

export default SplitText; 