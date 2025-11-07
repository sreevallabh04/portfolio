import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Calendar, Tag, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { getAllBlogPosts, getAllTags } from '@/lib/blogLoader';

const Blog = () => {
  const [selectedTag, setSelectedTag] = useState('All');

  const posts = useMemo(() => getAllBlogPosts(), []);
  const tags = useMemo(() => ['All', ...getAllTags()], []);

  const filteredPosts = useMemo(() => {
    if (selectedTag === 'All') {
      return posts;
    }
    return posts.filter((post) => post.tags.includes(selectedTag));
  }, [posts, selectedTag]);

  const seoConfig = {
    title: 'Sreevallabh Blog',
    description: 'Read my latest thoughts on software engineering, product experiments, and life lessons.',
    type: 'article',
    author: 'Sreevallabh Kakarala',
    keywords: 'blog, software engineering, technology, product, learning',
  };

  return (
    <>
      <SEO {...seoConfig} />
      <div className="min-h-screen bg-black text-white">
        <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-red-600/30 via-black to-red-900/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-500/20 via-transparent to-transparent" />
          <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-24 sm:px-8">
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/70">Blog</span>
            <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">Stories, Learnings & Experiments</h1>
            <p className="max-w-2xl text-base text-white/70 sm:text-lg">
              Follow along as I build products, explore AI, and document the journey of a developer obsessed with great experiences.
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
          <section className="mb-12">
            <h2 className="mb-4 text-lg font-semibold text-white/80">Filter by topic</h2>
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    selectedTag === tag
                      ? 'border-red-500 bg-red-500/20 text-red-200'
                      : 'border-white/20 bg-white/5 text-white/60 hover:border-red-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Tag size={14} />
                    {tag}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {filteredPosts.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center text-white/60">
              <BookOpen className="mx-auto mb-4 h-10 w-10" />
              <p>No posts found for this filter yet.</p>
              <p className="mt-2 text-sm text-white/40">
                Create a new markdown file in <code className="px-2 py-1 bg-white/10 rounded">content/blog/</code> to get started!
              </p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            <div className="grid gap-6 md:grid-cols-2">
              {filteredPosts.map((post, idx) => (
                <motion.article
                  key={post.slug}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-black/80"
                >
                  {post.heroImage ? (
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={post.heroImage}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    </div>
                  ) : (
                    <div className="flex h-56 items-center justify-center bg-white/5 text-white/40">
                      <BookOpen size={40} />
                    </div>
                  )}

                  <div className="relative flex flex-col gap-4 p-6">
                    <div className="flex items-center gap-3 text-sm text-white/50">
                      <Calendar size={16} />
                      <span>{formatDate(post.publishDate)}</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-white transition-colors group-hover:text-red-400">
                      {post.title}
                    </h3>
                    <p className="line-clamp-3 text-sm text-white/70">{post.excerpt}</p>

                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <Link
                      to={`/browse/blog/${post.slug}`}
                      className="group inline-flex items-center gap-2 text-sm font-semibold text-red-400 transition-colors hover:text-red-300"
                    >
                      Continue reading
                      <ExternalLink size={16} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          </AnimatePresence>
        </main>
      </div>
    </>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default Blog;


