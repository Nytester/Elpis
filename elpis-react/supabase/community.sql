-- Community feed: app-wide posts/comments/likes, patient/caregiver-only,
-- zero provider access (enforced at the RLS/storage layer, not just routing),
-- no moderator role — auto-hides once 3 distinct patients report a post.

-- ============================================================================
-- Storage bucket — created via SQL so it's versioned with the rest of the
-- schema. PRIVATE: a public bucket would let anyone with a leaked URL
-- (including a provider) view patient photos with zero auth check, which
-- contradicts "providers have no access, not even read." Client fetches
-- images via signed URLs instead of a public URL.
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community-photos', 'community-photos', false,
  5242880, -- 5 MB
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do nothing;

-- ============================================================================
-- community_posts
-- ============================================================================
create table community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id),
  author_name text not null,
  caption text check (caption is null or char_length(caption) <= 2000),
  image_path text,
  created_at timestamptz not null default now(),
  hidden boolean not null default false,
  constraint community_posts_has_content check (
    (caption is not null and btrim(caption) <> '') or image_path is not null
  )
);
alter table community_posts enable row level security;

create index on community_posts (created_at desc);
create index on community_posts (author_id);
create index on community_posts (image_path) where image_path is not null;

-- Two permissive SELECT policies OR together (same pattern already used on
-- `profiles`: "self select" OR "provider reads assigned patients' profiles").
create policy "patients read non-hidden posts" on community_posts for select
  using (
    not hidden
    and exists (select 1 from profiles where id = (select auth.uid()) and role in ('patient','caregiver'))
  );
create policy "authors read their own posts even if hidden" on community_posts for select
  using (author_id = (select auth.uid()));

-- No INSERT/UPDATE policy — only create_community_post() and
-- report_community_post() below ever write rows / flip `hidden`.
create policy "authors delete their own posts" on community_posts for delete
  using (author_id = (select auth.uid()));

-- ============================================================================
-- community_comments
-- ============================================================================
create table community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references community_posts(id) on delete cascade,
  author_id uuid not null references profiles(id),
  author_name text not null,
  body text not null check (btrim(body) <> '' and char_length(body) <= 1000),
  created_at timestamptz not null default now()
);
alter table community_comments enable row level security;

create index on community_comments (post_id, created_at);

-- A comment is readable only if its parent post is readable to this caller
-- (not hidden, or hidden-but-mine) — composes through community_posts' own
-- RLS via the subquery.
create policy "patients read comments on visible posts" on community_comments for select
  using (
    exists (select 1 from profiles where id = (select auth.uid()) and role in ('patient','caregiver'))
    and post_id in (select id from community_posts)
  );

-- No client INSERT — only create_community_comment() below.
create policy "authors delete their own comments" on community_comments for delete
  using (author_id = (select auth.uid()));

-- ============================================================================
-- community_likes
-- ============================================================================
create table community_likes (
  post_id uuid not null references community_posts(id) on delete cascade,
  user_id uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
alter table community_likes enable row level security;

create policy "patients read likes on visible posts" on community_likes for select
  using (
    exists (select 1 from profiles where id = (select auth.uid()) and role in ('patient','caregiver'))
    and post_id in (select id from community_posts)
  );
create policy "patients insert own like" on community_likes for insert
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from profiles where id = (select auth.uid()) and role in ('patient','caregiver'))
    and post_id in (select id from community_posts) -- can't like a post you can't see
  );
create policy "patients delete own like" on community_likes for delete
  using (user_id = (select auth.uid()));

-- ============================================================================
-- community_post_reports
-- ============================================================================
create table community_post_reports (
  post_id uuid not null references community_posts(id) on delete cascade,
  reporter_id uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  primary key (post_id, reporter_id)
);
alter table community_post_reports enable row level security;

-- Deliberately narrow: reporters see only their own report rows. Not even the
-- author can see who reported them or how many reports exist — that only
-- ever surfaces indirectly via community_posts.hidden.
create policy "patients read their own reports" on community_post_reports for select
  using (reporter_id = (select auth.uid()));
-- No client INSERT — only report_community_post() below.

