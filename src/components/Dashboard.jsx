import React, { useState, useMemo, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, FileText, ArrowRight } from 'lucide-react';
import SimpleContentRow from '@/components/SimpleContentRow';
import ProjectModal from '@/components/ProjectModal';
import PublicationBanner from '@/components/PublicationBanner';
import { Button } from '@/components/ui/button';
import {
  CONTACT,
  PROFILE,
  PROJECTS,
  EXPERIENCE,
  EDUCATION,
  SKILL_CATEGORIES,
} from '@/data/portfolio';

const Dashboard = () => {
  const { profile } = useParams();
  const [selectedItem, setSelectedItem] = useState(null);

  const isRecruiter = profile === 'recruiter';

  const rows = useMemo(() => {
    if (!isRecruiter) return [];
    return [
      { title: 'Projects', items: PROJECTS },
      { title: 'Professional Experience', items: EXPERIENCE },
      { title: 'Technical Skills', items: SKILL_CATEGORIES, isSkills: true },
      { title: 'Education & Coursework', items: EDUCATION },
    ];
  }, [isRecruiter]);

  const openModal = useCallback((item) => {
    if (item?.description) setSelectedItem(item);
  }, []);

  const closeModal = useCallback(() => setSelectedItem(null), []);

  // Any profile that is not the recruiter reaches this component only via an
  // unknown /browse/:profile value. Show a real landing state rather than the
  // old placeholder, which rendered <img src={undefined}> against an empty page.
  if (!isRecruiter) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white"
      >
        <h1 className="netflix-font text-4xl tracking-wide text-white sm:text-5xl">
          Nothing to stream here
        </h1>
        <p className="mt-4 max-w-md text-white/60">
          &ldquo;{profile}&rdquo; isn&apos;t one of the available profiles. Pick one
          from the profile picker to start browsing.
        </p>
        <Link
          to="/"
          className="mt-8 rounded-md bg-red-600 px-6 py-3 font-semibold transition-colors hover:bg-red-700"
        >
          Choose a profile
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="page-fade min-h-screen bg-black text-white"
    >
      {/* Hero */}
      <header className="relative h-[55vh] w-full md:h-[70vh] lg:h-[80vh]">
        <img
          src={PROFILE.bannerImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-right md:object-[85%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />

        {/* Constrained on both sides. With only `left` + `max-w-xl` the block
            was wider than a phone viewport, which made the whole page scroll
            sideways and clipped the copy. */}
        <div className="absolute inset-x-[4%] bottom-[12%] z-10 max-w-xl md:inset-x-[5%] lg:max-w-2xl">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-red-500 sm:text-sm">
            <span className="netflix-font text-lg text-red-600">N</span>
            {PROFILE.role}
          </p>
          <h1 className="mb-4 text-4xl font-extrabold leading-none drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
            {PROFILE.name}
          </h1>
          <p className="mb-2 text-sm text-white/60 sm:text-base">
            {PROFILE.institution} &middot; {PROFILE.period}
          </p>
          <p className="mb-6 text-base text-white/90 drop-shadow-sm sm:text-lg md:text-xl">
            {PROFILE.tagline}
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => window.open(CONTACT.resume, '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-2 rounded-md bg-white px-6 py-3 text-base font-semibold text-black transition-colors hover:bg-gray-200"
            >
              <FileText size={18} />
              Resume
            </Button>
            <Button
              onClick={() => window.open(CONTACT.github, '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-2 rounded-md bg-white/10 px-6 py-3 text-base font-semibold text-white ring-1 ring-white/30 backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <Github size={18} />
              GitHub
            </Button>
            <Link
              to="/browse/recruiter/projects"
              className="flex items-center gap-2 rounded-md px-6 py-3 text-base font-semibold text-white/80 transition-colors hover:text-white"
            >
              All projects
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </header>

      <div className="px-[4%] pb-16 md:px-[5%]">
        <PublicationBanner />

        {rows.map((row) => (
          <SimpleContentRow
            key={row.title}
            title={row.title}
            items={row.items}
            isSkills={row.isSkills}
            onProjectClick={openModal}
          />
        ))}
      </div>

      <ProjectModal item={selectedItem} onClose={closeModal} />
    </motion.div>
  );
};

export default Dashboard;
