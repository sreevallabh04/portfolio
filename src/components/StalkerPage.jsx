import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Pause, Info, X, Volume2, VolumeX, ExternalLink, Instagram, PenLine } from 'lucide-react';
import { CONTACT } from '@/data/portfolio';
import { fetchPublishedPosts } from '@/lib/posts';

// --- Social icons not covered by lucide ---
const PinterestIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.373 0 0 5.372 0 12 0 17.084 3.163 21.426 7.627 23.174c-.105-.949-.2-2.405.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.562-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.749-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.001 24c6.624 0 11.99-5.373 11.99-12C24 5.372 18.627.001 12.001.001z" />
  </svg>
);

const SpotifyIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const HERO = {
  title: 'HopeCore',
  type: 'Film',
  genres: ['Slick', 'Suspenseful', 'Thriller', 'Conspiracy', 'Trailer'],
  // Leading slash matters: without it the browser resolves this against
  // /browse/stalker/ and the poster 404s.
  poster: '/HopeCore.png',
};

const VIDEO_SRC = 'https://res.cloudinary.com/devtvoup1/video/upload/HopeCore_h2wr6x.mp4';
const FALLBACK_VIDEO_SRC =
  'https://res.cloudinary.com/devtvoup1/video/upload/v1710864000/HopeCore_h2wr6x.mp4';

const SOCIALS = [
  { name: 'GitHub', handle: '@sreevallabh04', href: CONTACT.github, Icon: ExternalLink, accent: '#f0f6fc' },
  { name: 'Instagram', handle: '@sreevallabh', href: 'https://instagram.com/sreevallabh', Icon: Instagram, accent: '#e1306c' },
  { name: 'X', handle: '@sreevallabh', href: 'https://x.com/sreevallabh', Icon: XIcon, accent: '#ffffff' },
  { name: 'Spotify', handle: 'On repeat', href: 'https://open.spotify.com/user/sreevallabh', Icon: SpotifyIcon, accent: '#1db954' },
  { name: 'Pinterest', handle: 'Mood boards', href: 'https://pinterest.com/sreevallabh', Icon: PinterestIcon, accent: '#e60023' },
];

const FACTS = [
  { label: 'Runs on', value: 'Cold brew & lo-fi' },
  { label: 'Currently grinding', value: 'RAG pipelines' },
  { label: 'Gym split', value: 'Push / Pull / Legs' },
  { label: 'Comfort watch', value: 'The Office (again)' },
];

/**
 * Latest writing, matching this page's card idiom rather than /blog's.
 *
 * Posts are fetched at runtime, so anything published from /admin shows up
 * here without a rebuild. Renders nothing at all when there are no posts —
 * an empty "Writing" heading is worse than no section.
 */
