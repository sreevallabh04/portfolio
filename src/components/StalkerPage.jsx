import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, X } from 'lucide-react';

// Netflix-like font: Bebas Neue (add to index.html)
// <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">

const HERO_TITLE = 'HopeCore';
const HERO_TYPE = 'Film';
const HERO_GENRES = ['Slick', 'Suspenseful', 'Thriller', 'Conspiracy', 'Trailer'];
const HERO_DESCRIPTION = `Sometimes writes bugs just to fix them and feel productive. Gym rat. Code addict. Meme lord in training.`;
const HERO_THUMBNAIL = '/HopeCore.png';
const VIDEO_SRC = 'https://res.cloudinary.com/devtvoup1/video/upload/HopeCore_h2wr6x.mp4';

const StalkerPage = () => {
  const [showModal, setShowModal] = useState(false);
  const modalVideoRef = useRef(null);

  const handlePlay = () => {
    setShowModal(true);
    setTimeout(() => {
      if (modalVideoRef.current) {
        modalVideoRef.current.muted = false;
        modalVideoRef.current.play();
      }
    }, 200);
  };

  const handleClose = () => {
    setShowModal(false);
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
      modalVideoRef.current.currentTime = 0;
      modalVideoRef.current.muted = true;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black flex flex-col"
      style={{ minHeight: '100vh' }}
    >
      {/* Netflix-style Hero Section */}
      <div className="relative w-full h-[65vh] min-h-[340px] flex items-end justify-start overflow-hidden">
        {/* Video as background */}
        <video
          src={VIDEO_SRC}
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          style={{ filter: 'brightness(0.55) blur(0px)' }}
          autoPlay
          loop
          muted
          playsInline
          poster={HERO_THUMBNAIL}
        />
        {/* Dramatic vignette and gradient overlays */}
        <div className="absolute inset-0 z-10 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.45) 60%, transparent 100%)',
        }} />
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
        {/* Animated Overlayed Content - bottom left on desktop, centered on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-30 w-full px-4 pb-12 flex flex-col items-center sm:items-start justify-end h-full text-center sm:text-left"
        >
          <div className="flex items-center mb-4">
            <img
              src={HERO_THUMBNAIL}
              alt="HopeCore Logo"
              className="w-10 h-10 rounded-md shadow-lg mr-2 bg-white/10 object-contain hidden sm:block"
              style={{ display: HERO_THUMBNAIL ? 'block' : 'none' }}
            />
            <div className="flex items-center">
              <span className="text-2xl font-extrabold text-[#e50914] mr-1" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>N</span>
              <span className="uppercase tracking-widest text-xs text-white/90 font-semibold ml-1">{HERO_TYPE}</span>
            </div>
          </div>
          <h1
            className="text-4xl sm:text-6xl font-extrabold text-white drop-shadow-lg mb-2"
            style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.01em', lineHeight: 1.1 }}
          >
            {HERO_TITLE}
          </h1>
          {/* Genre tags */}
          <div className="flex flex-wrap items-center gap-2 mb-3 text-sm sm:text-base text-white/80 font-medium">
            {HERO_GENRES.map((genre, i) => (
              <span key={genre} className="flex items-center">
                {genre}
                {i < HERO_GENRES.length - 1 && <span className="mx-2 text-[#e50914]">•</span>}
              </span>
            ))}
          </div>
          <p className="text-lg sm:text-2xl text-white/90 mb-7 max-w-2xl drop-shadow font-medium">
            {HERO_DESCRIPTION}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-none sm:w-auto">
            <button
              onClick={handlePlay}
              className="flex items-center justify-center w-full sm:w-auto px-10 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all text-xl shadow-2xl netflix-btn"
              style={{ fontWeight: 800, fontSize: '1.35rem', letterSpacing: '0.01em', boxShadow: '0 4px 24px 0 #e5091440' }}
            >
              <Play className="w-7 h-7 mr-2" /> Play
            </button>
            <button className="flex items-center justify-center w-full sm:w-auto px-10 py-4 bg-white/20 text-white font-bold rounded-full border border-white/40 hover:bg-white/40 transition-all text-xl shadow-2xl backdrop-blur netflix-btn"
              style={{ fontWeight: 800, fontSize: '1.35rem', letterSpacing: '0.01em', borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)' }}
            >
              <Info className="w-7 h-7 mr-2" /> More Info
            </button>
          </div>
        </motion.div>
      </div>

      {/* Modal Video Player Overlay */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-[#e50914] bg-black/80 backdrop-blur-lg"
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 z-50 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white shadow-lg"
                onClick={handleClose}
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
              {/* Video Player with Controls */}
              <video
                ref={modalVideoRef}
                src={VIDEO_SRC}
                controls
                autoPlay
                className="w-full h-full object-contain bg-black rounded-2xl"
                style={{ minHeight: 220, background: 'black' }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StalkerPage;