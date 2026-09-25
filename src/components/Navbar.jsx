import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import ProfileSwitcher from './ProfileSwitcher';
import sreevallabhLogo from '@/assets/sreevallabh.png';

const VALID_PROFILES = ['recruiter', 'developer', 'stalker', 'fitness'];

// The "Browse" menu, in the spirit of Netflix's genre picker.
const BROWSE_ITEMS = [
  { to: '/browse/recruiter', label: 'Portfolio', hint: 'Experience, research and projects' },
  { to: '/browse/recruiter/projects', label: 'All Projects', hint: 'Filterable project catalogue' },
  { to: '/browse/developer', label: 'PR Quest', hint: 'A gym RPG built from real training logs' },
  { to: '/browse/stalker', label: 'The Trailer', hint: 'HopeCore and every social link' },
  { to: '/browse/fitness', label: '75 Hard', hint: 'The training block, in full' },
  { to: '/skills', label: 'Skills', hint: 'The AI engineering stack' },
  { to: '/blog', label: 'Blog', hint: 'Writing and experiments' },
];

const BrowseMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return undefined;
    const onPointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      className="relative"
      ref={containerRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 text-sm font-medium text-white/70 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:text-white"
      >
        Browse
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            role="menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute left-1/2 top-full w-72 -translate-x-1/2 pt-4"
          >
            <div className="overflow-hidden rounded-lg border border-white/10 bg-black/95 py-2 shadow-2xl backdrop-blur-lg">
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-2.5 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-white/10 bg-black/95"
              />
              {BROWSE_ITEMS.map((item) => (
                <li key={item.to} role="none">
                  <button
                    role="menuitem"
                    onClick={() => {
                      setIsOpen(false);
                      navigate(item.to);
                    }}
                    className="block w-full px-4 py-2.5 text-left transition-colors hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none"
                  >
                    <span className="block text-sm font-medium text-white">{item.label}</span>
                    <span className="mt-0.5 block text-xs text-white/40">{item.hint}</span>
                  </button>
                </li>
              ))}
            </div>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Only a /browse/<profile> path identifies a profile. The old version split
  // the pathname and defaulted to 'recruiter', so /skills and /contact always
  // showed the recruiter avatar regardless of who was actually browsing.
  const profileFromPath = location.pathname.match(/^\/browse\/([a-z]+)/i)?.[1]?.toLowerCase();
  const currentProfile = VALID_PROFILES.includes(profileFromPath) ? profileFromPath : null;
  const isRecruiter = currentProfile === 'recruiter';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // A menu that covers the page should not leave it scrollable underneath.
  useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  const navLinks = [
    { to: '/', label: 'Home' },
    ...(isRecruiter ? [{ to: '/browse/recruiter/projects', label: 'Projects' }] : []),
    { to: '/skills', label: 'Skills' },
    { to: '/blog', label: 'Blog' },
    { to: '/contact', label: 'Contact' },
  ];

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive ? 'text-white' : 'text-white/70 hover:text-white'
    }`;

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-50 h-16 transition-all duration-300 ${
          isScrolled ? 'bg-black/90 backdrop-blur-lg' : 'bg-gradient-to-b from-black/80 to-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center" aria-label="Home">
            <img
              src={sreevallabhLogo}
              alt="Sreevallabh Kakarala"
              className="h-9 w-auto object-contain"
            />
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === '/'} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
            <BrowseMenu />
          </div>

          <div className="flex items-center gap-3">
            <ProfileSwitcher currentProfile={currentProfile} />

            <button
              onClick={() => setIsOpen((v) => !v)}
              className="touch-target rounded-lg text-white transition-colors duration-200 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 md:hidden"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="safe-area-top fixed inset-x-0 top-16 z-40 border-b border-white/10 bg-black/95 backdrop-blur-lg md:hidden"
          >
            <div className="max-h-[calc(100dvh-4rem)] space-y-1 overflow-y-auto p-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `touch-target block rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-red-600/15 text-white'
                        : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              <p className="px-4 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-white/30">
                Browse
              </p>
              {BROWSE_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `block rounded-lg px-4 py-2.5 transition-all duration-200 ${
                      isActive ? 'bg-red-600/15' : 'hover:bg-white/5'
                    }`
                  }
                >
                  <span className="block text-sm font-medium text-white">{item.label}</span>
                  <span className="mt-0.5 block text-xs text-white/40">{item.hint}</span>
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/*
        No spacer element here on purpose. Every page below starts with its own
        full-bleed hero or banner, and the previous 64px spacer pushed them all
        down, leaving a black band above the artwork instead of letting the
        translucent bar sit over it. Text-first pages add their own top padding.
      */}
    </>
  );
};

export default Navbar;
