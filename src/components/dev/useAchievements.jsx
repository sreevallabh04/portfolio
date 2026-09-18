import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Achievements for the developer page.
 *
 * Gives the terminal, the games and the hidden commands a reason to be poked
 * at: every discovery unlocks a trophy, unlocks persist per browser, and the
 * drawer shows how many are left without saying what they are.
 */

export const ACHIEVEMENTS = [
  { id: 'boot', icon: '⚡', name: 'Cold Boot', hint: 'Start the machine.' },
  { id: 'first-command', icon: '⌨️', name: 'Hello, World', hint: 'Run your first command.' },
  { id: 'help', icon: '📖', name: 'RTFM', hint: 'Ask the terminal for help.' },
  { id: 'sudo', icon: '🔑', name: 'Root Access', hint: 'Escalate your privileges.' },
  { id: 'konami', icon: '🎮', name: 'Up Up Down Down', hint: 'Some codes never die.' },
  { id: 'gamer', icon: '🕹️', name: 'Insert Coin', hint: 'Play one of the games.' },
  { id: 'all-games', icon: '🏆', name: 'Speedrunner', hint: 'Play every game at least once.' },
  { id: 'chatbot', icon: '🤖', name: 'Turing Test', hint: 'Talk to the AI assistant.' },
  { id: 'neofetch', icon: '🖥️', name: 'Show Off the Rig', hint: 'Every Linux user does this.' },
  { id: 'hire', icon: '💼', name: 'Recruiter Mode', hint: 'Ask the obvious question.' },
  { id: 'coffee', icon: '☕', name: 'HTTP 418', hint: 'Ask for something the server cannot brew.' },
  { id: 'completionist', icon: '👑', name: 'Completionist', hint: 'Unlock everything else.' },
];

const STORAGE_KEY = 'dev-achievements';

const AchievementContext = createContext(null);

const readStored = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const AchievementProvider = ({ children }) => {
  const [unlocked, setUnlocked] = useState(readStored);
  const [queue, setQueue] = useState([]);

  const unlock = useCallback((id) => {
    setUnlocked((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];

      // "Completionist" is awarded for holding every other trophy.
      const others = ACHIEVEMENTS.filter((a) => a.id !== 'completionist').map((a) => a.id);
      if (others.every((otherId) => next.includes(otherId)) && !next.includes('completionist')) {
        next.push('completionist');
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable; unlocks stay in memory for this session */
      }

      const justUnlocked = next.filter((entry) => !prev.includes(entry));
      setQueue((q) => [...q, ...justUnlocked]);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setUnlocked([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing to clear */
    }
  }, []);

  const dismiss = useCallback((id) => {
    setQueue((q) => q.filter((entry) => entry !== id));
  }, []);

  const value = useMemo(
    () => ({ unlocked, unlock, reset, queue, dismiss, total: ACHIEVEMENTS.length }),
    [unlocked, unlock, reset, queue, dismiss]
  );

  return <AchievementContext.Provider value={value}>{children}</AchievementContext.Provider>;
};

export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used inside an AchievementProvider');
  }
  return context;
};

/** Auto-dismissing toast stack for newly unlocked trophies. */
export const AchievementToasts = () => {
  const { queue, dismiss } = useAchievements();

  useEffect(() => {
    if (queue.length === 0) return undefined;
    const timer = setTimeout(() => dismiss(queue[0]), 4000);
    return () => clearTimeout(timer);
  }, [queue, dismiss]);

  if (queue.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] flex w-[min(92vw,26rem)] -translate-x-1/2 flex-col gap-2">
      {queue.map((id) => {
        const achievement = ACHIEVEMENTS.find((a) => a.id === id);
        if (!achievement) return null;
        return (
          <div
            key={id}
            role="status"
            className="rise-in pointer-events-auto flex items-center gap-4 rounded-xl border border-[#39ff14]/40 bg-black/95 p-4 shadow-2xl backdrop-blur"
            style={{ boxShadow: '0 0 30px -8px rgba(57,255,20,0.6)' }}
          >
            <span className="text-3xl" aria-hidden="true">
              {achievement.icon}
            </span>
            <span className="min-w-0">
              <span className="block font-mono text-[10px] uppercase tracking-[0.3em] text-[#39ff14]">
                Achievement unlocked
              </span>
              <span className="mt-0.5 block truncate font-semibold text-white">
                {achievement.name}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
};
