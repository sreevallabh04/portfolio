import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, RotateCcw } from 'lucide-react';
import { ACHIEVEMENTS, useAchievements } from './useAchievements';

/**
 * Floating trophy counter and the drawer behind it. Locked entries show only
 * their hint, so the page stays worth poking at.
 */
const TrophyDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unlocked, total, reset } = useAchievements();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label={`Achievements: ${unlocked.length} of ${total} unlocked`}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-[#39ff14]/40 bg-black/85 px-4 py-3 font-mono text-sm text-[#39ff14] shadow-lg backdrop-blur transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39ff14]"
      >
        <Trophy size={18} />
        {unlocked.length}/{total}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-end bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
            onClick={() => setIsOpen(false)}
          >
            <motion.aside
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl border border-[#39ff14]/25 bg-zinc-950 p-6 sm:max-w-md sm:rounded-2xl"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="flex items-center gap-2 font-mono text-lg font-bold text-[#39ff14]">
                    <Trophy size={20} />
                    Achievements
                  </h2>
                  <p className="mt-1 text-sm text-white/45">
                    {unlocked.length} of {total} unlocked
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close achievements"
                  className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                >
                  <X size={16} />
                </button>
              </div>

              <div
                className="mb-6 h-1.5 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-valuenow={unlocked.length}
                aria-valuemin={0}
                aria-valuemax={total}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#39ff14] to-[#00eaff] transition-[width] duration-500"
                  style={{ width: `${(unlocked.length / total) * 100}%` }}
                />
              </div>

              <ul className="space-y-2">
                {ACHIEVEMENTS.map((achievement) => {
                  const isUnlocked = unlocked.includes(achievement.id);
                  return (
                    <li
                      key={achievement.id}
                      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                        isUnlocked
                          ? 'border-[#39ff14]/30 bg-[#39ff14]/[0.06]'
                          : 'border-white/10 bg-white/[0.02]'
                      }`}
                    >
                      <span
                        className={`text-2xl ${isUnlocked ? '' : 'opacity-25 grayscale'}`}
                        aria-hidden="true"
                      >
                        {isUnlocked ? achievement.icon : '🔒'}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block text-sm font-semibold ${
                            isUnlocked ? 'text-white' : 'text-white/35'
                          }`}
                        >
                          {isUnlocked ? achievement.name : '???'}
                        </span>
                        <span className="mt-0.5 block text-xs text-white/40">
                          {achievement.hint}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>

              <button
                onClick={reset}
                className="mt-5 flex items-center gap-2 text-xs text-white/30 transition-colors hover:text-white/60"
              >
                <RotateCcw size={13} />
                Reset progress
              </button>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TrophyDrawer;
