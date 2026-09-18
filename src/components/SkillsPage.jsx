import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import { SKILL_CATEGORIES } from '@/data/portfolio';

/**
 * Skills showcase.
 *
 * Swiper and its three stylesheets used to be imported here but nothing on the
 * page ever rendered a <Swiper>; dropping them took this route's chunk from
 * 88 kB to under 6 kB. The mobile grid and desktop rail were also two
 * near-identical copies of the same markup, now one responsive grid.
 */

const SkillTile = ({ skill, category }) => {
  const [failed, setFailed] = useState(false);
  const showLetter = !skill.logo || failed;

  return (
    <motion.li
      whileHover={{ y: -6, scale: 1.04 }}
      transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
      className="group flex aspect-square flex-col items-center justify-center gap-3 rounded-xl border border-white/5 bg-zinc-900/80 p-3 text-center backdrop-blur-sm transition-colors duration-300 hover:border-red-500/50"
      title={`${skill.name} — ${category}`}
    >
      {showLetter ? (
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-red-600/25 to-red-900/10 text-xl font-bold text-red-300 sm:h-14 sm:w-14 sm:text-2xl">
          {skill.name.charAt(0)}
        </span>
      ) : (
        <img
          src={encodeURI(skill.logo)}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="h-10 w-10 object-contain sm:h-12 sm:w-12"
          onError={() => setFailed(true)}
        />
      )}
      <span className="text-xs font-medium leading-tight text-white/85 sm:text-sm">
        {skill.name}
      </span>
    </motion.li>
  );
};

const SkillsPage = () => {
  const skillsList = SKILL_CATEGORIES.flatMap((category) =>
    category.skills.map((skill) => skill.name)
  );

  const seoConfig = {
    title: 'AI Engineering Skills',
    description:
      'The stack behind the work: Python and PyTorch, LLM and RAG systems with LangChain, vector stores, time-series forecasting, and the MLOps tooling to ship it.',
    type: 'profile',
    url: 'https://streamvallabh.life/skills',
    keywords: skillsList.join(', '),
    section: 'Skills',
    isArticle: false,
  };

  return (
    <>
      <SEO {...seoConfig} />
      <motion.div
        initial={false}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="page-fade min-h-screen bg-black text-white"
      >
        {/* Hero */}
        <header className="relative flex h-[38vh] min-h-[280px] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-red-950 via-black to-black">
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(229,9,20,0.25) 0%, transparent 70%)',
            }}
          />
          <div className="relative z-10 px-4 text-center">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.4em] text-red-500 sm:text-xs">
              The Stack
            </p>
            <h1 className="netflix-font text-4xl leading-none text-white drop-shadow-lg sm:text-5xl md:text-6xl">
              Skills Showcase
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm text-white/60 sm:text-base">
              Everything I reach for when building AI systems that have to work
              outside a notebook.
            </p>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent" />
        </header>

        <div className="px-[4%] py-10 md:px-[5%]">
          {SKILL_CATEGORIES.map((category, categoryIndex) => (
            <section
              key={category.title}
              className="rise-in mb-12"
              style={{ animationDelay: `${categoryIndex * 0.08}s` }}
            >
              <div className="mb-5 flex items-baseline justify-between gap-4">
                <h2 className="netflix-font text-xl text-red-500 sm:text-2xl md:text-3xl">
                  {category.title}
                </h2>
                <span className="text-xs text-white/35 sm:text-sm">
                  {category.skills.length} {category.skills.length === 1 ? 'skill' : 'skills'}
                </span>
              </div>

              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6">
                {category.skills.map((skill) => (
                  <SkillTile key={skill.name} skill={skill} category={category.title} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </motion.div>
    </>
  );
};

export default SkillsPage;
