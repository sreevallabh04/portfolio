-- ---------------------------------------------------------------------------
-- Blog posts: a write path that needs no git push and no site rebuild.
--
-- Run this in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
-- It is idempotent, so re-running it is safe.
--
-- !! DO THESE THREE THINGS IN ORDER — the last two are not optional !!
--
--   1. Run this file.
--
--   2. Create exactly one user:
--        Dashboard -> Authentication -> Users -> Add user
--        Use a 20+ character generated password. Tick "Auto Confirm User".
--
--   3. TURN OFF PUBLIC SIGNUPS:
--        Dashboard -> Authentication -> Sign In / Providers -> Email
--        -> disable "Allow new users to sign up"
--      Leave this on and anyone can register an account on your project.
--
--   4. Grant that user admin rights by UUID (copy it from the Users list):
--        insert into public.admin_users (user_id)
--        values ('00000000-0000-0000-0000-000000000000')
--        on conflict do nothing;
--
-- WHY UUID AND NOT EMAIL
-- An earlier draft of this file matched on `auth.jwt() ->> 'email'`. That is
-- unsafe: the email claim is user-mutable, so with public signups enabled an
-- attacker could register, change their address to the owner's, and inherit
-- write access. `auth.uid()` is the immutable primary key of auth.users and
-- cannot be reassigned by the account holder.
--
-- THREAT MODEL
-- The Supabase anon key ships inside the public JavaScript bundle. That is
-- unavoidable for a static SPA and is what the key is for, but it means every
-- table is reachable with curl whether or not anyone ever loads /admin. So the
-- UI gate protects nothing and these policies protect everything.
-- ---------------------------------------------------------------------------

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  added_at timestamptz not null default now()
);

-- No policies are defined, so with RLS on, clients can read nothing from this
-- table. Only the security-definer function below consults it.
alter table public.admin_users enable row level security;


create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  excerpt       text default '',
  content       text not null default '',
  hero_image    text,
  tags          text[] not null default '{}',
  status        text not null default 'draft' check (status in ('draft', 'published')),
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists posts_published_idx
  on public.posts (published_at desc)
  where status = 'published';

create index if not exists posts_slug_idx on public.posts (slug);


create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.touch_updated_at();


-- Stamp published_at on the first transition to published. Done here so the
-- date is correct regardless of which client performed the write.
create or replace function public.stamp_published_at()
returns trigger language plpgsql as $$
begin
  -- Stamp once, on the first publish, and never clear it. Clearing on
  -- unpublish meant that pulling a post back to fix a typo and republishing
  -- restamped it with today's date and silently reordered the blog.
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists posts_stamp_published_at on public.posts;
create trigger posts_stamp_published_at
  before insert or update on public.posts
  for each row execute function public.stamp_published_at();


-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.posts enable row level security;

-- security definer so the lookup is not itself blocked by admin_users' RLS.
-- search_path is pinned EMPTY with fully-qualified names inside. With it set to
-- 'public' a definer function can resolve unqualified names from a caller-
-- controlled schema.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

-- Readers see published posts only. Drafts are invisible to anon, which is the
-- single most important line in this file: get it wrong and every unfinished
-- post is public to anyone holding the anon key, which is everyone.
drop policy if exists "published posts are public" on public.posts;
create policy "published posts are public"
  on public.posts for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "admins read everything" on public.posts;
create policy "admins read everything"
  on public.posts for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admins insert" on public.posts;
create policy "admins insert"
  on public.posts for insert
  to authenticated
  with check (public.is_admin());

-- UPDATE needs both: `using` gates which rows may be targeted, `with check`
-- gates the row's state afterwards.
drop policy if exists "admins update" on public.posts;
create policy "admins update"
  on public.posts for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins delete" on public.posts;
create policy "admins delete"
  on public.posts for delete
  to authenticated
  using (public.is_admin());


-- A second, independent layer. A stock Supabase project already grants anon and
-- authenticated full CRUD on new tables in `public`, so RLS is the only thing
-- stopping writes by default. Revoking first means a policy mistake alone is
-- not enough to open a write path.
revoke all on public.posts from anon, authenticated;
grant select on public.posts to anon;
grant select, insert, update, delete on public.posts to authenticated;
revoke all on public.admin_users from anon, authenticated;


-- ---------------------------------------------------------------------------
-- Revision history. One row per edit, so a bad paste or an accidental
-- select-all is recoverable. Cheap: a single trigger and an append-only table.
-- ---------------------------------------------------------------------------
create table if not exists public.post_revisions (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts (id) on delete cascade,
  title       text,
  excerpt     text,
  content     text,
  tags        text[],
  saved_at    timestamptz not null default now()
);

create index if not exists post_revisions_post_idx
  on public.post_revisions (post_id, saved_at desc);

alter table public.post_revisions enable row level security;

drop policy if exists "admins read revisions" on public.post_revisions;
create policy "admins read revisions"
  on public.post_revisions for select
  to authenticated
  using (public.is_admin());

revoke all on public.post_revisions from anon, authenticated;
grant select on public.post_revisions to authenticated;

-- Snapshot the PREVIOUS version, and only when the writing actually changed —
-- autosave fires often and a revision per keystroke would be noise.
create or replace function public.snapshot_post_revision()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.content is distinct from new.content
     or old.title is distinct from new.title then
    insert into public.post_revisions (post_id, title, excerpt, content, tags)
    values (old.id, old.title, old.excerpt, old.content, old.tags);
  end if;
  return new;
end;
$$;

drop trigger if exists posts_snapshot_revision on public.posts;
create trigger posts_snapshot_revision
  before update on public.posts
  for each row execute function public.snapshot_post_revision();


-- ---------------------------------------------------------------------------
-- Verify before trusting it. Run these from a terminal, substituting your
-- project ref and anon key. The first must return only published posts; the
-- second must be rejected.
--
--   curl "https://<ref>.supabase.co/rest/v1/posts?select=slug,status" \
--        -H "apikey: <anon key>"
--
--   curl -X POST "https://<ref>.supabase.co/rest/v1/posts" \
--        -H "apikey: <anon key>" -H "Content-Type: application/json" \
--        -d '{"slug":"hack","title":"hack"}'
--
-- If the second one succeeds, stop and fix the policies before writing anything.
-- ---------------------------------------------------------------------------
