import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TrueFocus = ({
  sentence,
  manualMode = false,
  blurAmount = 5,
  borderColor = 'red',
  animationDuration = 2,
  pauseBetweenAnimations = 1,
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const words = sentence.split(' ');

  useEffect(() => {
    if (!manualMode) {
      const interval = setInterval(() => {
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      }, (animationDuration + pauseBetweenAnimations) * 1000);

      return () => clearInterval(interval);
    }
  }, [manualMode, words.length, animationDuration, pauseBetweenAnimations]);

  return (
    <div className="relative flex flex-wrap justify-center gap-2">
      {words.map((word, index) => (
        <motion.div
          key={index}
          className="relative"
          initial={{ filter: `blur(${blurAmount}px)` }}
          animate={{
            filter: currentWordIndex === index ? 'blur(0px)' : `blur(${blurAmount}px)`,
            scale: currentWordIndex === index ? 1.1 : 1,
          }}
          transition={{
            duration: animationDuration,
            ease: 'easeInOut',
          }}
        >
          <span className="text-4xl md:text-6xl font-bold text-white">{word}</span>
          {currentWordIndex === index && (
            <motion.div
              className="absolute -bottom-2 left-0 right-0 h-1"
              style={{ backgroundColor: borderColor }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: animationDuration }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default TrueFocus; 