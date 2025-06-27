import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Info, X, Volume2, VolumeX, User, Trophy, Flame, Target, Brain, Coffee, Gamepad2, ExternalLink, Instagram, Music, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Social Media Icon Components
const PinterestIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.372 0 12 0 17.084 3.163 21.426 7.627 23.174c-.105-.949-.2-2.405.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.562-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.749-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.001 24c6.624 0 11.99-5.373 11.99-12C24 5.372 18.627.001 12.001.001z"/>
  </svg>
);

const SpotifyIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

const VSCOIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.4c5.302 0 9.6 4.298 9.6 9.6s-4.298 9.6-9.6 9.6S2.4 17.302 2.4 12 6.698 2.4 12 2.4zm0 3.6c-3.315 0-6 2.685-6 6s2.685 6 6 6 6-2.685 6-6-2.685-6-6-6zm0 2.4c1.99 0 3.6 1.61 3.6 3.6s-1.61 3.6-3.6 3.6-3.6-1.61-3.6-3.6S10.01 8.4 12 8.4z"/>
  </svg>
);

const XIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// Netflix-like font: Bebas Neue (add to index.html)
// <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">

const HERO_TITLE = 'HopeCore';
const HERO_TYPE = 'Film';
const HERO_GENRES = ['Slick', 'Suspenseful', 'Thriller', 'Conspiracy', 'Trailer'];
const HERO_DESCRIPTION = `Sometimes writes bugs just to fix them and feel productive. Gym rat. Code addict. Meme lord in training.`;
const HERO_THUMBNAIL = 'HopeCore.png';
const VIDEO_SRC = 'https://res.cloudinary.com/devtvoup1/video/upload/HopeCore_h2wr6x.mp4';
const FALLBACK_VIDEO_SRC = 'https://res.cloudinary.com/devtvoup1/video/upload/v1710864000/HopeCore_h2wr6x.mp4';

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
          crossOrigin="anonymous"
          onError={(e) => {
            console.error('Error loading primary video source:', e);
            if (e.target.src !== FALLBACK_VIDEO_SRC) {
              e.target.src = FALLBACK_VIDEO_SRC;
            }
          }}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
          <source src={FALLBACK_VIDEO_SRC} type="video/mp4" />
        </video>
        
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

      {/* Content flows directly to social media section */}

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
                crossOrigin="anonymous"
                onError={(e) => {
                  console.error('Error loading modal video source:', e);
                  if (e.target.src !== FALLBACK_VIDEO_SRC) {
                    e.target.src = FALLBACK_VIDEO_SRC;
                  }
                }}
              >
                <source src={VIDEO_SRC} type="video/mp4" />
                <source src={FALLBACK_VIDEO_SRC} type="video/mp4" />
              </video>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StalkerPage;