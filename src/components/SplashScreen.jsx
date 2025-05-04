
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const SplashScreen = () => {
  useEffect(() => {
    const audio = new Audio('/netflix-intro.mp3');
    audio.play().catch(error => console.log('Audio autoplay failed:', error));
  }, []);

  return (
    <motion.div
      initial={{ backgroundColor: '#000' }}
      animate={{ backgroundColor: '#000' }}
      exit={{ opacity: 0 }}
      className="flex h-screen w-screen items-center justify-center bg-black"
    >
      <motion.div
        initial={{ scale: 2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ duration: 4, ease: "easeOut" }}
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
