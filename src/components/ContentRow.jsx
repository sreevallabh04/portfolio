
import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

const ContentRow = ({ title, items }) => {
  const isProjectsRow = title === "Projects";

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
          {items.map((item, index) => (
            <SwiperSlide key={index} className="!w-auto"> {/* Adjust width automatically */}
              <motion.div
                whileHover={{ scale: 1.05, zIndex: 1 }}
                className="netflix-card w-[300px]" // Fixed width for consistency
              >
                <div className="relative aspect-video overflow-hidden rounded-md bg-gray-900">
                  {/* Placeholder for image - replace with actual image if available */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <span className="text-gray-500">Image</span>
                  </div>
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
            </SwiperSlide>
          ))}
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
