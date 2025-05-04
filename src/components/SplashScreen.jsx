
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import introSound from '@/assets/nouveau-jingle-netflix.mp3'; // Import the sound file

const SplashScreen = ({ onAudioEnd }) => {
  const audioRef = useRef(null);
  const timeoutRef = useRef(null);
  const transitionTriggeredRef = useRef(false);
  // Removed isAudioReady state

  // Function to trigger the transition reliably
  const triggerTransition = () => {
    if (!transitionTriggeredRef.current) {
      transitionTriggeredRef.current = true;
      console.log('Transition triggered.');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current); // Clear timeout if transition is triggered by audio end
      }
      if (onAudioEnd) {
        onAudioEnd();
      }
    }
  };

  useEffect(() => {
    // Initialize Audio object using the imported path
    audioRef.current = new Audio(introSound);
    const audio = audioRef.current;
    audio.volume = 1; // Set volume
    // Removed muted property

    // Listener for audio end
    const handleAudioFinish = () => {
      console.log('Audio finished playing.');
      triggerTransition();
    };
    audio.addEventListener('ended', handleAudioFinish);

    // Attempt direct playback
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('Audio playback initiated.');
      }).catch(error => {
        console.error('Audio playback failed:', error);
        // Rely on fallback timer if play fails
      });
    } else {
        // In some older environments, play() might not return a promise
        console.log('Audio play() did not return a promise. Relying on events/fallback.');
    }


    // Set fallback timeout
    timeoutRef.current = setTimeout(() => {
      console.log('Fallback timeout triggered transition.');
      triggerTransition();
    }, 5000); // 5 seconds fallback

    // Cleanup
    return () => {
      audio.removeEventListener('ended', handleAudioFinish);
      audio.pause();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onAudioEnd]); // Rerun if onAudioEnd changes (though it shouldn't)

  return (
    <motion.div
      initial={{ backgroundColor: '#000' }}
      animate={{ backgroundColor: '#000' }}
      exit={{ opacity: 0 }}
      className="flex h-screen w-screen items-center justify-center bg-black"
    >
      <motion.div
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 3, ease: "easeOut" }}
        className="netflix-logo w-[80vw] text-center"
      >
        <img
          src="https://storage.googleapis.com/hostinger-horizons-assets-prod/5c57ed43-384d-4353-9118-29cad8a3dc9c/d075d826c58328f5561b91f4e67e2276.png"
          alt="Sreevallabh Kakarala Logo" 
          className="mx-auto w-full"
        />
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
