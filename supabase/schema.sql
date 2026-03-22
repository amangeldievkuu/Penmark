-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null default '',
  bio text default '',
  avatar_url text default '',
  website text default '',
  twitter text default '',
  github text default '',
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Blog posts
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content jsonb not null default '{}',
  excerpt text default '',
  cover_image_url text default '',
  published boolean not null default false,
  published_at timestamptz,
  author_id uuid references public.profiles(id) on delete set null,
  tags text[] default '{}',
  reading_time_minutes int default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Changelog entries
create table public.changelog_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  version text default '',
  type text not null default 'improvement' check (type in ('feature', 'improvement', 'fix', 'breaking')),
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.changelog_entries enable row level security;

-- RLS Policies
create policy "Public profiles readable" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Published posts public" on public.posts for select using (published = true);
create policy "Admins manage all posts" on public.posts for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "Changelog public read" on public.changelog_entries for select using (true);
create policy "Admins manage changelog" on public.changelog_entries for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Constraint: published posts must have published_at
alter table public.posts add constraint posts_published_at_check
  check (published = false or published_at is not null);

-- Indexes
create index posts_slug_idx on public.posts(slug);
create index posts_published_idx on public.posts(published, published_at desc);
create index posts_author_id_idx on public.posts(author_id);
create index posts_updated_at_idx on public.posts(updated_at desc);
create index changelog_published_at_idx on public.changelog_entries(published_at desc);

-- Auto-update updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function update_updated_at();
create trigger posts_updated_at before update on public.posts
  for each row execute function update_updated_at();

-- Create storage bucket for media
-- Run in Supabase dashboard: create bucket 'media' with public access
