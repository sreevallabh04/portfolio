import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Info, X, Volume2, VolumeX, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Netflix-like font: Bebas Neue (add to index.html)
// <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">

const HERO_TITLE = 'HopeCore';
const HERO_TYPE = 'Film';
const HERO_GENRES = ['Slick', 'Suspenseful', 'Thriller', 'Conspiracy', 'Trailer'];
const HERO_DESCRIPTION = `Sometimes writes bugs just to fix them and feel productive. Gym rat. Code addict. Meme lord in training.`;
const HERO_THUMBNAIL = '/HopeCore.png';
const VIDEO_SRC = 'https://res.cloudinary.com/devtvoup1/video/upload/HopeCore_h2wr6x.mp4';

const StalkerPage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalVideoRef = useRef(null);
  const backgroundVideoRef = useRef(null);
  const fullscreenContainerRef = useRef(null);

  const profiles = [
    { id: 'recruiter', name: 'Recruiter', path: '/recruiter' },
    { id: 'developer', name: 'Developer', path: '/developer' },
    { id: 'stalker', name: 'Stalker', path: '/stalker' },
    { id: 'adventurer', name: 'Adventurer', path: '/adventurer' }
  ];

  // Center play/pause button for background video
  const handlePlayPause = () => {
    if (backgroundVideoRef.current) {
      if (backgroundVideoRef.current.paused) {
        backgroundVideoRef.current.play();
        setIsPlaying(true);
      } else {
        backgroundVideoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Open fullscreen modal and play video
  const handleOpenFullscreen = () => {
    setShowModal(true);
    setTimeout(() => {
      if (fullscreenContainerRef.current) {
        if (fullscreenContainerRef.current.requestFullscreen) {
          fullscreenContainerRef.current.requestFullscreen();
        } else if (fullscreenContainerRef.current.webkitRequestFullscreen) {
          fullscreenContainerRef.current.webkitRequestFullscreen();
        } else if (fullscreenContainerRef.current.mozRequestFullScreen) {
          fullscreenContainerRef.current.mozRequestFullScreen();
        } else if (fullscreenContainerRef.current.msRequestFullscreen) {
          fullscreenContainerRef.current.msRequestFullscreen();
        }
      }
      if (modalVideoRef.current) {
        modalVideoRef.current.muted = false;
        modalVideoRef.current.play();
      }
    }, 100);
  };

  // Close fullscreen modal
  const handleCloseFullscreen = () => {
    setShowModal(false);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
      modalVideoRef.current.currentTime = 0;
      modalVideoRef.current.muted = true;
    }
  };

  // Listen for fullscreen change to close modal if user exits fullscreen
  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setShowModal(false);
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Toggle mute for both background and modal video
  const toggleMute = () => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      if (backgroundVideoRef.current) {
        backgroundVideoRef.current.muted = newMuted;
      }
      if (modalVideoRef.current) {
        modalVideoRef.current.muted = newMuted;
      }
      return newMuted;
    });
  };

  const handleProfileSwitch = (path) => {
    setShowProfileMenu(false);
    navigate(path);
  };

  // Keep isPlaying state in sync with video events
  useEffect(() => {
    const video = backgroundVideoRef.current;
    if (!video) return;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black flex flex-col"
      style={{ minHeight: '100vh' }}
    >
      {/* Profile Menu Button */}
      <button
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        className="absolute top-4 right-4 z-40 p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all"
      >
        <User className="w-6 h-6 text-white" />
      </button>

      {/* Profile Menu Dropdown */}
      <AnimatePresence>
        {showProfileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 right-4 z-40 bg-black/80 backdrop-blur-md rounded-lg shadow-xl border border-white/10 overflow-hidden"
          >
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleProfileSwitch(profile.path)}
                className="w-full px-6 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-md bg-[#e50914]" />
                <span>{profile.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Netflix-style Hero Section */}
      <div className="relative w-full h-[85vh] min-h-[500px] flex items-end justify-start overflow-hidden">
        {/* Video as background */}
        <video
          ref={backgroundVideoRef}
          src={VIDEO_SRC}
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          style={{ filter: 'brightness(0.65)' }}
          autoPlay
          loop
          playsInline
          poster={HERO_THUMBNAIL}
          muted={isMuted}
        />
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none" style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)',
        }} />

        {/* Content overlay */}
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
              onClick={handleOpenFullscreen}
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

      {/* Fullscreen Modal Video Player Overlay */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/100"
            style={{ background: 'black' }}
          >
            <div ref={fullscreenContainerRef} className="relative w-full h-full flex items-center justify-center">
              {/* Close Button */}
              <button
                className="absolute top-6 left-6 z-50 p-3 bg-black/60 hover:bg-black/80 rounded-full text-white shadow-lg"
                onClick={handleCloseFullscreen}
                aria-label="Close"
              >
                <X className="w-8 h-8" />
              </button>
              {/* Video Player with Controls */}
              <video
                ref={modalVideoRef}
                src={VIDEO_SRC}
                controls
                autoPlay
                className="w-full h-full object-contain bg-black"
                style={{ minHeight: 220, background: 'black' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StalkerPage;