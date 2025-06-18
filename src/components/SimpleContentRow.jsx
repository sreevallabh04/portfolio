import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, ChevronLeft, ChevronRight } from 'lucide-react';

const SimpleContentRow = ({ title, items, isSkills, onProjectClick }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isHoveringRow, setIsHoveringRow] = useState(false);
  const scrollRef = useRef(null);

  const scroll = (scrollOffset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += scrollOffset;
    }
  };

  const handleCardClick = (item, e) => {
    // If the click is on a button or its children, don't navigate
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    
    // If there's an onProjectClick callback and the item has techStack (is a project), use the modal
    if (onProjectClick && item.techStack) {
      onProjectClick(item);
    } else if (item.link) {
      // Otherwise, navigate to the link
      window.open(item.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className="px-[4%] py-8 relative group"
      onMouseEnter={() => setIsHoveringRow(true)}
      onMouseLeave={() => setIsHoveringRow(false)}
    >
      <h2 className="mb-4 text-2xl font-bold text-white">{title}</h2>
      
      {/* Left Gradient Fade */}
      <div className="absolute left-0 top-0 bottom-0 w-[4%] bg-gradient-to-r from-black to-transparent z-[1] pointer-events-none" />
      
      {/* Right Gradient Fade */}
      <div className="absolute right-0 top-0 bottom-0 w-[4%] bg-gradient-to-l from-black to-transparent z-[1] pointer-events-none" />

      {/* Navigation Buttons */}
      <AnimatePresence>
        {isHoveringRow && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-1/2 -translate-y-1/2 left-0 z-10 w-[4%] h-full flex items-center justify-center"
          >
            <button
              onClick={() => scroll(-400)}
              className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-white/20 hover:scale-110"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isHoveringRow && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-1/2 -translate-y-1/2 right-0 z-10 w-[4%] h-full flex items-center justify-center"
          >
            <button
              onClick={() => scroll(400)}
              className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-white/20 hover:scale-110"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollable Content */}
      <div 
        className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide" 
        ref={scrollRef}
      >
        {isSkills ? (
          // Render skills
          items.map((category, categoryIndex) => (
            <div key={categoryIndex} className="flex-shrink-0">
              <h3 className="text-lg font-semibold text-white mb-3">{category.title}</h3>
              <div className="flex space-x-4">
                {category.skills.map((skill, skillIndex) => {
                  const isHovered = hoveredIndex === `${categoryIndex}-${skillIndex}`;
                  return (
                    <motion.div
                      key={skillIndex}
                      onHoverStart={() => setHoveredIndex(`${categoryIndex}-${skillIndex}`)}
                      onHoverEnd={() => setHoveredIndex(null)}
                      animate={{
                        scale: isHovered ? 1.5 : 1,
                        zIndex: isHovered ? 20 : 1,
                        transition: { 
                          duration: 0.3,
                          ease: [0.32, 0.72, 0, 1]
                        }
                      }}
                      className="relative w-[300px] h-[169px] rounded-md overflow-hidden cursor-pointer flex-shrink-0"
                    >
                      {/* Background Image/Logo */}
                      <motion.div
                        className="w-full h-full bg-[#181818] flex items-center justify-center"
                        animate={{
                          scale: isHovered ? 1.1 : 1,
                          transition: { duration: 0.3 }
                        }}
                      >
                        <img
                          src={skill.logo}
                          alt={`${skill.name} Logo`}
                          className="w-24 h-24 object-contain"
                        />
                      </motion.div>

                      {/* Static Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                        <h3 className="text-base font-semibold text-white truncate mb-1">
                          {skill.name}
                        </h3>
                      </div>

                      {/* Hover Overlay */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 flex flex-col justify-end"
                          >
                            <div>
                              <h3 className="text-base font-semibold text-white mb-1">{skill.name}</h3>
                              <p className="text-xs text-white/90">
                                {category.title}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          // Render regular content
          items.map((item, index) => {
            const isHovered = hoveredIndex === index;
            return (
              <motion.div
                key={index}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                onClick={(e) => handleCardClick(item, e)}
                animate={{
                  scale: isHovered ? 1.5 : 1,
                  zIndex: isHovered ? 20 : 1,
                  transition: { 
                    duration: 0.3,
                    ease: [0.32, 0.72, 0, 1]
                  }
                }}
                className="relative w-[300px] h-[169px] rounded-md overflow-hidden cursor-pointer flex-shrink-0"
              >
                {/* Background Image */}
                <motion.img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  animate={{
                    scale: isHovered ? 1.1 : 1,
                    transition: { duration: 0.3 }
                  }}
                />

                {/* Static Info */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-base font-semibold text-white truncate mb-1">
                    {item.title}
                  </h3>
                  {item.techStack && (
                    <p className="text-[11px] font-medium text-red-400 truncate">
                      {item.techStack}
                    </p>
                  )}
                </div>

                {/* Hover Overlay */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 flex flex-col justify-end"
                    >
                      <div>
                        <h3 className="text-base font-semibold text-white mb-1">{item.title}</h3>
                        {(item.subtitle || item.period) && (
                          <div className="flex items-center text-xs text-white/90 mb-1">
                            {item.subtitle && <span>{item.subtitle}</span>}
                            {item.subtitle && item.period && <span className="mx-1">•</span>}
                            {item.period && <span>{item.period}</span>}
                          </div>
                        )}
                        {item.description && (
                          <p className="text-xs text-white/90 mb-2 max-h-[70px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent pr-1">
                            {item.description}
                          </p>
                        )}
                        {item.techStack && (
                          <p className="text-[11px] font-medium text-red-400 truncate">
                            {item.techStack}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute top-2 right-2 flex gap-2">
                        {item.github && (
                          <motion.a
                            href={item.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-full bg-black/70 backdrop-blur-sm hover:bg-white/20 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Github size={16} className="text-white" />
                          </motion.a>
                        )}
                        {item.link && (
                          <motion.a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-full bg-black/70 backdrop-blur-sm hover:bg-white/20 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <ExternalLink size={16} className="text-white" />
                          </motion.a>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SimpleContentRow;