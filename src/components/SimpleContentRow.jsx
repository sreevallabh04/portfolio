import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, ChevronLeft, ChevronRight } from 'lucide-react';
import ArtworkFrame from '@/components/ArtworkFrame';

const CARD_STEP = 320; // one card + gap

/**
 * Netflix-style horizontal rail.
 *
 * The original version scaled cards to 1.5 inside an `overflow-x-auto` track,
 * which clipped the enlarged card on every edge (a scroll container cannot
 * paint outside its own box). Here the track keeps the scrolling, the cards
 * lift with a modest scale plus shadow, and cards near the ends get a
 * transform-origin that grows them inwards so nothing is cut off.
 */
const SimpleContentRow = ({ title, items, isSkills, onProjectClick }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isHoveringRow, setIsHoveringRow] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [failedImages, setFailedImages] = useState({});
  const scrollRef = useRef(null);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return undefined;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState, items]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    // Advance by whole cards, capped to what actually fits on screen.
    const visibleCards = Math.max(1, Math.floor(el.clientWidth / CARD_STEP));
    el.scrollBy({ left: direction * visibleCards * CARD_STEP, behavior: 'smooth' });
  };

  const handleImageError = (key) => {
    setFailedImages((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  };

  const handleCardClick = (item, e) => {
    // Let the overlay's own links handle their clicks.
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }

    if (onProjectClick && (item.techStack || item.description)) {
      onProjectClick(item);
    } else if (item.link) {
      window.open(item.link, '_blank', 'noopener,noreferrer');
    }
  };

  // Cards at the very start/end grow inwards so the scale never spills out of
  // the viewport and gets clipped by the page edge.
  const originFor = (index, total) => {
    if (index === 0) return 'left center';
    if (index === total - 1) return 'right center';
    return 'center center';
  };

  const cardClass =
    'relative w-[78vw] max-w-[300px] sm:w-[300px] aspect-video rounded-md overflow-hidden ' +
    'cursor-pointer flex-shrink-0 bg-zinc-900 ring-1 ring-white/5 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500';

  const renderArrow = (direction) => {
    const enabled = direction < 0 ? canScrollLeft : canScrollRight;
    if (!enabled) return null;
    const Icon = direction < 0 ? ChevronLeft : ChevronRight;
    return (
      <AnimatePresence>
        {isHoveringRow && (
          <motion.button
            initial={{ opacity: 0, x: direction * 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * 12 }}
            onClick={() => scroll(direction)}
            aria-label={direction < 0 ? `Scroll ${title} left` : `Scroll ${title} right`}
            className={`absolute top-1/2 z-20 hidden h-24 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-black/60 backdrop-blur-sm transition-colors hover:bg-black/80 md:flex ${
              direction < 0 ? 'left-0' : 'right-0'
            }`}
          >
            <Icon size={28} className="text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    );
  };

  return (
    <section
      className="relative py-6"
      onMouseEnter={() => setIsHoveringRow(true)}
      onMouseLeave={() => {
        setIsHoveringRow(false);
        setHoveredIndex(null);
      }}
    >
      <h2 className="mb-4 text-xl font-bold text-white sm:text-2xl">{title}</h2>

      <div className="relative">
        {renderArrow(-1)}
        {renderArrow(1)}

        {/* Scroll track. Vertical padding leaves room for the hover lift so the
            enlarged card is never clipped by the track's own bounds. */}
        <div
          ref={scrollRef}
          className="scrollbar-hide touch-scroll-x flex gap-4 overflow-x-auto scroll-smooth px-1 py-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isSkills
            ? items.map((category, categoryIndex) => (
                <div key={category.title || categoryIndex} className="flex-shrink-0">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/60">
                    {category.title}
                  </h3>
                  <div className="flex gap-3">
                    {category.skills.map((skill, skillIndex) => {
                      const key = `${categoryIndex}-${skillIndex}`;
                      return (
                        <motion.div
                          key={skill.name}
                          whileHover={{ y: -6, scale: 1.06 }}
                          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                          className="group flex h-28 w-28 flex-shrink-0 flex-col items-center justify-center gap-2 rounded-xl bg-[#181818] ring-1 ring-white/5 transition-colors hover:ring-red-500/40 sm:h-32 sm:w-32"
                          title={`${skill.name} — ${category.title}`}
                        >
                          {!skill.logo || failedImages[key] ? (
                            <span className="text-2xl font-bold text-white/30">
                              {skill.name.charAt(0)}
                            </span>
                          ) : (
                            <img
                              src={encodeURI(skill.logo)}
                              alt=""
                              aria-hidden="true"
                              className="h-12 w-12 object-contain sm:h-14 sm:w-14"
                              loading="lazy"
                              onError={() => handleImageError(key)}
                            />
                          )}
                          <span className="px-2 text-center text-[11px] font-medium text-white/80">
                            {skill.name}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))
            : items.map((item, index) => {
                const isHovered = hoveredIndex === index;
                return (
                  <motion.div
                    key={item.title || index}
                    role="button"
                    tabIndex={0}
                    aria-label={item.title}
                    onHoverStart={() => setHoveredIndex(index)}
                    onHoverEnd={() => setHoveredIndex(null)}
                    onFocus={() => setHoveredIndex(index)}
                    onBlur={() => setHoveredIndex(null)}
                    onClick={(e) => handleCardClick(item, e)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCardClick(item, e);
                      }
                    }}
                    animate={{
                      scale: isHovered ? 1.08 : 1,
                      y: isHovered ? -8 : 0,
                      zIndex: isHovered ? 20 : 1,
                    }}
                    transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                    style={{
                      transformOrigin: originFor(index, items.length),
                      boxShadow: isHovered ? '0 24px 48px -12px rgba(0,0,0,0.9)' : 'none',
                    }}
                    className={cardClass}
                  >
                    <ArtworkFrame
                      src={item.imageUrl}
                      title={item.title}
                      className="absolute inset-0"
                    />

                    {/* Resting caption */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                      <h3 className="truncate text-sm font-semibold text-white sm:text-base">
                        {item.title}
                      </h3>
                      {item.period && (
                        <p className="truncate text-[11px] text-white/60">{item.period}</p>
                      )}
                    </div>

                    {/* Hover detail */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/75 to-black/30 p-3"
                        >
                          <div className="scrollbar-hide max-h-full overflow-y-auto pr-1">
                            <h3 className="mb-1 text-sm font-semibold text-white">{item.title}</h3>
                            {(item.subtitle || item.period) && (
                              <div className="mb-1 flex flex-wrap items-center gap-1 text-[11px] text-white/70">
                                {item.subtitle && <span>{item.subtitle}</span>}
                                {item.subtitle && item.period && <span aria-hidden="true">•</span>}
                                {item.period && <span>{item.period}</span>}
                              </div>
                            )}
                            {item.description && (
                              <p className="mb-2 line-clamp-3 text-[11px] leading-relaxed text-white/80">
                                {item.description.split('\n')[0]}
                              </p>
                            )}
                            {item.techStack && (
                              <p className="truncate text-[11px] font-medium text-red-400">
                                {item.techStack}
                              </p>
                            )}
                          </div>

                          <div className="absolute right-2 top-2 flex gap-2">
                            {item.github && (
                              <motion.a
                                href={item.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${item.title} on GitHub`}
                                className="rounded-full bg-black/70 p-1.5 backdrop-blur-sm transition-colors hover:bg-white/20"
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
                                aria-label={`Open ${item.title}`}
                                className="rounded-full bg-black/70 p-1.5 backdrop-blur-sm transition-colors hover:bg-white/20"
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
              })}
        </div>
      </div>
    </section>
  );
};

export default SimpleContentRow;
