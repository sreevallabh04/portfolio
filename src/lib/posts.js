import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getAllBlogPosts as getFilePosts } from '@/lib/blogLoader';

/**
 * Unified post source: Supabase first, bundled markdown as the floor.
 *
 * Why both. The markdown files in content/blog are compiled into the bundle,
 * so they can only change with a rebuild — which is exactly the constraint
 * this module exists to remove. But they also cost nothing at runtime and
 * cannot fail, so they stay as the offline floor: if Supabase is unreachable,
 * misconfigured, or the table has not been created yet, the blog still
 * renders instead of showing an empty page.
 *
 * Both sources are normalised to the shape the UI already consumes:
 *   { slug, title, excerpt, publishDate, tags, heroImage, content, source }
 * Supabase wins on slug collisions, so a file-based post can be superseded by
 * editing it in the admin without deleting the file.
 */

const normaliseRow = (row) => ({
  id: row.id,
  slug: row.slug,
  title: row.title || 'Untitled',
  excerpt: row.excerpt || '',
  publishDate: row.published_at || row.created_at,
  tags: Array.isArray(row.tags) ? row.tags : [],
  heroImage: row.hero_image || null,
  content: row.content || '',
  status: row.status,
  source: 'supabase',
});

const withSource = (post) => ({ ...post, source: 'file' });

const byNewest = (a, b) => new Date(b.publishDate) - new Date(a.publishDate);

/** Merge, letting Supabase posts shadow bundled ones with the same slug. */
const merge = (remote, local) => {
  const bySlug = new Map();
  local.forEach((post) => bySlug.set(post.slug, withSource(post)));
  remote.forEach((post) => bySlug.set(post.slug, post));
  return [...bySlug.values()].sort(byNewest);
};

/**
 * Published posts for the public site.
 *
 * Never throws: a failure here would blank the blog, and a stale-but-present
 * list is strictly better than an error page.
 */
export const fetchPublishedPosts = async () => {
  const local = getFilePosts();
  if (!isSupabaseConfigured) return merge([], local);

  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) throw error;
    return merge((data || []).map(normaliseRow), local);
  } catch (err) {
    console.warn('[posts] falling back to bundled posts:', err.message);
    return merge([], local);
  }
};

export const fetchPostBySlug = async (slug) => {
  const posts = await fetchPublishedPosts();
  return posts.find((post) => post.slug === slug) || null;
};

export const collectTags = (posts) => {
  const tags = new Set();
  posts.forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
  return [...tags].sort();
};

/** Every post including drafts. Admin-only — RLS rejects this for anon. */
export const fetchAllPostsForAdmin = async () => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(normaliseRow);
};

export const slugify = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

export const estimateReadingTime = (content) => {
  if (!content) return 1;
  return Math.max(1, Math.round(content.trim().split(/\s+/).length / 200));
};

/**
 * Parse an uploaded .md/.txt file into post fields.
 *
 * Accepts optional YAML-ish front matter; without it the first `# Heading`
 * becomes the title and the rest is the body, so a plain text file dropped
 * onto the editor still lands as a usable draft.
 */
export const parseDroppedFile = (filename, raw) => {
  const text = raw.replace(/\r\n/g, '\n');
  const fm = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);

  let meta = {};
  let body = text;

  if (fm) {
    body = fm[2];
    fm[1].split('\n').forEach((line) => {
      const at = line.indexOf(':');
      if (at === -1) return;
      const key = line.slice(0, at).trim();
      let value = line.slice(at + 1).trim().replace(/^["']|["']$/g, '');
      if (value.startsWith('[') && value.endsWith(']')) {
        meta[key] = value
          .slice(1, -1)
          .split(',')
          .map((v) => v.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      } else {
        meta[key] = value;
      }
    });
  }

  const heading = body.match(/^#\s+(.+)$/m);
  if (heading && !meta.title) {
    meta.title = heading[1].trim();
    body = body.replace(heading[0], '').trimStart();
  }

  const title = meta.title || filename.replace(/\.(md|txt|markdown)$/i, '');

  return {
    title,
    slug: meta.slug || slugify(title),
    excerpt: meta.excerpt || body.trim().split('\n\n')[0]?.slice(0, 200) || '',
    tags: Array.isArray(meta.tags) ? meta.tags : meta.tags ? [meta.tags] : [],
    heroImage: meta.heroImage || null,
    content: body.trim(),
  };
};
