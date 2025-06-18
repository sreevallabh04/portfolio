import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const BlurText = ({
  text,
  delay = 150,
  animateBy = 'words', // 'words' or 'chars'
  direction = 'top', // 'top', 'bottom', 'left', 'right'
  onAnimationComplete,
  className = '',
}) => {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const getDirectionVariants = (direction) => {
    const variants = {
      top: { y: -20, x: 0 },
      bottom: { y: 20, x: 0 },
      left: { x: -20, y: 0 },
      right: { x: 20, y: 0 },
    };
    return variants[direction] || variants.top;
  };

  const splitText = animateBy === 'words' ? text.split(' ') : text.split('');
  const directionVariant = getDirectionVariants(direction);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: delay / 1000,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      filter: 'blur(8px)',
      ...directionVariant,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      x: 0,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const handleComplete = () => {
    if (onAnimationComplete) {
      onAnimationComplete();
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      onAnimationComplete={handleComplete}
    >
      {splitText.map((item, index) => (
        <motion.span
          key={index}
          variants={itemVariants}
          className="inline-block"
          style={{ 
            marginRight: animateBy === 'words' ? '0.25em' : '0',
            marginLeft: animateBy === 'chars' && item === ' ' ? '0.25em' : '0'
          }}
        >
          {item === ' ' && animateBy === 'chars' ? '\u00A0' : item}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default BlurText; 