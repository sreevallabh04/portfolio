
import React from 'react';
import { motion } from 'framer-motion';

const profiles = [
  { 
    id: 'recruiter', 
    name: 'Recruiter', 
    color: 'bg-blue-500',
    avatar: 'https://storage.googleapis.com/hostinger-horizons-assets-prod/5c57ed43-384d-4353-9118-29cad8a3dc9c/e6b44d43001923acd12e797a065a9bdd.jpg'
  },
  { 
    id: 'developer', 
    name: 'Developer', 
    color: 'bg-green-500',
    avatar: 'https://storage.googleapis.com/hostinger-horizons-assets-prod/5c57ed43-384d-4353-9118-29cad8a3dc9c/34f90c63fa7bc9ecc4392e1cdae98381.jpg'
  },
  { 
    id: 'stalker', 
    name: 'Stalker', 
    color: 'bg-red-500',
    avatar: 'https://storage.googleapis.com/hostinger-horizons-assets-prod/5c57ed43-384d-4353-9118-29cad8a3dc9c/838d9ead07c5d60d8dacddc658d336d0.jpg'
  },
  { 
    id: 'adventurer', 
    name: 'Adventurer', 
    color: 'bg-yellow-500',
    avatar: 'https://storage.googleapis.com/hostinger-horizons-assets-prod/5c57ed43-384d-4353-9118-29cad8a3dc9c/210e5d93359cee49f067b5754ccd4309.jpg'
  }
];

const ProfileSelection = ({ onProfileSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-screen flex-col items-center justify-center bg-black p-8"
    >
      <h1 className="mb-16 text-center text-5xl font-light text-white">
        Who's Watching?
      </h1>
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {profiles.map((profile) => (
          <motion.div
            key={profile.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="profile-card"
            onClick={() => onProfileSelect(profile.id)}
          >
            <div className={`profile-avatar ${profile.color}`}>
              <img  
                src={profile.avatar}
                alt={`${profile.name} Avatar`}
                className="h-full w-full rounded-lg object-cover"
              />
            </div>
            <h2 className="profile-name">{profile.name}</h2>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProfileSelection;