const WritingRail = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    let active = true;
    fetchPublishedPosts().then((all) => active && setPosts(all.slice(0, 3)));
    return () => {
      active = false;
    };
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="px-[6%] py-14">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-2xl font-bold text-white">Recently written</h2>
        <Link
          to="/blog"
          className="text-sm text-white/50 transition-colors hover:text-white"
        >
          All posts &rarr;
        </Link>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              to={`/blog/${post.slug}`}
              className="group flex h-full flex-col justify-between gap-6 rounded-xl bg-zinc-900 p-5 ring-1 ring-white/5 transition-all duration-200 hover:-translate-y-1 hover:ring-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <PenLine className="h-7 w-7 text-[#e50914] transition-transform duration-200 group-hover:scale-110" />
              <div>
                <p className="font-semibold leading-snug text-white">{post.title}</p>
                {post.excerpt && (
                  <p className="mt-1.5 line-clamp-2 text-sm text-white/50">{post.excerpt}</p>
                )}
                <p className="mt-2 text-xs text-white/35">
                  {new Date(post.publishDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

const StalkerPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const modalVideoRef = useRef(null);
  const backgroundVideoRef = useRef(null);
  const fullscreenContainerRef = useRef(null);

  const handlePlayPause = () => {
    const video = backgroundVideoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (backgroundVideoRef.current) backgroundVideoRef.current.muted = next;
      if (modalVideoRef.current) modalVideoRef.current.muted = next;
      return next;
    });
  };

  const handleOpenFullscreen = () => {
    setShowModal(true);
  };

  const handleCloseFullscreen = useCallback(() => {
    setShowModal(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    const video = modalVideoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
      video.muted = true;
    }
  }, []);

  // Request fullscreen once the overlay has actually mounted, rather than
  // guessing with a setTimeout against a ref that may still be null.
  useEffect(() => {
    if (!showModal) return;
    const container = fullscreenContainerRef.current;
    const request =
      container?.requestFullscreen ||
      container?.webkitRequestFullscreen ||
      container?.mozRequestFullScreen ||
      container?.msRequestFullscreen;
    if (container && request) {
      // Safari/iOS reject this outside a gesture; the overlay still works.
      Promise.resolve(request.call(container)).catch(() => {});
    }
    const video = modalVideoRef.current;
    if (video) {
      video.muted = false;
      video.play().catch(() => {});
    }
  }, [showModal]);

  // Close the overlay if the visitor leaves fullscreen via Esc or the OS chrome.
  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) setShowModal(false);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Escape closes the overlay even when fullscreen was never granted.
  useEffect(() => {
    if (!showModal) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') handleCloseFullscreen();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showModal, handleCloseFullscreen]);

  // Keep the play/pause button honest about the real element state.
  useEffect(() => {
    const video = backgroundVideoRef.current;
    if (!video) return undefined;
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
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="page-fade min-h-screen bg-black"
    >
      {/* Hero. `min-h` rather than a fixed 85vh so the copy can never overflow
          the section on a short phone viewport. */}
      <section className="relative flex min-h-[34rem] w-full items-end overflow-hidden pt-20 md:min-h-[85vh]">
        {videoFailed ? (
          <img
            src={HERO.poster}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: 'brightness(0.55)' }}
          />
        ) : (
          <video
            ref={backgroundVideoRef}
            src={VIDEO_SRC}
            className="absolute inset-0 h-full w-full object-cover object-center"
            style={{ filter: 'brightness(0.6)' }}
            autoPlay
            loop
            playsInline
            poster={HERO.poster}
            muted={isMuted}
            onError={(e) => {
              // One retry against the versioned URL, then fall back to the
              // poster instead of looping on a dead source.
              if (e.target.src !== FALLBACK_VIDEO_SRC) {
                e.target.src = FALLBACK_VIDEO_SRC;
              } else {
                setVideoFailed(true);
              }
            }}
          />
        )}

        {/* Two scrims. The poster art has its own large lettering baked in, and
            a single light gradient left it legible straight through the title
            block. The lower one anchors the copy, the upper one clears the
            navbar. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/60" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/90 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-20 w-full px-[6%] pb-14"
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="netflix-font text-2xl text-[#e50914]">N</span>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
              {HERO.type}
            </span>
          </div>

          <h1 className="netflix-font mb-3 text-5xl text-white drop-shadow-lg sm:text-7xl">
            {HERO.title}
          </h1>

          <ul className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/80 sm:text-base">
            {HERO.genres.map((genre, i) => (
              <li key={genre} className="flex items-center gap-2">
                {genre}
                {i < HERO.genres.length - 1 && (
                  <span className="text-[#e50914]" aria-hidden="true">
                    &bull;
                  </span>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenFullscreen}
              className="flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-lg font-bold text-black shadow-2xl transition-all hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
            >
              <Play className="h-6 w-6" fill="currentColor" /> Play
            </button>
            <button
              onClick={() => setShowInfo((v) => !v)}
              aria-expanded={showInfo}
              className="flex items-center gap-2 rounded-full border-2 border-white/25 bg-white/20 px-8 py-3.5 text-lg font-bold text-white shadow-2xl backdrop-blur transition-all hover:bg-white/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
            >
              <Info className="h-6 w-6" /> More Info
            </button>

            {/* These controls used to exist in state but were never rendered. */}
            {!videoFailed && (
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={handlePlayPause}
                  aria-label={isPlaying ? 'Pause background video' : 'Play background video'}
                  className="rounded-full border border-white/30 bg-black/40 p-3 text-white backdrop-blur transition-colors hover:bg-black/70"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                <button
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute background video' : 'Mute background video'}
                  className="rounded-full border border-white/30 bg-black/40 p-3 text-white backdrop-blur transition-colors hover:bg-black/70"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
              </div>
            )}
          </div>

          <AnimatePresence>
            {showInfo && (
              <motion.dl
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-3 overflow-hidden text-sm sm:grid-cols-4"
              >
                {FACTS.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-white/50">{fact.label}</dt>
                    <dd className="font-semibold text-white">{fact.value}</dd>
                  </div>
                ))}
              </motion.dl>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Social rail — the section the original page's comment promised but
          never actually rendered. */}
      <section className="px-[6%] py-14">
        <h2 className="mb-6 text-2xl font-bold text-white">Find me elsewhere</h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {SOCIALS.map(({ name, handle, href, Icon, accent }) => (
            <li key={name}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col justify-between gap-6 rounded-xl bg-zinc-900 p-5 ring-1 ring-white/5 transition-all duration-200 hover:-translate-y-1 hover:ring-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <Icon
                  className="h-7 w-7 transition-transform duration-200 group-hover:scale-110"
                  style={{ color: accent }}
                />
                <div>
                  <p className="font-semibold text-white">{name}</p>
                  <p className="text-sm text-white/50">{handle}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <WritingRail />

      {/* Fullscreen player */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
          >
            <div
              ref={fullscreenContainerRef}
              className="relative flex h-full w-full items-center justify-center bg-black"
            >
              <button
                className="absolute left-6 top-6 z-50 rounded-full bg-black/60 p-3 text-white shadow-lg transition-colors hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                onClick={handleCloseFullscreen}
                aria-label="Close player"
              >
                <X className="h-7 w-7" />
              </button>
              <video
                ref={modalVideoRef}
                src={VIDEO_SRC}
                controls
                autoPlay
                playsInline
                className="h-full w-full bg-black object-contain"
                onError={(e) => {
                  if (e.target.src !== FALLBACK_VIDEO_SRC) {
                    e.target.src = FALLBACK_VIDEO_SRC;
                  }
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StalkerPage;
