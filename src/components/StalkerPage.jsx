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

// Meaningless Achievements Component
const MeaninglessAchievements = () => {
  const [duolingoData, setDuolingoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDuolingoData = async () => {
      try {
        const response = await fetch('http://localhost:8080/duolingo-stats');
        const data = await response.json();
        setDuolingoData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching Duolingo data:', err);
        setError(err.message);
        // Fallback data
        setDuolingoData({
          success: false,
          data: {
            achievements: {
              streak_days: 47,
              total_xp: 2850,
              languages_count: 1
            },
            user_info: {
              username: "srivallabh",
              display_name: "Sreevallabh",
              total_xp: 2850,
              lingots: 125,
              gems: 89
            }
          }
        });
        setLoading(false);
      }
    };

    fetchDuolingoData();
  }, []);

  // Netflix-themed Duolingo streak display
  const streakDays = Math.max(duolingoData?.data?.achievements?.streak_days || 111, 111);
  const totalXP = duolingoData?.data?.user_info?.total_xp || (2850 + (streakDays * 20));
  const lingots = duolingoData?.data?.user_info?.lingots || (125 + (streakDays * 2));
  const gems = duolingoData?.data?.user_info?.gems || (89 + (streakDays * 3));

  // Additional achievements
  const fitnessAchievements = [
    { emoji: "💪", value: "50", label: "Push-ups", description: "One set, no sweat" },
    { emoji: "🏃", value: "10", label: "Pull-ups", description: "Gravity? What gravity?" },
    { emoji: "🏏", value: "1", label: "Maiden Over", description: "In a Super Over - Legendary!" }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-white text-lg animate-pulse">Loading meaningless achievements...</div>
      </div>
    );
  }

    // Netflix-style content organization
  const featuredContent = {
    icon: '🦉',
    title: 'DUOLINGO MASTERY',
    subtitle: 'Spanish Learning Journey',
    description: '¿Hablas español? Sí, but mostly just "Dónde está la biblioteca". The owl knows where I live, and I\'m not taking any chances.',
    value: streakDays,
    unit: 'DÍAS CONSECUTIVOS',
    progress: Math.min((streakDays / 365) * 100, 100),
    stats: [
      { label: 'Total XP', value: totalXP.toLocaleString(), color: 'text-green-400' },
      { label: 'Lingots', value: lingots, color: 'text-blue-400' },
      { label: 'Gems', value: gems, color: 'text-purple-400' },
      { label: 'Weeks', value: Math.ceil(streakDays / 7), color: 'text-yellow-400' }
    ],
    profileUrl: 'https://www.duolingo.com/profile/Sreevallabh'
  };

  const contentRows = [
    {
      title: "Physical Achievements",
      items: [
        {
          icon: '🏋️',
          title: 'Bench Press Beast',
          subtitle: '100kg Bench Press',
          description: 'When the bar gets heavy, champions get stronger',
          value: '100kg',
          category: 'STRENGTH',
          image: '🏋️',
          duration: 'Peak Performance'
        },
        {
          icon: '💪',
          title: 'Push-up Master',
          subtitle: '50 Push-ups',
          description: 'One set, no sweat',
          value: '50',
          category: 'ENDURANCE',
          image: '💪',
          duration: 'Personal Record'
        },
        {
          icon: '🏃',
          title: 'Pull-up Champion',
          subtitle: '10 Pull-ups',
          description: 'Gravity? What gravity?',
          value: '10',
          category: 'UPPER BODY',
          image: '🏃',
          duration: 'Consistent'
        }
      ]
    },
    {
      title: "Sports Legends",
      items: [
        {
          icon: '🏏',
          title: 'Cricket Legend',
          subtitle: 'Maiden Over in Super Over',
          description: 'When pressure was highest, delivered the impossible',
          value: '1',
          category: 'LEGENDARY',
          image: '🏏',
          duration: 'Career Defining',
          isLegendary: true
        }
      ]
    }
  ];

  return (
    <div className="relative min-h-screen bg-black">
      {/* Netflix-style Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative h-[80vh] min-h-[600px] flex items-end"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,1) 100%), url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'60\' height=\'60\' viewBox=\'0 0 60 60\'%3E%3Cg fill-rule=\'evenodd\'%3E%3Cg fill=\'%23e50914\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-8 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-2xl"
          >
            {/* Netflix N logo style */}
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-[#e50914] rounded flex items-center justify-center mr-4">
                <span className="text-white font-bold text-2xl">N</span>
              </div>
              <div className="text-gray-300 text-sm font-medium tracking-wider">NETFLIX ORIGINAL</div>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              {featuredContent.title}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-6xl">{featuredContent.icon}</span>
              <div>
                <div className="text-3xl font-bold text-[#e50914] mb-1">
                  {featuredContent.value} {featuredContent.unit}
                </div>
                <div className="text-gray-300 text-lg">
                  {featuredContent.subtitle}
                </div>
              </div>
            </div>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              {featuredContent.description}
            </p>

            {/* Netflix-style buttons */}
            <div className="flex items-center gap-4">
              <motion.a
                href={featuredContent.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-200 transition-colors"
              >
                <span>▶</span> Visit Duolingo Profile
              </motion.a>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 bg-gray-600/70 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-600 transition-colors"
              >
                <span>ℹ</span> More Info
              </motion.button>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-4 gap-4 mt-8">
              {featuredContent.stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                  className="text-center"
                >
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Live status indicator */}
          <div className="absolute top-8 right-8">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm ${
              duolingoData?.success 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                duolingoData?.success ? 'bg-green-400' : 'bg-yellow-400'
              } animate-pulse`}></div>
              {duolingoData?.success ? 'LIVE DATA' : 'AUTO INCREMENT'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Netflix-style Content Rows */}
      <div className="relative z-10 bg-black px-8 pb-20">
        {contentRows.map((row, rowIndex) => (
          <motion.div
            key={rowIndex}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 * rowIndex }}
            className="mb-16"
          >
            {/* Row title */}
            <h2 className="text-2xl font-bold text-white mb-6 px-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              {row.title}
            </h2>

            {/* Horizontal scrolling cards */}
            <div className="relative">
              <div className="flex gap-6 overflow-x-auto pb-4 px-4 scrollbar-hide">
                {row.items.map((item, itemIndex) => (
                  <motion.div
                    key={itemIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * itemIndex }}
                    whileHover={{ scale: 1.05, y: -10 }}
                    className={`flex-shrink-0 w-80 relative overflow-hidden rounded-lg cursor-pointer group ${
                      item.isLegendary 
                        ? 'bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-500/30' 
                        : 'bg-gradient-to-br from-gray-900 to-black border border-gray-800'
                    }`}
                    style={{
                      boxShadow: item.isLegendary 
                        ? '0 10px 30px rgba(255, 193, 7, 0.2)' 
                        : '0 10px 30px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    {/* Card image area */}
                    <div className={`h-48 flex items-center justify-center text-8xl relative overflow-hidden ${
                      item.isLegendary ? 'bg-gradient-to-br from-yellow-600/20 to-orange-600/20' : 'bg-gray-800/50'
                    }`}>
                      {item.image}
                      
                      {/* Legendary badge */}
                      {item.isLegendary && (
                        <div className="absolute top-3 right-3">
                          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                            LEGENDARY
                          </div>
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="text-white text-6xl">▶</div>
                      </div>
                    </div>

                    {/* Card content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-gray-400 text-xs font-medium tracking-wider uppercase">
                          {item.category}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {item.duration}
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2">
                        {item.title}
                      </h3>
                      
                      <p className="text-gray-300 text-sm mb-3">
                        {item.subtitle}
                      </p>
                      
                      <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Achievement value */}
                      <div className="flex items-center justify-between">
                        <div className={`text-3xl font-bold ${
                          item.isLegendary ? 'text-yellow-400' : 'text-[#e50914]'
                        }`} style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                          {item.value}
                        </div>
                        <div className="text-2xl opacity-50">
                          {item.icon}
                        </div>
                      </div>
                    </div>

                    {/* Floating particles for legendary items */}
                    {item.isLegendary && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-30"
                            style={{
                              left: `${Math.random() * 100}%`,
                              top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                              y: [0, -20, 0],
                              opacity: [0.3, 0.8, 0.3],
                              scale: [0.5, 1.5, 0.5]
                            }}
                            transition={{
                              duration: 3 + Math.random() * 2,
                              repeat: Infinity,
                              delay: Math.random() * 2
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Netflix-style Social Media Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-20"
        >
          <h2 className="text-3xl font-bold text-white mb-8 px-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            Follow My Journey
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 px-4">
            {[
              {
                name: 'Instagram',
                handle: '@sreevallabhhhh',
                url: 'http://instagram.com/sreevallabhhhh',
                color: 'from-purple-600 to-pink-600',
                IconComponent: Instagram,
                description: 'Daily life & behind the scenes',
                bgGradient: 'bg-gradient-to-br from-purple-900/30 to-pink-900/30',
                borderColor: 'border-purple-500/30'
              },
              {
                name: 'Pinterest',
                handle: '@sreevallabhhhh',
                url: 'https://in.pinterest.com/sreevallabhhhh/',
                color: 'from-red-600 to-red-500',
                IconComponent: PinterestIcon,
                description: 'Design inspiration & ideas',
                bgGradient: 'bg-gradient-to-br from-red-900/30 to-red-800/30',
                borderColor: 'border-red-500/30'
              },
              {
                name: 'Spotify',
                handle: 'sreevallabh',
                url: 'https://open.spotify.com/user/tjrfoea2ulejbdst77i85imjk?si=ad55866ce6d8460f',
                color: 'from-green-600 to-green-500',
                IconComponent: SpotifyIcon,
                description: 'Coding playlists & vibes',
                bgGradient: 'bg-gradient-to-br from-green-900/30 to-green-800/30',
                borderColor: 'border-green-500/30'
              },
              {
                name: 'VSCO',
                handle: '@sreevallabhhhh',
                url: 'https://vsco.co/sreevallabhhhh',
                color: 'from-gray-600 to-gray-500',
                IconComponent: VSCOIcon,
                description: 'Aesthetic photography',
                bgGradient: 'bg-gradient-to-br from-gray-900/30 to-gray-800/30',
                borderColor: 'border-gray-500/30'
              },
              {
                name: 'X (Twitter)',
                handle: '@Gothamjest',
                url: 'https://x.com/Gothamjest',
                color: 'from-blue-600 to-blue-500',
                IconComponent: XIcon,
                description: 'Tech thoughts & memes',
                bgGradient: 'bg-gradient-to-br from-blue-900/30 to-blue-800/30',
                borderColor: 'border-blue-500/30'
              }
            ].map((social, index) => (
              <motion.a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.95 }}
                className={`relative overflow-hidden rounded-xl ${social.bgGradient} border ${social.borderColor} backdrop-blur-sm p-6 group cursor-pointer transition-all duration-300 hover:shadow-2xl`}
                style={{
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                }}
              >
                {/* Gradient accent line on hover */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${social.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                {/* Content */}
                <div className="text-center relative z-10">
                  <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300 flex justify-center">
                    <social.IconComponent className="w-16 h-16 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">
                    {social.name}
                  </h3>
                  
                  <p className="text-gray-300 text-sm mb-3">
                    {social.handle}
                  </p>
                  
                  <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                    {social.description}
                  </p>

                  {/* Follow button */}
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${social.color} text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                    <span>Follow</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>

                {/* Background pattern */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                  <div className={`absolute inset-0 bg-gradient-to-br ${social.color}`}></div>
                </div>

                {/* Floating particles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`absolute w-1 h-1 rounded-full opacity-20`}
                      style={{
                        left: `${20 + i * 20}%`,
                        top: `${30 + i * 15}%`,
                        background: `linear-gradient(45deg, ${social.color.includes('purple') ? '#8b5cf6' : social.color.includes('red') ? '#ef4444' : social.color.includes('green') ? '#22c55e' : social.color.includes('gray') ? '#6b7280' : '#3b82f6'}, transparent)`
                      }}
                      animate={{
                        y: [0, -15, 0],
                        opacity: [0.2, 0.6, 0.2],
                        scale: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 3 + i,
                        repeat: Infinity,
                        delay: i * 0.5
                      }}
                    />
                  ))}
                </div>
              </motion.a>
            ))}
          </div>

          {/* Call to action */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 2 }}
            className="text-center mt-12 px-4"
          >
            <p className="text-xl text-gray-300 mb-4">
              Let's connect and build something amazing together! 🚀
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <span className="w-12 h-0.5 bg-gradient-to-r from-transparent to-[#e50914]"></span>
              <span className="text-[#e50914] font-bold">FOLLOW FOR MORE</span>
              <span className="w-12 h-0.5 bg-gradient-to-l from-transparent to-[#e50914]"></span>
            </div>
          </motion.div>
        </motion.div>

        {/* Netflix-style footer quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.2 }}
          className="text-center mt-20 px-4"
        >
          <blockquote className="text-2xl text-gray-300 italic mb-4 font-medium">
            "Some achievements matter more in the real world than on LinkedIn."
          </blockquote>
          <div className="text-gray-500 text-lg">
            — Sreevallabh's Philosophy on Meaningful Accomplishments 💯
          </div>
        </motion.div>
      </div>

      {/* CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

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

      {/* Meaningless Achievements Section */}
      <div className="relative z-20 bg-gradient-to-b from-black via-gray-900 to-black py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 text-center"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            Skills/Niches/Achievements That I Have
          </h2>
          <p className="text-xl text-gray-400 text-center mb-12 font-medium">
            That Do Not Matter But They Should
          </p>
          
          <MeaninglessAchievements />
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