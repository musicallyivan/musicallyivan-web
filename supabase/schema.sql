create table if not exists public.profiles (
	id uuid primary key references auth.users(id) on delete cascade,
	display_name text not null,
	role text not null default 'user' check (role in ('user', 'admin')),
	provider text not null default 'email',
	created_at timestamptz not null default now()
);

create table if not exists public.community_posts (
	id uuid primary key default gen_random_uuid(),
	user_id uuid references auth.users(id) on delete set null,
	author_name text not null default 'Anonimo',
	provider text not null default 'anon',
	message text not null check (char_length(message) <= 360),
	is_anonymous boolean not null default true,
	is_hidden boolean not null default false,
	created_at timestamptz not null default now()
);

create table if not exists public.tiktok_requests (
	id uuid primary key default gen_random_uuid(),
	user_id uuid references auth.users(id) on delete set null,
	name text,
	email text,
	message text not null,
	done boolean not null default false,
	created_at timestamptz not null default now()
);

create table if not exists public.site_events (
	id uuid primary key default gen_random_uuid(),
	event_type text not null check (event_type in ('visit', 'follow')),
	visitor_id text,
	user_id uuid references auth.users(id) on delete set null,
	created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.community_posts enable row level security;
alter table public.tiktok_requests enable row level security;
alter table public.site_events enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
	select exists (
		select 1
		from public.profiles
		where id = auth.uid()
		and role = 'admin'
	);
$$;

drop policy if exists "profiles are readable" on public.profiles;
create policy "profiles are readable"
on public.profiles for select
using (true);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "visible community posts are readable" on public.community_posts;
create policy "visible community posts are readable"
on public.community_posts for select
using (is_hidden = false or public.is_admin());

drop policy if exists "anyone can create community posts" on public.community_posts;
create policy "anyone can create community posts"
on public.community_posts for insert
with check (true);

drop policy if exists "admins can moderate community posts" on public.community_posts;
create policy "admins can moderate community posts"
on public.community_posts for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can delete community posts" on public.community_posts;
create policy "admins can delete community posts"
on public.community_posts for delete
using (public.is_admin());

drop policy if exists "users can create tiktok requests" on public.tiktok_requests;
create policy "users can create tiktok requests"
on public.tiktok_requests for insert
with check (true);

drop policy if exists "admins can read tiktok requests" on public.tiktok_requests;
create policy "admins can read tiktok requests"
on public.tiktok_requests for select
using (public.is_admin());

drop policy if exists "admins can update tiktok requests" on public.tiktok_requests;
create policy "admins can update tiktok requests"
on public.tiktok_requests for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can delete tiktok requests" on public.tiktok_requests;
create policy "admins can delete tiktok requests"
on public.tiktok_requests for delete
using (public.is_admin());

drop policy if exists "anyone can create site events" on public.site_events;
create policy "anyone can create site events"
on public.site_events for insert
with check (true);

drop policy if exists "anyone can read site events" on public.site_events;
create policy "anyone can read site events"
on public.site_events for select
using (true);
