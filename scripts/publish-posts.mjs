#!/usr/bin/env node
/**
 * Write a markdown file, save it, and it's live. No git, no build.
 *
 *   npm run write            watch content/drafts/ and publish on save
 *   npm run write -- --once  publish everything in content/drafts/ once
 *   npm run write -- --unpublish <slug>
 *
 * Credentials come from .env.local (gitignored), loaded by Node's own
 * --env-file. It signs in as the SAME ordinary user the browser uses, so every
 * write goes through exactly the row-level security policies in
 * supabase/migrations/001_posts.sql. A service_role key would bypass RLS
 * entirely and must never appear here.
 *
 * Deliberately NOT mirroring deletes: an editor's atomic save-via-rename, or a
 * stray file move, would otherwise silently unpublish a live post. Removing a
 * post is an explicit --unpublish.
 */
import { createClient } from '@supabase/supabase-js';
import { readFile, readdir, stat } from 'node:fs/promises';
import { watch } from 'node:fs';
import { join, extname, basename } from 'node:path';

const DRAFTS_DIR = 'content/drafts';
const EXTENSIONS = new Set(['.md', '.markdown', '.txt']);

const {
  VITE_SUPABASE_URL: URL,
  VITE_SUPABASE_ANON_KEY: ANON_KEY,
  BLOG_ADMIN_EMAIL: EMAIL,
  BLOG_ADMIN_PASSWORD: PASSWORD,
} = process.env;

const die = (message) => {
  console.error(`\n  ${message}\n`);
  process.exit(1);
};

if (!URL || !ANON_KEY) die('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
if (!EMAIL || !PASSWORD) die('Set BLOG_ADMIN_EMAIL and BLOG_ADMIN_PASSWORD in .env.local');

const supabase = createClient(URL, ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ---------------------------------------------------------------------------
// Parsing. Kept self-contained on purpose: importing src/lib/posts.js would
// pull in the '@' alias (which Node cannot resolve) and import.meta.glob.
// ---------------------------------------------------------------------------
const slugify = (title) =>
  title.toLowerCase().trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const parse = (filename, raw) => {
  const text = raw.replace(/\r\n/g, '\n');
  const fm = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  const meta = {};
  let body = text;

  if (fm) {
    body = fm[2];
    for (const line of fm[1].split('\n')) {
      const at = line.indexOf(':');
      if (at === -1) continue;
      const key = line.slice(0, at).trim();
      const value = line.slice(at + 1).trim().replace(/^["']|["']$/g, '');
      meta[key] = value.startsWith('[') && value.endsWith(']')
        ? value.slice(1, -1).split(',').map((v) => v.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
        : value;
    }
  }

  const heading = body.match(/^#\s+(.+)$/m);
  if (heading && !meta.title) {
    meta.title = heading[1].trim();
    body = body.replace(heading[0], '').trimStart();
  }

  const title = meta.title || basename(filename, extname(filename));
  const tags = Array.isArray(meta.tags) ? meta.tags : meta.tags ? [meta.tags] : [];

  return {
    slug: meta.slug || slugify(title),
    title,
    excerpt: meta.excerpt || body.trim().split('\n\n')[0]?.slice(0, 200) || '',
    content: body.trim(),
    hero_image: meta.heroImage || null,
    tags,
    // `draft: true` in front matter keeps it unpublished so you can park a
    // work in progress in the same folder.
    status: String(meta.draft).toLowerCase() === 'true' ? 'draft' : 'published',
  };
};

// ---------------------------------------------------------------------------
const publish = async (path) => {
  const row = parse(path, await readFile(path, 'utf8'));
  if (!row.content.trim()) {
    console.log(`  skipped  ${basename(path)} (empty)`);
    return;
  }

  const { error } = await supabase
    .from('posts')
    .upsert(row, { onConflict: 'slug' })
    .select('slug')
    .single();

  if (error) {
    console.error(`  FAILED   ${basename(path)} — ${error.message}`);
    return;
  }
  const mark = row.status === 'published' ? 'published' : 'draft    ';
  console.log(`  ${mark} /blog/${row.slug}`);
};

const publishAll = async () => {
  let files;
  try {
    files = await readdir(DRAFTS_DIR);
  } catch {
    die(`No ${DRAFTS_DIR}/ directory. Create it and drop a .md file in.`);
  }
  const targets = files.filter((f) => EXTENSIONS.has(extname(f).toLowerCase()));
  if (targets.length === 0) return console.log(`  nothing in ${DRAFTS_DIR}/`);
  for (const file of targets) await publish(join(DRAFTS_DIR, file));
};

const unpublish = async (slug) => {
  const { error } = await supabase.from('posts').update({ status: 'draft' }).eq('slug', slug);
  if (error) die(`Could not unpublish ${slug}: ${error.message}`);
  console.log(`  unpublished /blog/${slug}`);
};

// ---------------------------------------------------------------------------
const main = async () => {
  const args = process.argv.slice(2);

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  });
  if (authError) die(`Sign-in failed: ${authError.message}`);
  console.log(`\n  signed in as ${EMAIL}`);

  const unpublishAt = args.indexOf('--unpublish');
  if (unpublishAt !== -1) {
    const slug = args[unpublishAt + 1];
    if (!slug) die('Usage: npm run write -- --unpublish <slug>');
    await unpublish(slug);
    return;
  }

  await publishAll();

  if (!args.includes('--watch')) return;

  console.log(`  watching ${DRAFTS_DIR}/ — save a file to publish it. Ctrl-C to stop.\n`);

  // Editors often write a file two or three times in quick succession
  // (truncate, write, rename). Debounce per path so one save is one publish.
  const pending = new Map();
  watch(DRAFTS_DIR, { recursive: true }, (_event, filename) => {
    if (!filename || !EXTENSIONS.has(extname(filename).toLowerCase())) return;
    const path = join(DRAFTS_DIR, filename);
    clearTimeout(pending.get(path));
    pending.set(
      path,
      setTimeout(async () => {
        pending.delete(path);
        // A rename away fires the same event; ignore paths that vanished
        // rather than treating them as a delete.
        try {
          await stat(path);
        } catch {
          return;
        }
        await publish(path);
      }, 400)
    );
  });
};

main().catch((err) => die(err.message));
