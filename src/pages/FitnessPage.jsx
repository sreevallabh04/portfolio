import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Flame, ChevronDown, Clock, Pill, Utensils, ListChecks, TrendingUp } from 'lucide-react';
import SEO from '@/components/SEO';
import {
  BLOCK,
  STATS,
  TRACKED_LIFTS,
  WEEK,
  DAY_TIMELINE,
  MACROS,
  MEALS,
  SUPPLEMENTS,
  RULES,
  PROGRESSION,
} from '@/data/fitness';

/**
 * The training block presented as a Netflix series: the week is a season, each
 * day is an episode you can expand to see the full session.
 */

const TABS = [
  { id: 'training', label: 'Episodes', icon: Dumbbell },
  { id: 'nutrition', label: 'Nutrition', icon: Utensils },
  { id: 'supplements', label: 'Supplements', icon: Pill },
  { id: 'rules', label: 'Rules', icon: ListChecks },
];

const Episode = ({ session, index, isOpen, onToggle }) => (
  <li className="overflow-hidden border-b border-white/10">
    <button
      onClick={onToggle}
      aria-expanded={isOpen}
      className="flex w-full items-center gap-4 px-2 py-5 text-left transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:bg-white/5 sm:px-4"
    >
      <span className="w-8 flex-shrink-0 text-center text-xl font-light text-white/35 sm:text-2xl">
        {index + 1}
      </span>

      <span
        className="relative hidden h-16 w-28 flex-shrink-0 items-center justify-center overflow-hidden rounded-md sm:flex"
        style={{
          background: `linear-gradient(135deg, ${session.accent}55, rgba(24,24,27,0.95))`,
          border: `1px solid ${session.accent}66`,
        }}
      >
        {/* Accent bar rather than accent text: the darker day colours were
            close to unreadable against the tile background. */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1"
          style={{ backgroundColor: session.accent }}
        />
        <span className="netflix-font text-base tracking-widest text-white">
          {session.short.toUpperCase()}
        </span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-base font-semibold text-white sm:text-lg">{session.title}</span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ backgroundColor: `${session.accent}22`, color: session.accent }}
          >
            {session.intensity}
          </span>
        </span>
        <span className="mt-1 block text-sm text-white/50">{session.focus}</span>
        <span className="mt-1 block text-xs text-white/35">
          Evening: {session.evening} &middot; Abs: {session.abs}
        </span>
      </span>

      <ChevronDown
        size={20}
        className={`flex-shrink-0 text-white/40 transition-transform duration-300 ${
          isOpen ? 'rotate-180' : ''
        }`}
      />
    </button>

    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          className="overflow-hidden"
        >
          <div className="px-2 pb-6 sm:px-4 sm:pl-[calc(2rem+1rem+7rem+1rem)]">
            <p className="mb-4 max-w-2xl text-sm italic text-white/45">{session.note}</p>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-white/40">
                    <th scope="col" className="py-2 pr-4 font-medium">Exercise</th>
                    <th scope="col" className="py-2 pr-4 font-medium">Sets</th>
                    <th scope="col" className="py-2 pr-4 font-medium">Rest</th>
                    <th scope="col" className="py-2 font-medium">RPE</th>
                  </tr>
                </thead>
                <tbody>
                  {session.exercises.map((exercise) => (
                    <tr key={exercise.name} className="border-b border-white/5 align-top">
                      <td className="py-3 pr-4">
                        <span className="block font-medium text-white/90">{exercise.name}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-white/40">
                          {exercise.cue}
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-3 pr-4 text-white/70">{exercise.sets}</td>
                      <td className="whitespace-nowrap py-3 pr-4 text-white/70">{exercise.rest}</td>
                      <td className="py-3 text-white/70">{exercise.rpe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </li>
);

const SectionHeading = ({ icon: Icon, children }) => (
  <h2 className="mb-5 flex items-center gap-2.5 text-xl font-bold text-white sm:text-2xl">
    <Icon size={22} className="text-red-500" />
    {children}
  </h2>
);

const FitnessPage = () => {
  const [openDay, setOpenDay] = useState(0);
  const [tab, setTab] = useState('training');

  return (
    <>
      <SEO
        title="75 Hard"
        description="A seven-day Push/Pull/Legs and Upper/Lower hybrid run as a cut: two sessions daily, 2,250 kcal, 175 g protein, tracked lifts holding while the scale drops."
        url="/browse/fitness"
        type="website"
      />

      <motion.div
        initial={false}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="page-fade min-h-screen bg-black text-white"
      >
        {/* Hero */}
        <header className="relative flex min-h-[72vh] w-full items-end overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-red-950 via-zinc-950 to-black"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 55% 55% at 70% 35%, rgba(229,9,20,0.3) 0%, transparent 70%)',
            }}
          />
          {/* Faint barbell-plate rings */}
          <div aria-hidden="true" className="absolute -right-24 top-1/4 opacity-[0.07]">
            <div className="h-[420px] w-[420px] rounded-full border-[36px] border-white" />
          </div>
          <div aria-hidden="true" className="absolute -left-32 bottom-0 opacity-[0.05]">
            <div className="h-[320px] w-[320px] rounded-full border-[28px] border-white" />
          </div>

          <div className="relative z-10 w-full px-[6%] pb-14 pt-28">
            <p className="mb-4 flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.4em] text-red-500 sm:text-xs">
              <Flame size={14} />
              Limited Series
            </p>

            <h1 className="netflix-font text-6xl leading-none text-white drop-shadow-2xl sm:text-8xl">
              {BLOCK.title}
            </h1>

            <p className="mt-3 text-lg font-medium text-white/85 sm:text-2xl">{BLOCK.tagline}</p>

            <ul className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/55">
              <li>{BLOCK.start}</li>
              <li aria-hidden="true" className="text-red-500">&bull;</li>
              <li>{BLOCK.end}</li>
              <li aria-hidden="true" className="text-red-500">&bull;</li>
              {BLOCK.genres.map((genre, i) => (
                <li key={genre} className="flex items-center gap-2">
                  {genre}
                  {i < BLOCK.genres.length - 1 && (
                    <span aria-hidden="true" className="text-red-500">&bull;</span>
                  )}
                </li>
              ))}
            </ul>

            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
              {BLOCK.synopsis}
            </p>

            {/* Stat strip */}
            <dl className="mt-9 grid max-w-3xl grid-cols-3 gap-x-6 gap-y-5 sm:grid-cols-6">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dd className="text-2xl font-bold leading-none text-white sm:text-3xl">
                    {stat.value}
                    <span className="ml-1 text-xs font-normal text-white/40">{stat.unit}</span>
                  </dd>
                  <dt className="mt-1.5 text-[11px] uppercase tracking-wider text-white/40">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent" />
        </header>

        {/* Tabs */}
        <nav className="sticky top-16 z-30 border-b border-white/10 bg-black/90 backdrop-blur-lg">
          <div className="scrollbar-hide flex gap-1 overflow-x-auto px-[6%]">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                aria-current={tab === id ? 'true' : undefined}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-4 text-sm font-medium transition-colors focus-visible:outline-none ${
                  tab === id
                    ? 'border-red-600 text-white'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </nav>

        <div className="px-[6%] py-10 pb-24">
          {tab === 'training' && (
            <section>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-xl font-bold sm:text-2xl">Season 1 &middot; 7 Episodes</h2>
                <button
                  onClick={() => setOpenDay(openDay === null ? 0 : null)}
                  className="text-sm text-white/50 transition-colors hover:text-white"
                >
                  {openDay === null ? 'Expand first' : 'Collapse all'}
                </button>
              </div>

              <ul className="border-t border-white/10">
                {WEEK.map((session, index) => (
                  <Episode
                    key={session.day}
                    session={session}
                    index={index}
                    isOpen={openDay === index}
                    onToggle={() => setOpenDay(openDay === index ? null : index)}
                  />
                ))}
              </ul>

              {/* Tracked lifts */}
              <div className="mt-14">
                <SectionHeading icon={TrendingUp}>Tracked lifts</SectionHeading>
                <p className="mb-5 max-w-2xl text-sm text-white/50">
                  Body weight down ~0.5 kg per week while these hold their weight and reps. Holding
                  is the goal; adding is a bonus.
                </p>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {TRACKED_LIFTS.map((lift) => (
                    <li
                      key={lift.name}
                      className="rounded-xl border border-white/10 bg-zinc-900/70 p-4"
                    >
                      <p className="text-xs uppercase tracking-wider text-white/35">{lift.day}</p>
                      <p className="mt-1.5 font-semibold text-white">{lift.name}</p>
                      <p className="mt-2 flex items-baseline gap-2 text-sm">
                        <span className="text-white/70">{lift.scheme}</span>
                        <span className="text-red-400">{lift.progression}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Progression */}
              <div className="mt-14">
                <SectionHeading icon={TrendingUp}>How it progresses</SectionHeading>
                <dl className="max-w-3xl divide-y divide-white/10 border-y border-white/10">
                  {PROGRESSION.map((item) => (
                    <div key={item.type} className="grid gap-1 py-4 sm:grid-cols-[180px_1fr] sm:gap-6">
                      <dt className="font-medium text-white">{item.type}</dt>
                      <dd className="text-sm leading-relaxed text-white/60">{item.how}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Daily timeline */}
              <div className="mt-14">
                <SectionHeading icon={Clock}>A day in the block</SectionHeading>
                <ol className="max-w-2xl border-l border-white/15 pl-6">
                  {DAY_TIMELINE.map((entry) => (
                    <li key={entry.time} className="relative pb-5 last:pb-0">
                      <span
                        aria-hidden="true"
                        className="absolute -left-[1.6875rem] top-1.5 h-2.5 w-2.5 rounded-full bg-red-600 ring-4 ring-black"
                      />
                      <p className="text-sm font-semibold text-red-400">{entry.time}</p>
                      <p className="mt-0.5 text-sm text-white/65">{entry.what}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          )}

          {tab === 'nutrition' && (
            <section>
              <SectionHeading icon={Utensils}>Calories and macros</SectionHeading>
              <div className="mb-12 overflow-x-auto">
                <table className="w-full min-w-[420px] max-w-2xl text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/15 text-[11px] uppercase tracking-wider text-white/40">
                      <th scope="col" className="py-2.5 pr-4 font-medium">Macro</th>
                      <th scope="col" className="py-2.5 pr-4 font-medium">Mon&ndash;Fri, Sun</th>
                      <th scope="col" className="py-2.5 font-medium">Saturday (long ride)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MACROS.map((row) => (
                      <tr key={row.label} className="border-b border-white/5">
                        <td className="py-3 pr-4 font-medium text-white/90">{row.label}</td>
                        <td className="py-3 pr-4 text-white/65">{row.weekday}</td>
                        <td className="py-3 text-white/65">{row.saturday}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <SectionHeading icon={Clock}>The daily meal structure</SectionHeading>
              <ul className="grid gap-3 md:grid-cols-2">
                {MEALS.map((meal) => (
                  <li
                    key={meal.time}
                    className="flex gap-4 rounded-xl border border-white/10 bg-zinc-900/70 p-4"
                  >
                    <span className="w-14 flex-shrink-0 text-sm font-semibold text-red-400">
                      {meal.time}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-white">{meal.meal}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-white/55">
                        {meal.what}
                      </span>
                      <span className="mt-2 flex gap-3 text-xs text-white/40">
                        <span>{meal.kcal} kcal</span>
                        <span>{meal.protein} g protein</span>
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-6 max-w-2xl text-sm text-white/45">
                Protein sits at 2.2 g per kg to protect lean mass across seven training days. Fat
                never drops below 65 g. Carbohydrate takes the remainder and moves up on Saturday
                for the long ride.
              </p>
            </section>
          )}

          {tab === 'supplements' && (
            <section>
              <SectionHeading icon={Pill}>Daily schedule</SectionHeading>
              <p className="mb-6 max-w-2xl text-sm text-white/50">
                Everything here addresses a measured deficiency, a known gap in an egg-vegetarian
                diet, or has consistent evidence for recovery in trained men on a deficit. Nothing
                is speculative, and nothing on the list is a testosterone booster.
              </p>
              <ul className="grid gap-3 md:grid-cols-2">
                {SUPPLEMENTS.map((supplement) => (
                  <li
                    key={supplement.name}
                    className="rounded-xl border border-white/10 bg-zinc-900/70 p-5"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-semibold text-white">{supplement.name}</h3>
                      <span className="rounded-full bg-red-600/15 px-2.5 py-0.5 text-xs font-medium text-red-300">
                        {supplement.dose}
                      </span>
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-wider text-white/35">
                      {supplement.when}
                    </p>
                    <p className="mt-2.5 text-sm leading-relaxed text-white/55">{supplement.why}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {tab === 'rules' && (
            <section>
              <SectionHeading icon={ListChecks}>Rules for the cut</SectionHeading>
              <ol className="max-w-3xl space-y-3">
                {RULES.map((rule, index) => (
                  <li
                    key={rule}
                    className="flex gap-4 rounded-xl border border-white/10 bg-zinc-900/60 p-4"
                  >
                    <span className="netflix-font w-7 flex-shrink-0 text-lg text-red-600">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm leading-relaxed text-white/70">{rule}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default FitnessPage;
