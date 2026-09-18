import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Code, Folder, ExternalLink, Github, BookOpen } from 'lucide-react';
import ArtworkFrame from '@/components/ArtworkFrame';

/**
 * Detail sheet shared by the dashboard rails and the projects grid.
 *
 * Replaces two near-identical copies that had drifted: both hard-coded
 * "3 Months" as the duration of every entry (including a secondary school and
 * an ongoing internship) and labelled everything "#1 in Projects Today". The
 * copy here is derived from the item instead.
 *
 * Also handles the things the originals missed: Escape closes it, the page
 * behind it stops scrolling while it is open, focus moves into the dialog, and
 * it is announced as a modal dialog to assistive technology.
 */

const kindOf = (item) => {
  const category = item?.category || '';
  if (/Education|Secondary|Master|Bachelor/i.test(category)) return 'education';
  if (/Research|Experience/i.test(category)) return 'experience';
  return 'project';
};

const COPY = {
  education: { badge: 'Education', heading: 'Programme details', stack: 'Subjects' },
  experience: { badge: 'Experience', heading: 'Role overview', stack: 'Technologies' },
  project: { badge: 'Project', heading: 'Project overview', stack: 'Tech stack' },
};

const primaryActionLabel = (kind, item) => {
  if (item?.publication && item.link === item.publication.url) return 'Read the paper';
  if (kind === 'education') return 'Visit website';
  if (kind === 'experience') return 'View details';
  return 'View live';
};

const ProjectModal = ({ item, onClose }) => {
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!item) return undefined;

    previouslyFocused.current = document.activeElement;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      // Keep Tab inside the dialog.
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Freeze the page behind the overlay, restoring whatever was there before
    // rather than assuming the default.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    dialogRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [item, onClose]);

  const kind = kindOf(item);
  const copy = COPY[kind];

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="safe-area-top safe-area-bottom fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 backdrop-blur-sm sm:p-4"
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            tabIndex={-1}
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-zinc-900 shadow-2xl outline-none sm:max-h-[90vh] sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 transition-colors hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-4 sm:top-4"
            >
              <X size={18} className="text-white" />
            </button>

            {/* Header */}
            <div className="relative h-44 flex-shrink-0 overflow-hidden sm:h-60 md:h-72">
              {item.imageUrl ? (
                <ArtworkFrame
                  src={item.imageUrl}
                  title={item.title}
                  className="absolute inset-0"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-red-900/40 via-zinc-800 to-zinc-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/70 to-transparent" />

              <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6">
                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-300 sm:text-sm">
                  {item.period && (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={14} />
                      {item.period}
                    </span>
                  )}
                  {item.duration && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={14} />
                      {item.duration}
                    </span>
                  )}
                </div>
                <h2
                  id="project-modal-title"
                  className="mb-3 text-xl font-bold text-white sm:text-2xl md:text-3xl"
                >
                  {item.title}
                </h2>
                {item.subtitle && (
                  <p className="mb-3 text-sm text-white/70">{item.subtitle}</p>
                )}

                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <ExternalLink size={16} />
                      {primaryActionLabel(kind, item)}
                    </a>
                  )}
                  {item.github && (
                    <a
                      href={item.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <Github size={16} />
                      Source code
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="touch-scroll-y overflow-y-auto p-4 sm:p-6 md:p-8">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-sm font-medium text-white">
                <span className="h-2 w-2 rounded-full bg-white" />
                {copy.badge}
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2">
                  <h3 className="mb-4 text-lg font-semibold text-white">{copy.heading}</h3>
                  <p className="whitespace-pre-line leading-relaxed text-gray-300">
                    {item.description}
                  </p>

                  {item.publication && (
                    <div className="mt-6 rounded-lg border border-red-500/20 bg-red-600/5 p-4">
                      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-400">
                        <BookOpen size={14} />
                        Publication
                      </p>
                      <a
                        href={item.publication.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-white underline decoration-red-500/40 underline-offset-4 transition-colors hover:text-red-300"
                      >
                        {item.publication.title}
                      </a>
                      <p className="mt-2 text-sm text-gray-400">
                        <cite className="not-italic">{item.publication.venue}</cite>
                        {item.publication.date && ` · ${item.publication.date}`}
                      </p>
                      {item.publication.authors && (
                        <p className="mt-1 text-xs text-gray-500">{item.publication.authors}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {item.techStack && (
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 text-base font-semibold text-white">
                        <Code size={18} className="text-red-400" />
                        {copy.stack}
                      </h4>
                      <ul className="flex flex-wrap gap-2">
                        {item.techStack.split(',').map((tech) => (
                          <li
                            key={tech}
                            className="rounded-full bg-red-600/20 px-3 py-1 text-sm text-red-300"
                          >
                            {tech.trim()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.category && (
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 text-base font-semibold text-white">
                        <Folder size={18} className="text-blue-400" />
                        Area
                      </h4>
                      <p className="text-gray-300">{item.category}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectModal;
