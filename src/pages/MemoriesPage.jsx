import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Camera } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Folder from '@/components/Folder';

const BUCKET = 'memories';

const YEAR_COLORS = {
  2020: '#e50914',
  2021: '#ff6b35',
  2022: '#f7c948',
  2023: '#22c55e',
  2024: '#3b82f6',
  2025: '#8b5cf6',
  2026: '#ec4899',
};

const getYearColor = (year) => YEAR_COLORS[year] || '#5227FF';

const MemoriesPage = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeYear, setActiveYear] = useState(null);
  const [expandedMemory, setExpandedMemory] = useState(null);

  useEffect(() => {
    const fetchMemories = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('year', { ascending: false })
        .order('created_at', { ascending: false });

      if (!error && data) {
        setMemories(data);
      }
      setLoading(false);
    };

    fetchMemories();
  }, []);

  const getImageUrl = (imagePath) => {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(imagePath);
    return data.publicUrl;
  };

  const groupedByYear = useMemo(() => {
    const groups = {};
    memories.forEach((m) => {
      if (!groups[m.year]) groups[m.year] = [];
      groups[m.year].push(m);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, items]) => ({ year: Number(year), items }));
  }, [memories]);

  const activeYearMemories = useMemo(() => {
    if (activeYear === null) return [];
    return memories.filter((m) => m.year === activeYear);
  }, [memories, activeYear]);

  // Build folder preview items (up to 3 thumbnail images per folder)
  const getFolderItems = (items) => {
    return items.slice(0, 3).map((m) => (
      <img
        key={m.id}
        src={getImageUrl(m.image_path)}
        alt={m.caption || ''}
        loading="lazy"
      />
    ));
  };

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      {/* Grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <div className="relative z-10 pt-24 pb-6 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Camera className="w-8 h-8 text-purple-400" />
            <h1
              className="text-5xl sm:text-6xl text-white font-bold"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              Memories
            </h1>
          </div>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            Moments with friends, family, and everything in between.
          </p>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {activeYear === null ? (
          /* Folder Grid View */
          <motion.div
            key="folders"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 max-w-5xl mx-auto px-4 pb-24"
          >
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
              </div>
            ) : groupedByYear.length === 0 ? (
              <div className="text-center py-24">
                <Camera className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p
                  className="text-zinc-500 text-2xl"
                  style={{ fontFamily: "'Caveat', cursive" }}
                >
                  No memories yet...
                </p>
                <p className="text-zinc-600 text-sm mt-2">
                  Photos are being uploaded. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-12 sm:gap-16 place-items-center pt-8">
                {groupedByYear.map(({ year, items }) => (
                  <motion.div
                    key={year}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: groupedByYear.findIndex(g => g.year === year) * 0.1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="relative" style={{ height: '160px', width: '140px' }}>
                      <Folder
                        color={getYearColor(year)}
                        size={1.4}
                        items={getFolderItems(items)}
                        onClick={() => setActiveYear(year)}
                      />
                    </div>
                    <p
                      className="text-white text-2xl font-semibold"
                      style={{ fontFamily: "'Caveat', cursive" }}
                    >
                      {year}
                    </p>
                    <p className="text-zinc-500 text-xs">
                      {items.length} {items.length === 1 ? 'photo' : 'photos'}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          /* Photo Gallery View (for selected year) */
          <motion.div
            key={`gallery-${activeYear}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 max-w-6xl mx-auto px-4 pb-24"
          >
            {/* Back button + year title */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => setActiveYear(null)}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm">Back to folders</span>
              </button>
              <h2
                className="text-3xl text-white font-bold"
                style={{ fontFamily: "'Caveat', cursive", color: getYearColor(activeYear) }}
              >
                {activeYear}
              </h2>
              <span className="text-zinc-500 text-sm">
                {activeYearMemories.length} {activeYearMemories.length === 1 ? 'photo' : 'photos'}
              </span>
            </div>

            {/* Photo grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeYearMemories.map((memory, index) => (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group cursor-pointer relative overflow-hidden rounded-xl bg-zinc-900"
                  onClick={() => setExpandedMemory(memory)}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={getImageUrl(memory.image_path)}
                      alt={memory.caption || 'Memory'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p
                      className="text-white text-lg"
                      style={{ fontFamily: "'Caveat', cursive" }}
                    >
                      {memory.caption || ''}
                    </p>
                    {memory.tags?.length > 0 && (
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {memory.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] bg-white/20 text-white/80 px-2 py-0.5 rounded-full backdrop-blur-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded photo modal */}
      <AnimatePresence>
        {expandedMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setExpandedMemory(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative max-w-3xl w-full max-h-[90vh] overflow-hidden rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setExpandedMemory(null)}
                className="absolute top-3 right-3 z-10 w-10 h-10 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X size={20} />
              </button>

              <img
                src={getImageUrl(expandedMemory.image_path)}
                alt={expandedMemory.caption || 'Memory'}
                className="w-full max-h-[75vh] object-contain bg-black rounded-t-xl"
              />

              <div className="bg-zinc-900 p-5 rounded-b-xl">
                <p
                  className="text-white text-xl mb-2"
                  style={{ fontFamily: "'Caveat', cursive" }}
                >
                  {expandedMemory.caption || ''}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className="text-sm font-semibold px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: getYearColor(expandedMemory.year) + '20',
                      color: getYearColor(expandedMemory.year),
                    }}
                  >
                    {expandedMemory.year}
                  </span>
                  {expandedMemory.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemoriesPage;
