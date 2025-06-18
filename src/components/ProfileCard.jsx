import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ProfileCard = ({
  name,
  title,
  handle,
  status,
  contactText,
  avatarUrl,
  showUserInfo = true,
  enableTilt = true,
  onContactClick,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);

  const handleMouseMove = (e) => {
    if (!enableTilt) return;
    
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const tiltX = ((y - centerY) / centerY) * 10;
    const tiltY = ((centerX - x) / centerX) * 10;
    
    setTiltX(tiltX);
    setTiltY(tiltY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTiltX(0);
    setTiltY(0);
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-lg bg-zinc-900 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      animate={{
        rotateX: tiltX,
        rotateY: tiltY,
        scale: isHovered ? 1.05 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative p-6 h-full flex flex-col justify-end">
        {showUserInfo && (
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">{name}</h3>
            <p className="text-gray-300">{title}</p>
            <p className="text-red-500 font-semibold">{handle}</p>
            <p className="text-sm text-gray-400">{status}</p>
          </div>
        )}

        <motion.button
          className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          onClick={onContactClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {contactText}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProfileCard; 