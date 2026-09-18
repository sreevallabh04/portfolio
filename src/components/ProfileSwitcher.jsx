import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const PROFILES = [
  { id: 'recruiter', name: 'Recruiter', avatar: '/avatars/avatar1.jpeg' },
  { id: 'developer', name: 'Developer', avatar: '/avatars/avatar2.jpeg' },
  { id: 'stalker', name: 'Stalker', avatar: '/avatars/avatar3.jpeg' },
  { id: 'fitness', name: 'Fitness', avatar: '/avatars/avatar4.jpeg' },
];

const ProfileSwitcher = ({ currentProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleProfileSelect = (profileId) => {
    setIsOpen(false);
    if (profileId !== currentProfile) {
      navigate(`/browse/${profileId}`);
    }
  };

  const currentProfileData = PROFILES.find((p) => p.id === currentProfile);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={
          currentProfileData ? `Switch profile, currently ${currentProfileData.name}` : 'Choose a profile'
        }
        className="flex items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        <span className="h-8 w-8 overflow-hidden rounded border-2 border-transparent transition-all duration-300 hover:border-white">
          {currentProfileData ? (
            <img
              src={currentProfileData.avatar}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
            />
          ) : (
            // No profile in the URL (/skills, /contact, /blog). Previously this
            // silently showed the recruiter avatar even for other visitors.
            <span className="flex h-full w-full items-center justify-center bg-zinc-800 text-xs font-bold text-white/60">
              ?
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-white transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
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
            className="absolute right-0 mt-2 w-48 overflow-hidden rounded-lg border border-white/10 bg-black/95 py-2 shadow-xl backdrop-blur-lg"
          >
            {PROFILES.map((profile) => {
              const isCurrent = profile.id === currentProfile;
              return (
                <li key={profile.id} role="none">
                  <button
                    role="menuitem"
                    onClick={() => handleProfileSelect(profile.id)}
                    className={`flex w-full items-center gap-3 px-4 py-2 transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:bg-white/10 ${
                      isCurrent ? 'bg-white/5' : ''
                    }`}
                  >
                    <span className="h-8 w-8 overflow-hidden rounded">
                      <img
                        src={profile.avatar}
                        alt=""
                        aria-hidden="true"
                        className="h-full w-full object-cover"
                      />
                    </span>
                    <span className="text-sm text-white">{profile.name}</span>
                    {isCurrent && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-red-500" />
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileSwitcher;
