import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Info, X } from 'lucide-react';

const HERO_TITLE = 'HopeCore';
const HERO_TYPE = 'Film';
const HERO_DESCRIPTION = `Sometimes writes bugs just to fix them and feel productive. Gym rat. Code addict. Meme lord in training.`;
const HERO_THUMBNAIL = '/HopeCore.png'; // Replace with your logo if available

const StalkerPage = () => {
  const videoRef = useRef(null);
  const [isMovieMode, setIsMovieMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  let controlsTimeout = null;

  // Listen for fullscreen changes to update state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handlePlay = () => {
    setIsMovieMode(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.play();
        setIsPlaying(true);
        videoRef.current.focus();
      }
    }, 300);
  };

  const handleClose = () => {
    setIsMovieMode(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.muted = true;
      setIsPlaying(false);
      setIsMuted(true);
    }
  };

  const togglePlay = (e) => {
    e && e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = (e) => {
    e && e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = (e) => {
    e && e.stopPropagation();
    if (!document.fullscreenElement && videoRef.current) {
      videoRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => {
      setShowControls(false);
    }, 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black flex flex-col items-center justify-center"
    >
      {/* Netflix-style Hero Section */}
      <div className="w-full flex flex-col items-center justify-center pt-10 pb-8">
        <motion.div
          className="relative w-full max-w-4xl aspect-video flex items-center justify-center mx-auto"
          style={{ minHeight: 320 }}
        >
          {/* Soft vignette/glow */}
          <div className="absolute inset-0 z-10 pointer-events-none rounded-2xl" style={{
            boxShadow: '0 0 80px 10px rgba(0,0,0,0.7) inset',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.18) 60%, transparent 100%)'
          }} />
          {/* Video Card */}
          <div
            className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 bg-black"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setShowControls(false)}
          >
            <video
              ref={videoRef}
              src="/HopeCore.mp4"
              autoPlay
              muted={isMuted}
              loop
              playsInline
              className="w-full h-full object-cover object-center rounded-2xl"
              tabIndex="-1"
              onClick={togglePlay}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            {/* Glassmorphism Controls */}
            <AnimatePresence>
              {showControls && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6 px-6 py-3 rounded-xl bg-black/40 backdrop-blur-md shadow-lg"
                >
                  <button
                    onClick={togglePlay}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-7 h-7 text-white" /> : <Play className="w-7 h-7 text-white" />}
                  </button>
                  <button
                    onClick={toggleMute}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-7 h-7 text-white" /> : <Volume2 className="w-7 h-7 text-white" />}
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  >
                    {isFullscreen ? <Minimize className="w-7 h-7 text-white" /> : <Maximize className="w-7 h-7 text-white" />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        {/* Title and Description below video */}
        <div className="w-full max-w-4xl mt-8 px-4">
          <div className="flex items-center mb-2">
            <img
              src={HERO_THUMBNAIL}
              alt="HopeCore Logo"
              className="w-12 h-12 rounded-md shadow-lg mr-3 bg-white/10 object-contain"
              style={{ display: HERO_THUMBNAIL ? 'block' : 'none' }}
            />
            <div className="uppercase tracking-widest text-xs text-red-500 font-bold mr-2">N</div>
            <span className="uppercase tracking-widest text-xs text-white/80 font-semibold">{HERO_TYPE}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg mb-2">
            {HERO_TITLE}
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-4 max-w-2xl drop-shadow">
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