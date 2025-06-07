import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, X } from 'lucide-react';

const HERO_TITLE = 'HopeCore';
const HERO_TYPE = 'Film';
const HERO_DESCRIPTION = `HopeCore is a powerful and efficient core banking solution. Watch to learn more about its features and capabilities.`;
const HERO_THUMBNAIL = '/HopeCoreLogo.png'; // Replace with your logo if available

const StalkerPage = () => {
  const videoRef = useRef(null);
  const [isMovieMode, setIsMovieMode] = useState(false);

  const handlePlay = () => {
    setIsMovieMode(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.play();
        videoRef.current.focus();
      }
    }, 300); // Wait for modal animation
  };

  const handleClose = () => {
    setIsMovieMode(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.muted = true;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black"
    >
      {/* Netflix-style Hero Section */}
      <div className="relative w-full h-[70vh] min-h-[400px] flex items-end bg-black overflow-hidden">
        {/* Background Video */}
        <video
          src="/HopeCore.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-top"
          tabIndex="-1"
        />
        {/* Gradient Overlay - lighter at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent z-10 pointer-events-none" />
        {/* Left Overlay Card (hide when movie mode) */}
        {!isMovieMode && (
          <div className="relative z-20 flex flex-col justify-end h-full pl-8 pb-12 max-w-2xl w-full">
            <div className="flex items-center mb-4">
              {/* Thumbnail/Logo */}
              <img
                src={HERO_THUMBNAIL}
                alt="HopeCore Logo"
                className="w-16 h-16 rounded-md shadow-lg mr-4 bg-white/10 object-contain"
                style={{ display: HERO_THUMBNAIL ? 'block' : 'none' }}
              />
              <div className="uppercase tracking-widest text-xs text-red-500 font-bold mr-2">N</div>
              <span className="uppercase tracking-widest text-xs text-white/80 font-semibold">{HERO_TYPE}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-4">
              {HERO_TITLE}
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-6 max-w-xl drop-shadow">
              {HERO_DESCRIPTION}
            </p>
            <div className="flex space-x-4">
              <button
                className="flex items-center px-8 py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition-all text-lg shadow-lg"
                onClick={handlePlay}
              >
                <Play className="w-6 h-6 mr-2" /> Play
              </button>
              <button className="flex items-center px-8 py-3 bg-white/30 text-white font-bold rounded hover:bg-white/50 transition-all text-lg shadow-lg backdrop-blur">
                <Info className="w-6 h-6 mr-2" /> More Info
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Movie Mode Fullscreen Overlay */}
      <AnimatePresence>
        {isMovieMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          >
            <button
              className="absolute top-6 right-8 z-50 p-3 bg-black/60 hover:bg-black/80 rounded-full text-white"
              onClick={handleClose}
              aria-label="Close"
            >
              <X className="w-7 h-7" />
            </button>
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full flex items-center justify-center"
            >
              <video
                ref={videoRef}
                src="/HopeCore.mp4"
                controls
                autoPlay
                className="w-full h-full max-h-[90vh] object-contain bg-black"
                style={{ background: 'black' }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StalkerPage; 