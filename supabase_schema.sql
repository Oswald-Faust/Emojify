-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  credits int default 6,
  is_pro boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create a table for gallery items
create table gallery (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  url text, -- for image url
  video_url text, -- for video url
  prompt text, -- original image or prompt
  style text,
  mood text,
  media_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS for gallery
alter table gallery enable row level security;

create policy "Users can view their own gallery items." on gallery
  for select using (auth.uid() = user_id);

create policy "Users can insert their own gallery items." on gallery
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own gallery items." on gallery
  for delete using (auth.uid() = user_id);

-- Create a table for transactions
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  amount int not null,
  currency text default 'XOF',
  credits_added int not null,
  plan_name text,
  provider text, -- 'stripe' or 'paystack'
  status text default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS for transactions
alter table transactions enable row level security;

create policy "Users can view their own transactions." on transactions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own transactions." on transactions
  for insert with check (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, credits)
  values (new.id, new.email, 6);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
