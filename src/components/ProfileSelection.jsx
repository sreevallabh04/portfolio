import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Using actual avatar images with explicit paths
const profiles = [
  { 
    id: 'recruiter', 
    name: 'Recruiter',
    color: 'bg-red-600',  // Fallback color
    avatar: '/avatars/avatar1.jpeg', 
    content: {
      education: 'Vellore Institute of Technology, Chennai - Integrated MTech in Software Engineering',
      experience: 'Research Intern at VIT Chennai, Freelance Web Developer',
      projects: 'VHTOP - Hostel Management Suite, Sarah - AI Virtual Assistant',
      skills: 'Python, Java, JavaScript, NextJS, Machine Learning'
    }
  },
  { 
    id: 'developer', 
    name: 'Developer',
    color: 'bg-green-600',  // Fallback color
    avatar: '/avatars/avatar2.jpeg'
  },
  { 
    id: 'stalker', 
    name: 'Stalker',
    color: 'bg-red-500',  // Fallback color
    avatar: '/avatars/avatar3.jpeg'
  },
  { 
    id: 'blog', 
    name: 'Blog',
    color: 'bg-blue-600',  // Fallback color
    avatar: '/avatars/avatar4.jpeg',
    content: {
      description: 'Read behind-the-scenes notes on experiments, products, and lessons learned.'
    }
  }
];

const ProfileSelection = ({ onProfileSelect }) => {
  // State to track if images are loaded
  const [imagesLoaded, setImagesLoaded] = useState({});

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
          console.error(`Failed to load image for ${profile.id}`);
        };
      });
    };
    
    preloadImages();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-screen flex-col items-center bg-[#121212] p-4 sm:p-8"
    >
      <h1 className="mt-[30px] mb-10 text-center text-3xl sm:text-4xl md:text-[48px] font-light text-white font-sans">
        Who's Watching?
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-[30px] mt-8 w-full max-w-4xl mx-auto">
        {profiles.map((profile) => (
          <motion.div
            key={profile.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center touch-feedback-bounce"
            onClick={() => onProfileSelect(profile.id)}
          >
            <div className={`w-28 h-28 sm:w-[120px] sm:h-[120px] md:w-[160px] md:h-[160px] cursor-pointer rounded-lg shadow-lg shadow-black/50 hover-glow transition-all duration-300 overflow-hidden touch-target ${!imagesLoaded[profile.id] ? profile.color : ''}`}>
              {/* Display image if loaded, otherwise show colored background */}
              {imagesLoaded[profile.id] !== false && (
                <img 
                  src={profile.avatar}
                  alt={`${profile.name} Avatar`}
                  className="h-full w-full object-cover border-2 border-transparent hover:border-white transition-all duration-300"
                />
              )}
            </div>
            <h2 className="mt-2 sm:mt-[10px] text-center text-base sm:text-lg text-white font-sans">{profile.name}</h2>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProfileSelection;
