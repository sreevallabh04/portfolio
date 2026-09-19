import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Plus, Save, Trash2, Eye, Pencil, UploadCloud, Sparkles,
  Globe, FileText, Loader2, ExternalLink, AlertCircle, Check,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchAllPostsForAdmin, slugify, parseDroppedFile, estimateReadingTime } from '@/lib/posts';
import { suggestPostMeta, isAiConfigured } from '@/lib/ai';

const BLANK = {
  id: null,
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  heroImage: '',
  tags: [],
  status: 'draft',
};

const toRow = (draft) => ({
  slug: draft.slug || slugify(draft.title) || 'untitled',
  title: draft.title || 'Untitled',
  excerpt: draft.excerpt || '',
  content: draft.content || '',
  hero_image: draft.heroImage || null,
  tags: draft.tags || [],
  status: draft.status,
});

/**
 * Writing surface for the blog.
 *
 * Publishing writes a row to Supabase and the public site reads posts at
 * runtime, so a post is live the moment it is saved — no git push, no rebuild.
 *
 * Three ways in: type here, drop a .md/.txt file onto the editor, or paste.
 * Drafts autosave every few seconds once a post exists, because the previous
 * console had no error or loading UI at all and silent failure means lost
 * writing.
 */
const PostEditor = () => {
  const [posts, setPosts] = useState([]);
  const [draft, setDraft] = useState(BLANK);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ kind: 'idle', message: '' });
  const [preview, setPreview] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const fileInputRef = useRef(null);

  const say = useCallback((kind, message) => {
    setStatus({ kind, message });
    if (kind !== 'error') setTimeout(() => setStatus({ kind: 'idle', message: '' }), 3000);
  }, []);

  const load = useCallback(async () => {
    try {
      setPosts(await fetchAllPostsForAdmin());
    } catch (err) {
      say('error', `Could not load posts: ${err.message}`);
    }
  }, [say]);

  useEffect(() => {
    load();
  }, [load]);

  const update = (patch) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const save = useCallback(
    async (overrides = {}, { silent = false } = {}) => {
      if (!isSupabaseConfigured) {
        say('error', 'Supabase is not configured — nothing would be saved.');
        return null;
      }
      const next = { ...draft, ...overrides };
      if (!next.title.trim() && !next.content.trim()) return null;

      setSaving(true);
      try {
        const row = toRow(next);
        let saved;
        if (next.id) {
          const { data, error } = await supabase
            .from('posts').update(row).eq('id', next.id).select().single();
          if (error) throw error;
          saved = data;
        } else {
          const { data, error } = await supabase
            .from('posts').insert([row]).select().single();
          if (error) throw error;
          saved = data;
        }
        setDraft((prev) => ({ ...prev, ...next, id: saved.id, slug: saved.slug }));
        setDirty(false);
        await load();
        if (!silent) say('ok', next.status === 'published' ? 'Published — live now' : 'Draft saved');
        return saved;
      } catch (err) {
        // A unique-violation on slug is the common one and worth naming.
        const message = err.code === '23505'
          ? 'That slug is already used by another post.'
          : err.message;
        say('error', `Save failed: ${message}`);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [draft, load, say]
  );

  // Autosave, but only for posts that already exist — creating rows on every
  // keystroke of a brand-new post would litter the table with junk.
  useEffect(() => {
    if (!dirty || !draft.id || saving) return undefined;
    const timer = setTimeout(() => save({}, { silent: true }), 2500);
    return () => clearTimeout(timer);
  }, [dirty, draft, saving, save]);

  const openPost = (post) => {
    setDraft({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      heroImage: post.heroImage || '',
      tags: post.tags || [],
      status: post.status || 'draft',
    });
    setDirty(false);
    setPreview(false);
  };

  const remove = async (post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    if (error) return say('error', `Delete failed: ${error.message}`);
    if (draft.id === post.id) setDraft(BLANK);
    await load();
    say('ok', 'Deleted');
  };

  const ingestFiles = useCallback(async (files) => {
    const file = files?.[0];
    if (!file) return;
    if (!/\.(md|txt|markdown)$/i.test(file.name)) {
      return say('error', 'Drop a .md, .markdown or .txt file.');
    }
    const parsed = parseDroppedFile(file.name, await file.text());
    setDraft({ ...BLANK, ...parsed, heroImage: parsed.heroImage || '' });
    setDirty(true);
    setPreview(false);
    say('ok', `Loaded ${file.name} — review, then publish`);
  }, [say]);

  const runAi = async () => {
    if (!draft.content.trim()) return say('error', 'Write something first.');
    setAiBusy(true);
    try {
      const meta = await suggestPostMeta({ title: draft.title, content: draft.content });
      update({
        title: draft.title || meta.title || '',
        excerpt: meta.excerpt || draft.excerpt,
        tags: meta.tags?.length ? meta.tags : draft.tags,
        slug: draft.slug || slugify(meta.title || draft.title || ''),
      });
      say('ok', 'Suggestions applied');
    } catch (err) {
      say('error', err.message);
    } finally {
      setAiBusy(false);
    }
  };

  const wordCount = useMemo(
    () => (draft.content.trim() ? draft.content.trim().split(/\s+/).length : 0),
    [draft.content]
  );

  const inputCls =
    'w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none';

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      {/* Post list */}
      <aside className="flex max-h-56 w-full flex-col border-b border-zinc-800 bg-zinc-950 md:max-h-none md:w-80 md:border-b-0 md:border-r lg:w-96">
        <div className="flex items-center justify-between border-b border-zinc-800 p-4">
          <h2 className="font-semibold text-white">Posts</h2>
          <button
            onClick={() => { setDraft(BLANK); setDirty(false); setPreview(false); }}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            <Plus size={15} /> New
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto">
          {posts.length === 0 && (
            <li className="p-4 text-sm text-zinc-500">
              No posts yet. Hit <span className="text-zinc-300">New</span>, or drop a
              markdown file onto the editor.
            </li>
          )}
          {posts.map((post) => (
            <li key={post.id}>
              <button
                onClick={() => openPost(post)}
                className={`flex w-full items-start gap-3 border-l-2 p-3 text-left transition-colors hover:bg-zinc-900 ${
                  draft.id === post.id
                    ? 'border-l-red-500 bg-zinc-900'
                    : 'border-l-transparent'
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-white">
                    {post.title || 'Untitled'}
                  </span>
                  <span className="mt-1 flex items-center gap-2 text-[11px]">
                    <span
                      className={`rounded-full px-1.5 py-0.5 font-medium ${
                        post.status === 'published'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-amber-500/15 text-amber-400'
                      }`}
                    >
                      {post.status}
                    </span>
                    <span className="truncate text-zinc-500">/{post.slug}</span>
                  </span>
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Delete ${post.title}`}
                  onClick={(e) => { e.stopPropagation(); remove(post); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); remove(post); } }}
                  className="mt-0.5 rounded p-1 text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Editor */}
      <section
        className="relative flex min-h-0 flex-1 flex-col"
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); ingestFiles(e.dataTransfer.files); }}
      >
        {dragging && (
          <div className="absolute inset-3 z-20 flex items-center justify-center rounded-xl border-2 border-dashed border-red-500 bg-black/80">
            <p className="flex items-center gap-2 font-medium text-white">
              <UploadCloud size={20} /> Drop to load this file
            </p>
          </div>
        )}

        {/* Toolbar */}
        <header className="flex flex-wrap items-center gap-2 border-b border-zinc-800 p-3">
          <button
            onClick={() => setPreview((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-white transition-colors hover:bg-zinc-700"
          >
            {preview ? <Pencil size={14} /> : <Eye size={14} />}
            {preview ? 'Edit' : 'Preview'}
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-white transition-colors hover:bg-zinc-700"
          >
            <UploadCloud size={14} /> Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.txt"
            className="hidden"
            onChange={(e) => ingestFiles(e.target.files)}
          />

          {isAiConfigured && (
            <button
              onClick={runAi}
              disabled={aiBusy}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
            >
              {aiBusy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Suggest meta
            </button>
          )}

          <span className="ml-auto flex items-center gap-2 text-xs text-zinc-500">
            {wordCount} words &middot; {estimateReadingTime(draft.content)} min
          </span>

          <button
            onClick={() => save({ status: 'draft' })}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save draft
          </button>

          <button
            onClick={() => save({ status: draft.status === 'published' ? 'draft' : 'published' })}
            disabled={saving}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
              draft.status === 'published'
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {draft.status === 'published' ? <FileText size={14} /> : <Globe size={14} />}
            {draft.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
        </header>

        {status.kind !== 'idle' && (
          <div
            className={`flex items-center gap-2 px-4 py-2 text-sm ${
              status.kind === 'error'
                ? 'bg-red-500/10 text-red-300'
                : 'bg-emerald-500/10 text-emerald-300'
            }`}
          >
            {status.kind === 'error' ? <AlertCircle size={14} /> : <Check size={14} />}
            {status.message}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {preview ? (
            <article className="prose prose-invert prose-sm mx-auto max-w-3xl prose-headings:text-white prose-a:text-red-400">
              <h1>{draft.title || 'Untitled'}</h1>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft.content}</ReactMarkdown>
            </article>
          ) : (
            <div className="mx-auto max-w-3xl space-y-3">
              <input
                value={draft.title}
                onChange={(e) => {
                  const title = e.target.value;
                  update({ title, slug: draft.id ? draft.slug : slugify(title) });
                }}
                placeholder="Post title"
                className="w-full bg-transparent text-2xl font-bold text-white placeholder-zinc-600 focus:outline-none"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs text-zinc-500">Slug</span>
                  <input value={draft.slug} onChange={(e) => update({ slug: e.target.value })}
                    placeholder="my-post" className={inputCls} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-zinc-500">Tags (comma separated)</span>
                  <input
                    value={draft.tags.join(', ')}
                    onChange={(e) =>
                      update({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })
                    }
                    placeholder="ai, rag, notes" className={inputCls}
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs text-zinc-500">Hero image URL (optional)</span>
                <input value={draft.heroImage} onChange={(e) => update({ heroImage: e.target.value })}
                  placeholder="/photo1.jpg" className={inputCls} />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs text-zinc-500">Excerpt</span>
                <textarea value={draft.excerpt} onChange={(e) => update({ excerpt: e.target.value })}
                  rows={2} placeholder="One or two lines for the card and previews."
                  className={`${inputCls} resize-none`} />
              </label>

              <textarea
                value={draft.content}
                onChange={(e) => update({ content: e.target.value })}
                placeholder={'Write in markdown.\n\nOr drag a .md / .txt file anywhere onto this panel.'}
                className="min-h-[24rem] w-full resize-y rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 font-mono text-sm leading-relaxed text-zinc-100 placeholder-zinc-600 focus:border-red-500 focus:outline-none"
              />

              {draft.status === 'published' && draft.slug && (
                <a
                  href={`/blog/${draft.slug}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300"
                >
                  <ExternalLink size={14} /> View live post
                </a>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PostEditor;
