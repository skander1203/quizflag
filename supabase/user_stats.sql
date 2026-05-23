-- QuizFlag user statistics
-- Run in Supabase SQL Editor

create table if not exists user_stats (
  id uuid references auth.users on delete cascade primary key,
  games_played integer default 0 not null,
  correct_answers integer default 0 not null,
  wrong_answers integer default 0 not null,
  total_points integer default 0 not null,
  best_score integer default 0 not null,
  stats_per_difficulty jsonb default '{}' not null,
  updated_at timestamp default now() not null
);

alter table user_stats enable row level security;

create policy "Users read own stats"
  on user_stats for select
  using (auth.uid() = id);

create policy "Users insert own stats"
  on user_stats for insert
  with check (auth.uid() = id);

create policy "Users update own stats"
  on user_stats for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
