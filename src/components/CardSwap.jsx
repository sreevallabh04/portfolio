import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Card = ({ children, className = '' }) => (
  <div className={`bg-zinc-900 rounded-lg p-6 shadow-xl ${className}`}>
    {children}
  </div>
);

const CardSwap = ({ 
  children, 
  cardDistance = 60, 
  verticalDistance = 70, 
  delay = 5000,
  pauseOnHover = true 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const cards = React.Children.toArray(children);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, delay);

    return () => clearInterval(interval);
  }, [cards.length, delay, isPaused]);

  return (
    <div 
      className="relative w-full h-full"
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        {cards.map((card, index) => {
          const isActive = index === currentIndex;
          const isNext = index === (currentIndex + 1) % cards.length;
          const isPrev = index === (currentIndex - 1 + cards.length) % cards.length;

          if (!isActive && !isNext && !isPrev) return null;

          return (
            <motion.div
              key={index}
              initial={false}
              animate={{
                x: isActive ? 0 : isNext ? cardDistance : -cardDistance,
                y: isActive ? 0 : verticalDistance,
                scale: isActive ? 1 : 0.8,
                opacity: isActive ? 1 : 0.5,
                zIndex: isActive ? 2 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="absolute w-full"
              style={{
                transformOrigin: "center center",
              }}
            >
              {card}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default CardSwap; 