import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

// Updated skill data with normalized image paths
const skillsData = {
  "Languages": [
    { name: "Python", logo: "/skills/python.jpeg" },
    { name: "Java", logo: "/skills/java.png" },
    { name: "C/C++", logo: "/skills/c++.png" },
    { name: "JavaScript", logo: "/skills/javascript.png" },
    { name: "SQL", logo: "/skills/sql.jpeg" },
    { name: "Bash", logo: "/skills/bash.png" },
    { name: "Git", logo: "/skills/git.png" },
  ],
  "Web Development Frameworks": [
    { name: "Flask", logo: "/skills/flask.png" },
    { name: "HTML", logo: "/skills/html.png" },
    { name: "CSS", logo: "/skills/css.png" },
    { name: "PHP", logo: "/skills/php.png" },
    { name: "ReactJS", logo: "/skills/reactjs.jpeg" },
    { name: "NextJS", logo: "/skills/nextjs.png" },
  ],
  "Machine Learning Frameworks": [
    { name: "Numpy", logo: "/skills/Numpy.png" },
    { name: "Pandas", logo: "/skills/pandas.png" },
    { name: "Scikit-learn", logo: "/skills/scikit learn.png" },
    { name: "Matplotlib", logo: "/skills/matplotlib.png" },
  ],
  "Databases": [
    { name: "DynamoDB", logo: "/skills/dynamodb.png" },
    { name: "Aurora", logo: "/skills/aurora.jpeg" },
    { name: "SQLite", logo: "/skills/sqlite.png" },
    { name: "MySQL", logo: "/skills/mysql.png" },
    { name: "Firestore", logo: "/skills/firestore.jpeg" },
  ],
  "Cloud Technologies": [
    { name: "Firebase", logo: "/skills/firebase.png" },
    { name: "Google Cloud Platform", logo: "/skills/gcp.png" },
    { name: "AWS", logo: "/skills/aws.png" },
  ],
  "Design Suite": [
    { name: "Figma", logo: "/skills/figma.png" },
    { name: "AdobeXD", logo: "/skills/adobexd.jpeg" },
  ],
  "Other Technologies": [
    { name: "Linux", logo: "/skills/linux.jpeg" },
    { name: "Android", logo: "/skills/android.png" },
    { name: "Notion", logo: "/skills/notion.png" },
    { name: "Docker", logo: "/skills/docker.png" },
  ],
};

const SkillsPage = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black text-white"
    >
      {/* Hero Banner */}
      <div className="relative h-[25vh] sm:h-[30vh] md:h-[40vh] lg:h-[50vh] w-full bg-gradient-to-r from-red-900 via-red-800 to-black flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-500/20 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-black/50 to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center px-4">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white drop-shadow-lg netflix-font leading-tight"
          >
            Skills Showcase
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-gray-300 mt-2 sm:mt-4 max-w-2xl mx-auto"
          >
            My technical arsenal for building amazing digital experiences
          </motion.p>
        </div>
      </div>

      {/* Netflix-style Skills Rows */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {Object.entries(skillsData).map(([category, skills], categoryIndex) => (
          <motion.div 
            key={category} 
            className="mb-8 sm:mb-10 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
          >
            {/* Category Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-red-500 netflix-font">
                {category}
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm text-gray-400 hidden sm:block">
                  {skills.length} skills
                </span>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Skills Grid/Row */}
            <div className="relative">
              {/* Mobile: Grid Layout */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6 lg:hidden">
                {skills.map((skill, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="netflix-card bg-zinc-900/80 backdrop-blur-sm rounded-lg shadow-lg flex flex-col items-center justify-center p-3 sm:p-4 cursor-pointer transition-all duration-300 border border-gray-800 hover:border-red-500/50"
                    onHoverStart={() => setHoveredIndex(`${category}-${index}`)}
                    onHoverEnd={() => setHoveredIndex(null)}
                  >
                    <div className="relative mb-2 sm:mb-3">
                      <img 
                        src={skill.logo} 
                        alt={skill.name} 
                        className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-700 rounded items-center justify-center">
                        <span className="text-xs sm:text-sm text-gray-400 font-bold">
                          {skill.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-white text-center leading-tight">
                      {skill.name}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Desktop: Netflix-style Row */}
              <div className="hidden lg:block">
                <div className="netflix-row">
                  {skills.map((skill, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.12, zIndex: 10 }}
                      className="netflix-card w-40 md:w-48 lg:w-52 h-40 md:h-48 lg:h-52 bg-zinc-900/90 backdrop-blur-sm rounded-lg shadow-xl flex flex-col items-center justify-center mx-2 cursor-pointer transition-all duration-300 border border-gray-800 hover:border-red-500/50"
                      onHoverStart={() => setHoveredIndex(`${category}-${index}`)}
                      onHoverEnd={() => setHoveredIndex(null)}
                    >
                      <div className="relative mb-3">
                        <img 
                          src={skill.logo} 
                          alt={skill.name} 
                          className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="hidden w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-gray-700 rounded items-center justify-center">
                          <span className="text-lg md:text-xl lg:text-2xl text-gray-400 font-bold">
                            {skill.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm md:text-base lg:text-lg font-semibold text-white text-center mt-2 drop-shadow-lg leading-tight">
                        {skill.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Section */}
      <motion.div 
        className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 bg-gradient-to-t from-black to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="text-center">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-red-500 mb-2 netflix-font">
            Always Learning, Always Growing
          </h3>
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
            Continuously expanding my skill set to deliver cutting-edge solutions and stay ahead in the ever-evolving tech landscape.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SkillsPage;
