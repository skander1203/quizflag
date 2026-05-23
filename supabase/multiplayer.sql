-- QuizFlag multiplayer schema
-- Run in Supabase SQL Editor

create table if not exists game_rooms (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  host_name text not null,
  difficulty text not null,
  question_count integer not null,
  status text default 'waiting',
  questions jsonb,
  current_question integer default 0,
  start_time timestamp,
  created_at timestamp default now()
);

create table if not exists game_players (
  id uuid default gen_random_uuid() primary key,
  room_code text not null,
  player_name text not null,
  score integer default 0,
  answered boolean default false,
  created_at timestamp default now()
);

create table if not exists game_answers (
  id uuid default gen_random_uuid() primary key,
  room_code text not null,
  player_name text not null,
  question_index integer not null,
  is_correct boolean not null,
  time_taken integer not null,
  created_at timestamp default now()
);

-- Enable Realtime (required for live updates)
alter publication supabase_realtime add table game_rooms;
alter publication supabase_realtime add table game_players;
alter publication supabase_realtime add table game_answers;

-- Allow anonymous access (match leaderboard setup)
alter table game_rooms enable row level security;
alter table game_players enable row level security;
alter table game_answers enable row level security;

create policy "Allow all on game_rooms" on game_rooms for all using (true) with check (true);
create policy "Allow all on game_players" on game_players for all using (true) with check (true);
create policy "Allow all on game_answers" on game_answers for all using (true) with check (true);
