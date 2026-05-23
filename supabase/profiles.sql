-- QuizFlag user profiles
-- Run in Supabase SQL Editor

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  created_at timestamp default now()
);

-- Case-insensitive username uniqueness
create unique index if not exists profiles_username_lower_idx on profiles (lower(username));

alter table profiles enable row level security;

-- Allow username availability checks before signup
create policy "Public username availability check"
  on profiles for select
  using (true);

-- Authenticated users can create their own profile row
create policy "Users insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Check if an email is registered (for password reset)
create or replace function public.email_exists(p_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from auth.users where lower(email) = lower(trim(p_email))
  );
$$;

grant execute on function public.email_exists(text) to anon, authenticated;
