import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

const ContentRow = ({ title, items }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div className="px-[4%] py-8">
      <h2 className="mb-4 text-2xl font-bold text-white">{title}</h2>
      
      <Swiper
        modules={[Navigation, FreeMode]}
        spaceBetween={15}
        slidesPerView={'auto'}
        navigation
        freeMode={true}
        className="!px-4 !pb-4" // Add padding for navigation arrows on sides and bottom
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 15 },
          768: { slidesPerView: 3, spaceBetween: 20 },
          1024: { slidesPerView: 4, spaceBetween: 20 },
          1280: { slidesPerView: 5, spaceBetween: 25 },
          1536: { slidesPerView: 6, spaceBetween: 25 }
        }}
      >
        {items.map((item, index) => {
          const isHovered = hoveredIndex === index;

          return (
            <SwiperSlide key={index} className="!w-auto !h-auto group">
              <motion.div
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                animate={{
                  scale: isHovered ? 1.15 : 1,
                  zIndex: isHovered ? 20 : 1,
                  transition: { duration: 0.3 }
                }}
                className="netflix-card w-[300px] bg-[#181818] rounded-md overflow-hidden shadow-xl relative"
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className={`w-full h-full object-cover transition-transform duration-300 ${
                        isHovered ? 'scale-110' : ''
                      }`}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-red-900 to-gray-900">
                      <span className="text-xl font-bold text-white/80">
                        {item.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                {/* Static Info */}
                <div className="p-3">
                  <h3 className="text-base font-semibold text-white truncate mb-1">
                    {item.title}
                  </h3>
                  {(item.subtitle || item.period) && (
                    <div className="flex items-center text-xs text-white/70 truncate mb-1">
                      {item.subtitle && <span>{item.subtitle}</span>}
                      {item.subtitle && item.period && <span className="mx-1">•</span>}
                      {item.period && <span>{item.period}</span>}
                    </div>
                  )}
                  {item.description && (
                    <p className="text-xs text-white/70 line-clamp-2">{item.description}</p>
                  )}
                  {item.techStack && (
                    <p className="text-[11px] font-medium text-red-400 truncate mt-1">
                      {item.techStack}
                    </p>
                  )}
                </div>

                {/* Hover Overlay */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/95 to-transparent p-3 flex flex-col justify-end"
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
                        <a
                          href={item.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-full bg-black/70 backdrop-blur-sm hover:bg-white/20 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Github size={16} className="text-white" />
                        </a>
                      )}
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-full bg-black/70 backdrop-blur-sm hover:bg-white/20 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={16} className="text-white" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default ContentRow;
