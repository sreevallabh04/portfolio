import React from 'react';
import { motion } from 'framer-motion';
import { Play, Info } from 'lucide-react';

const HERO_TITLE = 'HopeCore';
const HERO_TYPE = 'Film';
const HERO_DESCRIPTION = `Sometimes writes bugs just to fix them and feel productive. Gym rat. Code addict. Meme lord in training.`;
const HERO_THUMBNAIL = 'HopeCore.png';

const StalkerPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black flex flex-col items-center justify-center"
    >
      {/* Netflix-style Hero Section */}
      <div className="w-full flex flex-col items-center justify-center pt-6 pb-6 sm:pt-10 sm:pb-8">
        <motion.div
          className="relative w-full max-w-md sm:max-w-2xl md:max-w-4xl flex items-center justify-center mx-auto"
          style={{ minHeight: 200 }}
        >
          <div className="absolute inset-0 z-10 pointer-events-none rounded-2xl"
            style={{
              boxShadow: '0 0 80px 10px rgba(0,0,0,0.7) inset',
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.18) 60%, transparent 100%)'
            }} />
          {/* Cloudinary Iframe Video Player */}
          <div
            className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 bg-black"
            style={{ aspectRatio: '16/9', maxWidth: 900, margin: '0 auto' }}
          >
            <video
              src="https://res.cloudinary.com/devtvoup1/video/upload/HopeCore_h2wr6x.mp4"
              controls
              style={{ width: '100%', borderRadius: '1rem', background: 'black' }}
            />
          </div>
        </motion.div>
        {/* Title and Description below video */}
        <div className="w-full max-w-md sm:max-w-2xl md:max-w-4xl mt-6 px-2 sm:px-4">
          <div className="flex items-center mb-2">
            <img
              src={HERO_THUMBNAIL}
              alt="HopeCore Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-md shadow-lg mr-2 sm:mr-3 bg-white/10 object-contain"
              style={{ display: HERO_THUMBNAIL ? 'block' : 'none' }}
            />
            <div className="uppercase tracking-widest text-xs text-red-500 font-bold mr-1 sm:mr-2">N</div>
            <span className="uppercase tracking-widest text-xs text-white/80 font-semibold">{HERO_TYPE}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg mb-2">
            {HERO_TITLE}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-4 max-w-2xl drop-shadow">
            {HERO_DESCRIPTION}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
            <button
              className="flex items-center justify-center w-full sm:w-auto px-4 py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition-all text-base sm:text-lg shadow-lg"
            >
              <Play className="w-5 h-5 mr-2" /> Play
            </button>
            <button className="flex items-center justify-center w-full sm:w-auto px-4 py-3 bg-white/30 text-white font-bold rounded hover:bg-white/50 transition-all text-base sm:text-lg shadow-lg backdrop-blur">
              <Info className="w-5 h-5 mr-2" /> More Info
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StalkerPage;