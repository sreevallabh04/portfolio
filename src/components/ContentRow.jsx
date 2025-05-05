
import React, { useState } from 'react'; // Import useState
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

const ContentRow = ({ title, items }) => {
  const isProjectsRow = title === "Projects";
  const [hoveredIndex, setHoveredIndex] = useState(null); // State to track hovered item index

  // Function to handle click (opens link in new tab)
  const handleCardClick = (link) => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };


  return (
    <div className="px-[4%] py-6">
      <h2 className="mb-4 text-2xl font-bold text-white">{title}</h2>
      {isProjectsRow ? (
        <Swiper
          modules={[Navigation]}
          spaceBetween={15} // Adjust spacing between slides
          slidesPerView={'auto'} // Show as many slides as fit
          navigation // Enable navigation arrows
          className="!pb-4" // Add padding for navigation arrows if needed
          breakpoints={{
            // when window width is >= 640px
            640: {
              slidesPerView: 2,
              spaceBetween: 15,
            },
            // when window width is >= 768px
            768: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
            // when window width is >= 1024px
            1024: {
              slidesPerView: 4,
              spaceBetween: 20,
            },
            // when window width is >= 1280px
            1280: {
              slidesPerView: 5,
              spaceBetween: 25,
            },
          }}
        >
          {items.map((item, index) => {
            const isHovered = hoveredIndex === index;
            const CardContent = ( // Define card content separately for potential wrapping
              <motion.div
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                // Apply scale on hover state instead of whileHover for better control with overlay
                animate={{ scale: isHovered ? 1.1 : 1, zIndex: isHovered ? 10 : 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={() => handleCardClick(item.link)} // Use new click handler
                className={`netflix-card w-[300px] bg-[#181818] rounded-md overflow-hidden shadow-lg relative ${item.link ? 'cursor-pointer' : ''}`} // Add cursor-pointer only if link exists
              >
                {/* Image container */}
                <div className="relative aspect-video overflow-hidden group"> {/* Added group for image zoom */}
                  {/* Placeholder for image - replace with actual image if available */}
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-red-900 to-gray-900">
                      <span className="text-xl font-bold text-white/80">{item.title.charAt(0)}</span> {/* Keep placeholder */}
                    </div>
                  )}
                   {/* Subtle overlay */}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                 {/* Text content below image */}
                <div className={`p-3 transition-opacity duration-200 ${isHovered ? 'opacity-20' : 'opacity-100'}`}> {/* Fade out original text on hover */}
                    <h3 className="text-base font-semibold text-white truncate mb-1">{item.title}</h3>
                     {/* Keep description concise */}
                    <p className="text-xs text-white/70 line-clamp-2 mb-2">{item.description}</p>
                    {item.techStack && (
                      <p className="text-[11px] font-medium text-red-400 truncate">{item.techStack}</p>
                    )}
                </div>

                {/* Hover Overlay with Full Description */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/95 to-transparent p-3 flex flex-col justify-end" // Darker overlay
                  >
                     <h3 className="text-base font-semibold text-white mb-1">{item.title}</h3>
                     {/* Show full description - ensure it's scrollable */}
                     <p className="text-xs text-white/90 mb-2 max-h-[70px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent pr-1"> {/* Increased max-h slightly, added padding-right for scrollbar */}
                       {item.description} {/* Use the full description */}
                     </p>
                     {item.techStack && (
                       <p className="text-[11px] font-medium text-red-400 truncate">{item.techStack}</p>
                     )}
                     {/* Link Icon - always visible in overlay */}
                     {item.link && (
                        <div className="absolute top-2 right-2 p-1 rounded-full bg-black/50"> {/* Added background for visibility */}
                           <ExternalLink size={16} className="text-white/80" />
                        </div>
                     )}
                  </motion.div>
                )}
              </motion.div>
            );

            // Wrap CardContent in <a> tag only if item.link exists
            return (
              <SwiperSlide key={index} className="!w-auto group">
                {CardContent} {/* Render the card content */}
              </SwiperSlide>
            );
          })}
        </Swiper>
      ) : (
        // Original layout for non-project rows
        <div className="flex space-x-4 overflow-x-auto pb-4"> {/* Simple horizontal scroll for others */}
          {items.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, zIndex: 1 }}
              className="netflix-card min-w-[300px] flex-none"
            >
              <div className="relative aspect-video overflow-hidden rounded-md bg-gray-900">
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-white/70 hover:text-white"
                        aria-label={`External link to ${item.title}`}
                      >
                        <ExternalLink size={20} />
                      </a>
                    )}
                  </div>
                  {item.subtitle && (
                    <h4 className="mb-1 text-sm font-semibold text-white/90">{item.subtitle}</h4>
                  )}
                  {item.period && (
                    <p className="mb-2 text-sm text-white/70">{item.period}</p>
                  )}
                  <p className="text-sm text-white/80 line-clamp-3">{item.description}</p>
                  {item.techStack && (
                    <p className="mt-2 text-xs font-medium text-red-500">{item.techStack}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentRow;
