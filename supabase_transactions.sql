-- Create a table for transactions
create table if not exists transactions (
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
