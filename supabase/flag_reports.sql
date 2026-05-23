-- QuizFlag flag reports
-- Run in Supabase SQL Editor

create table if not exists flag_reports (
  id uuid default gen_random_uuid() primary key,
  country_iso text not null,
  country_name text not null,
  reported_at timestamp default now(),
  user_id uuid references auth.users
);

alter table flag_reports enable row level security;

create policy "Authenticated users can insert flag reports"
  on flag_reports for insert
  to authenticated
  with check (auth.uid() = user_id or user_id is null);

create policy "Guests can insert flag reports without user_id"
  on flag_reports for insert
  to anon
  with check (user_id is null);
