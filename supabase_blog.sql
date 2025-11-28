-- Add is_admin column to profiles table FIRST (before creating policies that use it)
alter table profiles add column if not exists is_admin boolean default false;

-- Create a table for blog articles
create table blog_articles (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  excerpt text,
  content text not null,
  author_id uuid references auth.users not null,
  author_name text not null,
  category text default 'Actualités',
  featured_image_url text,
  published boolean default false,
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table blog_articles enable row level security;

-- Everyone can view published articles
create policy "Published articles are viewable by everyone." on blog_articles
  for select using (published = true);

-- Only admins can view all articles (including unpublished)
create policy "Admins can view all articles." on blog_articles
  for select using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- Only admins can insert articles
create policy "Admins can insert articles." on blog_articles
  for insert with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- Only admins can update articles
create policy "Admins can update articles." on blog_articles
  for update using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- Only admins can delete articles
create policy "Admins can delete articles." on blog_articles
  for delete using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger to update updated_at on blog_articles
create trigger update_blog_articles_updated_at
  before update on blog_articles
  for each row
  execute procedure update_updated_at_column();

