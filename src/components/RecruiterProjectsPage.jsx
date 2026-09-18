import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';
import SEO from '@/components/SEO';
import ProjectModal from '@/components/ProjectModal';
import ArtworkFrame from '@/components/ArtworkFrame';
import { PROJECTS, PROJECT_CATEGORIES } from '@/data/portfolio';

const seoConfig = {
  title: 'Projects Portfolio',
  description:
    'Explore my portfolio of projects across Web Development, AI/ML, Blockchain, Games and Mobile Apps. Tech stacks, source code and live demos.',
  url: '/browse/recruiter/projects',
  image: '/HopeCore.png',
  type: 'website',
  section: 'Projects',
  keywords:
    'web development, AI/ML, blockchain, mobile apps, React, NextJS, Flutter, Python, software projects, portfolio',
  author: 'Sreevallabh Kakarala',
};

const RecruiterProjectsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);

  // The old version hard-coded the featured project by title, which threw a
  // TypeError the moment that entry was renamed or removed.
  const featuredProject = useMemo(
    () => PROJECTS.find((project) => project.featured) || PROJECTS[0],
    []
  );

  const filteredProjects = useMemo(
    () =>
      selectedCategory === 'All'
        ? PROJECTS
        : PROJECTS.filter((project) => project.category === selectedCategory),
    [selectedCategory]
  );

  return (
    <>
      <SEO {...seoConfig} />
      <motion.div
        initial={false}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="page-fade min-h-screen bg-black text-white"
      >
        {/* Featured hero */}
        <header className="relative flex h-[45vh] w-full items-end overflow-hidden sm:h-[60vh] md:h-[70vh]">
          {featuredProject.imageUrl ? (
            <>
              {/* Blurred, over-scaled backdrop. Project art here is a mix of
                  photography and square logo lockups, and object-cover alone
                  stretched the logos across the full banner. */}
              <img
                src={featuredProject.imageUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
              />
              <img
                src={featuredProject.imageUrl}
                alt=""
                aria-hidden="true"
                className="absolute right-[6%] top-1/2 hidden h-[62%] w-auto max-w-[38%] -translate-y-1/2 object-contain drop-shadow-2xl md:block"
              />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/50 via-zinc-900 to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />

          <div className="relative max-w-3xl p-4 sm:p-8 md:p-16">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-red-500">
              Featured
            </p>
            <h1 className="mb-4 text-3xl font-bold sm:text-4xl md:text-6xl">
              {featuredProject.title}
            </h1>
            <p className="mb-6 line-clamp-3 text-sm text-gray-200 sm:text-base md:text-lg">
              {featuredProject.description.split('\n')[0]}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <a
                href={featuredProject.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-6 py-3 text-base font-semibold transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ExternalLink size={18} />
                View project
              </a>
              {featuredProject.github && (
                <a
                  href={featuredProject.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-white/10 px-6 py-3 text-base font-semibold ring-1 ring-white/20 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Github size={18} />
                  Source code
                </a>
              )}
            </div>
          </div>
        </header>

        {/* Category filter */}
        <nav aria-label="Filter projects by category" className="px-4 py-6 md:px-8">
          <div className="scrollbar-hide touch-scroll-x flex gap-2 overflow-x-auto pb-2 sm:gap-3">
            {PROJECT_CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={isActive}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-base ${
                    isActive
                      ? 'bg-red-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Grid */}
        <div className="px-4 pb-16 md:px-8">
          <motion.ul
            layout
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <motion.li
                  key={project.title}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  className="group"
                >
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="flex h-full w-full flex-col overflow-hidden rounded-lg bg-zinc-900 text-left ring-1 ring-white/5 transition-all duration-200 hover:-translate-y-1 hover:ring-red-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <ArtworkFrame
                      src={project.imageUrl}
                      title={project.title}
                      className="aspect-video"
                    >
                      <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm">
                        {project.category}
                      </span>
                    </ArtworkFrame>

                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="mb-1 text-base font-bold sm:text-lg">{project.title}</h3>
                      <p className="mb-2 text-xs font-medium text-red-400">{project.period}</p>
                      <p className="line-clamp-2 flex-1 text-sm text-gray-400">
                        {project.description.split('\n')[0]}
                      </p>
                      <p className="mt-3 truncate text-xs text-white/40">{project.techStack}</p>
                    </div>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>

          {filteredProjects.length === 0 && (
            <p className="py-16 text-center text-white/50">
              No projects in this category yet.
            </p>
          )}
        </div>

        <ProjectModal item={selectedProject} onClose={() => setSelectedProject(null)} />
      </motion.div>
    </>
  );
};

export default RecruiterProjectsPage;
