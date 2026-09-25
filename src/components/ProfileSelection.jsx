import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Profile picker.
 *
 * The entrance stagger is CSS (`.rise-in` + an animation-delay) rather than a
 * JS animation library on purpose: this screen is the only way into the rest of
 * the site, so its content must never depend on rAF actually running to become
 * visible.
 */

const PROFILES = [
  {
    id: 'recruiter',
    name: 'Recruiter',
    blurb: 'Experience, projects and the resume',
    avatar: '/avatars/avatar1.jpeg',
    accent: 'group-hover:ring-red-500',
  },
  {
    id: 'developer',
    name: 'Developer',
    blurb: 'A pixel gym built from my real training logs',
    avatar: '/avatars/avatar2.jpeg',
    accent: 'group-hover:ring-emerald-400',
  },
  {
    id: 'stalker',
    name: 'Stalker',
    blurb: 'The trailer and every social link',
    avatar: '/avatars/avatar3.jpeg',
    accent: 'group-hover:ring-amber-400',
  },
  {
    id: 'fitness',
    name: 'Fitness',
    blurb: '75 Hard — the training block, in full',
    avatar: '/avatars/avatar4.jpeg',
    accent: 'group-hover:ring-purple-400',
  },
];

const ProfileSelection = ({ onProfileSelect }) => {
  const [failed, setFailed] = useState({});

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#141414] px-4 py-16">
      <h1 className="rise-in netflix-font text-center text-4xl tracking-wide text-white sm:text-5xl md:text-6xl">
        Who&apos;s Watching?
      </h1>
      <p
        className="rise-in mt-3 text-center text-sm text-white/45 sm:text-base"
        style={{ animationDelay: '0.1s' }}
      >
        Each profile tells the same story a different way.
      </p>

      <ul className="mt-12 grid w-full max-w-5xl grid-cols-2 gap-6 sm:gap-10 lg:grid-cols-4">
        {PROFILES.map((profile, index) => (
          <li
            key={profile.id}
            className="rise-in flex justify-center"
            style={{ animationDelay: `${0.18 + index * 0.08}s` }}
          >
            <button
              onClick={() => onProfileSelect(profile.id)}
              className="group flex w-full max-w-[200px] flex-col items-center focus-visible:outline-none"
            >
              <span
                className={`relative block aspect-square w-full overflow-hidden rounded-lg bg-zinc-800 shadow-lg shadow-black/50 ring-2 ring-transparent transition-all duration-300 group-hover:scale-105 group-focus-visible:ring-white ${profile.accent}`}
              >
                {failed[profile.id] ? (
                  <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-900 text-4xl font-bold text-white/50">
                    {profile.name.charAt(0)}
                  </span>
                ) : (
                  <img
                    src={profile.avatar}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover"
                    onError={() => setFailed((prev) => ({ ...prev, [profile.id]: true }))}
                  />
                )}
                <span className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
              </span>

              <span className="mt-3 text-base font-medium text-white/70 transition-colors duration-300 group-hover:text-white sm:text-lg">
                {profile.name}
              </span>
              <span className="mt-1 h-8 text-center text-xs leading-snug text-white/0 transition-colors duration-300 group-hover:text-white/45">
                {profile.blurb}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <nav
        className="rise-in mt-14 flex items-center gap-6 text-xs text-white/35"
        style={{ animationDelay: '0.55s' }}
      >
        <Link to="/blog" className="transition-colors hover:text-white/70">
          Blog
        </Link>
        <span aria-hidden="true">&middot;</span>
        <a
          href="mailto:srivallabhkakarala@gmail.com"
          className="transition-colors hover:text-white/70"
        >
          Email
        </a>
      </nav>
    </main>
  );
};

export default ProfileSelection;
