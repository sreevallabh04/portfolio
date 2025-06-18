import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const DecryptedText = ({
  text,
  speed = 50,
  maxIterations = 15,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()",
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  animateOn = "hover",
  revealDirection = "left",
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [iterations, setIterations] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const getRandomChar = () => {
    return characters[Math.floor(Math.random() * characters.length)];
  };

  const scrambleText = () => {
    if (iterations >= maxIterations) {
      setDisplayText(text);
      setIsAnimating(false);
      return;
    }

    setDisplayText(
      text
        .split("")
        .map((char, index) => {
          if (char === " ") return " ";
          return getRandomChar();
        })
        .join("")
    );

    setIterations(iterations + 1);
  };

  useEffect(() => {
    let interval;
    if (isAnimating) {
      interval = setInterval(scrambleText, speed);
    }
    return () => clearInterval(interval);
  }, [isAnimating, iterations]);

  useEffect(() => {
    if (animateOn === "view" && isInView) {
      setIsAnimating(true);
      setIterations(0);
    }
  }, [isInView, animateOn]);

  const handleHover = () => {
    if (animateOn === "hover") {
      setIsAnimating(true);
      setIterations(0);
    }
  };

  const getRevealVariants = () => {
    const base = {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    };

    switch (revealDirection) {
      case "left":
        return {
          hidden: { ...base.hidden, x: -50 },
          visible: { ...base.visible, x: 0 },
        };
      case "right":
        return {
          hidden: { ...base.hidden, x: 50 },
          visible: { ...base.visible, x: 0 },
        };
      case "center":
        return {
          hidden: { ...base.hidden, scale: 0.8 },
          visible: { ...base.visible, scale: 1 },
        };
      default:
        return base;
    }
  };

  return (
    <motion.div
      ref={ref}
      className={`inline-block ${parentClassName}`}
      onMouseEnter={handleHover}
      variants={getRevealVariants()}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ duration: 0.5 }}
    >
      <span
        className={`font-mono ${className} ${
          isAnimating ? encryptedClassName : ""
        }`}
      >
        {displayText}
      </span>
    </motion.div>
  );
};

export default DecryptedText; 