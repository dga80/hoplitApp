-- Create a "profiles" table linked to auth.users
-- This table is automatically created via a trigger when a new user signs up (we'll add the trigger later)
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  username text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on profiles
alter table profiles enable row level security;

-- Policies for profiles
create policy "Users can view their own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on new signups
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -------------------------------------------------------------------------
-- DIET TABLES
-- -------------------------------------------------------------------------

-- Table for Diet Days (e.g., "Training Day", "Rest Day")
create table diet_days (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    name text not null, -- "DÍA ENTRENO", "DÍA DESCANSO"
    type text not null, -- "training", "rest"
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table diet_days enable row level security;

create policy "Users can crud their own diet days" on diet_days
  for all using (auth.uid() = user_id);

-- Table for Meals within a Diet Day
create table meals (
    id uuid default uuid_generate_v4() primary key,
    diet_day_id uuid references diet_days(id) on delete cascade not null,
    time text, -- "07:30"
    name text, -- "Desayuno Graso"
    foods text,
    quantity text,
    notes text,
    "order" integer -- To keep them sorted
);

alter table meals enable row level security;

create policy "Users can crud their own meals" on meals
  for all using (
    exists (
      select 1 from diet_days
      where diet_days.id = meals.diet_day_id
      and diet_days.user_id = auth.uid()
    )
  );

-- -------------------------------------------------------------------------
-- TRAINING TABLES
-- -------------------------------------------------------------------------

-- Table for Training Routines (e.g., "Monday", "Wednesday", "Friday")
create table training_routines (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    day_label text, -- "LUN", "MIE", "VIE"
    day_name text, -- "monday", "wednesday", "friday" (internal key)
    type text, -- "(Empuje)", "(Tirón)"
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table training_routines enable row level security;

create policy "Users can crud their own routines" on training_routines
  for all using (auth.uid() = user_id);

-- Table for Exercises within a Routine
create table exercises (
    id uuid default uuid_generate_v4() primary key,
    routine_id uuid references training_routines(id) on delete cascade not null,
    name text not null, -- "1. Sentadilla Trasera"
    sets text, -- "3 x 5-8"
    rest text, -- "3 min"
    rir text, -- "RIR 2"
    notes text,
    "order" integer
);

alter table exercises enable row level security;

create policy "Users can crud their own exercises" on exercises
  for all using (
    exists (
      select 1 from training_routines
      where training_routines.id = exercises.routine_id
      and training_routines.user_id = auth.uid()
    )
  );

-- -------------------------------------------------------------------------
-- PROGRESS TABLES
-- -------------------------------------------------------------------------

create table weight_logs (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    weight numeric not null,
    date date default CURRENT_DATE,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table weight_logs enable row level security;

create policy "Users can crud their own weight logs" on weight_logs
  for all using (auth.uid() = user_id);
