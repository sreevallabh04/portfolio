import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SEO from '@/components/SEO';
import { getBlogPostBySlug } from '@/lib/blogLoader';

const BlogPost = () => {
  const { slug } = useParams();
  const post = useMemo(() => getBlogPostBySlug(slug), [slug]);

  const seoConfig = post
    ? {
        title: `${post.title} | Sreevallabh Blog`,
        description: post.excerpt || 'Read the latest article from Sreevallabh.',
        type: 'article',
        author: 'Sreevallabh Kakarala',
        image: post.heroImage,
        publishedTime: post.publishDate,
      }
    : {
        title: 'Loading… | Sreevallabh Blog',
        description: 'Reading blog post…',
      };

  return (
    <>
      <SEO {...seoConfig} />
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-8">
          <Link
            to="/browse/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-red-400 transition-colors hover:text-red-300"
          >
            <ArrowLeft size={16} />
            Back to all posts
          </Link>

          {!post && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-center text-red-200">
              <p>This post is not available.</p>
              <Link to="/browse/blog" className="mt-4 inline-block text-red-300 hover:text-red-200">
                ← Back to blog
              </Link>
            </div>
          )}

          {post && (
            <article className="space-y-8">
              <header className="space-y-4">
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                  <span className="inline-flex items-center gap-2">
                    <Calendar size={16} />
                    {formatDate(post.publishDate)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock size={16} />
                    {estimateReadingTime(post.content)} min read
                  </span>
                </div>
                <h1 className="text-3xl font-bold sm:text-4xl">{post.title}</h1>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              {post.heroImage && (
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <img
                    src={post.heroImage}
                    alt={post.title}
                    className="w-full"
                  />
                </div>
              )}

              <div className="prose prose-invert prose-lg max-w-none 
                prose-headings:text-white prose-headings:font-bold
                prose-p:text-white/80 prose-p:leading-relaxed
                prose-a:text-red-400 hover:prose-a:text-red-300
                prose-strong:text-white prose-strong:font-semibold
                prose-code:text-red-300 prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-blockquote:border-red-500/60 prose-blockquote:text-white/70 prose-blockquote:italic
                prose-ul:text-white/80 prose-ol:text-white/80
                prose-li:text-white/80
                prose-img:rounded-lg prose-img:border prose-img:border-white/10
                prose-hr:border-white/10">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {post.content}
                </ReactMarkdown>
              </div>
            </article>
          )}
        </div>
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

const estimateReadingTime = (content) => {
  if (!content) return 1;
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
};

export default BlogPost;


