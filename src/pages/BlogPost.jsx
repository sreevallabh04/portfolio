import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import SEO from '@/components/SEO';
import { fetchBlogPostBySlug } from '@/lib/contentfulClient';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        const data = await fetchBlogPostBySlug(slug);
        if (!data) {
          setError('This post is not available.');
        }
        setPost(data);
      } catch (err) {
        console.error(err);
        setError('Unable to load this post right now.');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  const seoConfig = post
    ? {
        title: `${post.title} | Sreevallabh Blog`,
        description: post.excerpt || 'Read the latest article from Sreevallabh.',
        type: 'article',
        author: 'Sreevallabh Kakarala',
        image: post.heroImage?.url,
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

          {loading && (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-white/70">
              <motion.div
                className="h-12 w-12 rounded-full border-4 border-red-500 border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              />
              <p>Summoning words…</p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-center text-red-200">
              <p>{error}</p>
            </div>
          )}

          {!loading && post && (
            <article className="space-y-8">
              <header className="space-y-4">
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                  <span className="inline-flex items-center gap-2">
                    <Calendar size={16} />
                    {formatDate(post.publishDate)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock size={16} />
                    {estimateReadingTime(post.content)}
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
                    src={post.heroImage.url}
                    alt={post.heroImage.description}
                    className="w-full"
                  />
                </div>
              )}

              <div className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-red-400 hover:prose-a:text-red-300 prose-blockquote:border-red-500/60 prose-blockquote:text-white/80">
                {renderRichText(post.content)}
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

const estimateReadingTime = (richTextDocument) => {
  if (!richTextDocument) return 'Quick read';

  const plainText = JSON.stringify(richTextDocument);
  const wordsPerMinute = 200;
  const words = plainText.split(' ').length;
  const minutes = Math.max(1, Math.round(words / wordsPerMinute));
  return `${minutes} min read`;
};

const renderRichText = (content) => {
  if (!content) {
    return <p>This story is still being written.</p>;
  }

  return documentToReactComponents(content, richTextOptions);
};

const richTextOptions = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node, children) => <p className="leading-relaxed text-white/80">{children}</p>,
    [BLOCKS.HEADING_2]: (node, children) => <h2 className="mt-10 text-2xl font-semibold text-white">{children}</h2>,
    [BLOCKS.HEADING_3]: (node, children) => <h3 className="mt-8 text-xl font-semibold text-white">{children}</h3>,
    [BLOCKS.QUOTE]: (node, children) => (
      <blockquote className="border-l-4 border-red-400/60 pl-4 italic text-white/70">{children}</blockquote>
    ),
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const { file, description } = node.data.target.fields;
      return (
        <figure className="my-6 overflow-hidden rounded-xl border border-white/10">
          <img src={`https:${file.url}`} alt={description} className="w-full" loading="lazy" />
          {description && <figcaption className="bg-white/5 px-4 py-2 text-sm text-white/60">{description}</figcaption>}
        </figure>
      );
    },
    [INLINES.HYPERLINK]: (node, children) => (
      <a href={node.data.uri} target="_blank" rel="noopener noreferrer" className="font-semibold text-red-400">
        {children}
      </a>
    ),
  },
};

export default BlogPost;


