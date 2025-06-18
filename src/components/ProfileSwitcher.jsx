import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const profiles = [
  { 
    id: 'recruiter', 
    name: 'Recruiter',
    color: 'bg-red-600',
    avatar: '/avatars/avatar1.jpeg',
  },
  { 
    id: 'developer', 
    name: 'Developer',
    color: 'bg-green-600',
    avatar: '/avatars/avatar2.jpeg'
  },
  { 
    id: 'stalker', 
    name: 'Stalker',
    color: 'bg-red-500',
    avatar: '/avatars/avatar3.jpeg'
  },
  { 
    id: 'client', 
    name: 'Client',
    color: 'bg-blue-600',
    avatar: '/avatars/avatar4.jpeg'
  }
];

const ProfileSwitcher = ({ currentProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Preload images
  useEffect(() => {
    const preloadImages = () => {
      const loadStatus = {};
      profiles.forEach(profile => {
        const img = new Image();
        img.src = profile.avatar;
        img.onload = () => {
          loadStatus[profile.id] = true;
          setImagesLoaded(prev => ({...prev, [profile.id]: true}));
        };
        img.onerror = () => {
          loadStatus[profile.id] = false;
          setImagesLoaded(prev => ({...prev, [profile.id]: false}));
        };
      });
    };
    preloadImages();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileSelect = (profileId) => {
    setIsOpen(false);
    if (profileId !== currentProfile) {
      navigate(`/browse/${profileId}`);
    }
  };

  const currentProfileData = profiles.find(p => p.id === currentProfile);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="w-8 h-8 rounded overflow-hidden border-2 border-transparent hover:border-white transition-all duration-300">
          {currentProfileData && (
            <img
              src={currentProfileData.avatar}
              alt={currentProfileData.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <svg
          className={`w-4 h-4 text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-lg rounded-lg shadow-xl border border-gray-800 overflow-hidden"
          >
            <div className="py-2">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleProfileSelect(profile.id)}
                  className="w-full px-4 py-2 flex items-center space-x-3 hover:bg-white/10 transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded overflow-hidden">
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-white text-sm">{profile.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileSwitcher; 