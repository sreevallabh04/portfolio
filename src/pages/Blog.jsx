import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Calendar, Tag, BookOpen, ImageOff } from 'lucide-react';
import SEO from '@/components/SEO';
import { fetchBlogPosts } from '@/lib/contentfulClient';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTag, setSelectedTag] = useState('All');

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const data = await fetchBlogPosts();
        setPosts(data);
      } catch (err) {
        console.error(err);
        setError('Unable to load blog posts right now.');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const tags = useMemo(() => {
    const uniqueTags = new Set();
    posts.forEach((post) => {
      post.tags.forEach((tag) => uniqueTags.add(tag));
    });
    return ['All', ...Array.from(uniqueTags)];
  }, [posts]);

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

          {loading && (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-white/70">
              <motion.div
                className="h-16 w-16 rounded-full border-4 border-red-500 border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              />
              <p>Loading latest posts…</p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-center text-red-200">
              <p>{error}</p>
              <p className="mt-2 text-sm text-red-300">
                Make sure your Contentful credentials are set and you have published entries.
              </p>
            </div>
          )}

          {!loading && !error && filteredPosts.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center text-white/60">
              <ImageOff className="mx-auto mb-4 h-10 w-10" />
              <p>No posts found for this filter yet.</p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            <div className="grid gap-6 md:grid-cols-2">
              {filteredPosts.map((post, idx) => (
                <motion.article
                  key={post.id}
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
                        src={post.heroImage.url}
                        alt={post.heroImage.description}
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

                    <a
                      href={`/browse/blog/${post.slug}`}
                      className="group inline-flex items-center gap-2 text-sm font-semibold text-red-400 transition-colors hover:text-red-300"
                    >
                      Continue reading
                      <ExternalLink size={16} className="transition-transform group-hover:translate-x-1" />
                    </a>
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


