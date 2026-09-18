-- Old addresses of renamed posts, so a published URL never breaks.
--
-- When a published post's slug changes in /admin, the old slug is
-- recorded here and /blog/<old-slug> answers with a permanent redirect
-- to the new address. Without it a rename turns every link already out
-- in the world into a 404, and throws away whatever ranking the page had
-- earned at its old URL.
--
-- The app treats a missing table as "no redirects", so this is safe to
-- apply at any time; renames only start being recorded once it exists.

create table if not exists public.post_redirects (
  from_slug  text primary key,
  -- ON UPDATE CASCADE is what keeps redirects one hop long: rename a post
  -- from A to B and then to C, and the A row is re-pointed at C by the
  -- database, instead of sending a reader A -> B -> C.
  -- ON DELETE CASCADE drops a deleted post's old addresses with it, so
  -- they 404 like the post does rather than redirecting to nothing.
  to_slug    text not null
             references public.posts (slug) on update cascade on delete cascade,
  created_at timestamptz not null default now()
);

-- The cascades above look rows up by `to_slug`.
create index if not exists post_redirects_to_slug_idx
  on public.post_redirects (to_slug);

alter table public.post_redirects enable row level security;

-- The public site reads this with the publishable key, but only rows
-- whose target is a PUBLISHED post. `posts` has its own RLS, so for this
-- key the subquery already sees published rows only; the explicit
-- `draft = false` says so rather than relying on it. A post unpublished
-- after a rename therefore leaks neither its redirect nor its new slug.
drop policy if exists "Redirects to published posts are public"
  on public.post_redirects;
create policy "Redirects to published posts are public"
  on public.post_redirects
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.posts p
      where p.slug = post_redirects.to_slug
        and p.draft = false
    )
  );

-- Writes come only from /admin, with the secret key, which bypasses RLS.
grant select on public.post_redirects to anon, authenticated;
grant all on public.post_redirects to service_role;
