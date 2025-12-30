-- Table for tracking exercise history (weight, completion)
create table exercise_logs (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    exercise_id uuid references exercises(id) on delete cascade not null,
    weight numeric,
    completed boolean default false,
    date date default CURRENT_DATE,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table exercise_logs enable row level security;

create policy "Users can crud their own exercise logs" on exercise_logs
  for all using (auth.uid() = user_id);