-- ============================================================================
-- RPCs — every one gets `set search_path = public` (this codebase has already
-- been bitten by omitting it: see fix_trigger.sql). SECURITY DEFINER bypasses
-- RLS entirely, so every authorization check is re-stated explicitly here
-- rather than relying on table policies — same pattern as
-- mark_refill_handled / provider_create_patient_with_invite.
-- ============================================================================

create or replace function create_community_post(p_caption text, p_image_path text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_id uuid;
begin
  select full_name into v_name from profiles where id = auth.uid() and role in ('patient','caregiver');
  if v_name is null then
    raise exception 'Only patients or caregivers can post';
  end if;

  if (p_caption is null or btrim(p_caption) = '') and (p_image_path is null or btrim(p_image_path) = '') then
    raise exception 'Post must include a caption or a photo';
  end if;

  -- A caller may only attach a photo from their own upload folder — otherwise
  -- they could pass a path merely observed in someone else's post and
  -- "re-post" it as their own image.
  if p_image_path is not null and p_image_path not like (auth.uid()::text || '/%') then
    raise exception 'Invalid image path';
  end if;

  insert into community_posts (author_id, author_name, caption, image_path)
  values (auth.uid(), v_name, nullif(btrim(p_caption), ''), p_image_path)
  returning id into v_id;

  return v_id;
end;
$$;
grant execute on function create_community_post(text, text) to authenticated;

create or replace function create_community_comment(p_post_id uuid, p_body text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_id uuid;
begin
  select full_name into v_name from profiles where id = auth.uid() and role in ('patient','caregiver');
  if v_name is null then
    raise exception 'Only patients or caregivers can comment';
  end if;

  if p_body is null or btrim(p_body) = '' then
    raise exception 'Comment cannot be empty';
  end if;

  if not exists (select 1 from community_posts where id = p_post_id and not hidden) then
    raise exception 'Post not found or unavailable';
  end if;

  insert into community_comments (post_id, author_id, author_name, body)
  values (p_post_id, auth.uid(), v_name, btrim(p_body))
  returning id into v_id;

  return v_id;
end;
$$;
grant execute on function create_community_comment(uuid, text) to authenticated;

create or replace function report_community_post(p_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_author_id uuid;
  v_count int;
begin
  if not exists (select 1 from profiles where id = auth.uid() and role in ('patient','caregiver')) then
    raise exception 'Only patients or caregivers can report posts';
  end if;

  -- Lock the target post row first so concurrent reporters of the SAME post
  -- are serialized. Without this, 3 simultaneous reports can each run
  -- count() before any insert commits, each seeing < 3, and none of them
  -- flips `hidden` even though the true post-commit count is 3.
  select author_id into v_author_id from community_posts where id = p_post_id for update;
  if not found then
    raise exception 'Post not found';
  end if;

  if v_author_id = auth.uid() then
    raise exception 'Cannot report your own post';
  end if;

  insert into community_post_reports (post_id, reporter_id)
  values (p_post_id, auth.uid())
  on conflict (post_id, reporter_id) do nothing;

  select count(*) into v_count from community_post_reports where post_id = p_post_id;

  if v_count >= 3 then
    update community_posts set hidden = true where id = p_post_id;
  end if;
end;
$$;
grant execute on function report_community_post(uuid) to authenticated;

-- ============================================================================
-- Storage RLS (storage.objects) — private bucket, so these are the ONLY way
-- to read/write. SELECT reuses community_posts' own visibility via the same
-- subquery-composition trick as community_comments above.
-- ============================================================================
create policy "community photos: read own-visible-post images" on storage.objects for select
  using (
    bucket_id = 'community-photos'
    and exists (select 1 from community_posts where image_path = storage.objects.name)
  );

create policy "community photos: upload to own folder" on storage.objects for insert
  with check (
    bucket_id = 'community-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (select 1 from profiles where id = (select auth.uid()) and role in ('patient','caregiver'))
  );

create policy "community photos: delete own objects" on storage.objects for delete
  using (
    bucket_id = 'community-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ============================================================================
-- Realtime
-- ============================================================================
alter publication supabase_realtime add table community_posts, community_comments, community_likes;
