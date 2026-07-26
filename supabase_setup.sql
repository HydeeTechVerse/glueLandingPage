-- Run this in Supabase → SQL Editor → New Query

create table waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now(),
  source text default 'landing_page'
);

-- Enable Row Level Security
alter table waitlist enable row level security;

-- Allow anyone (anon key) to INSERT only — no one can read, update, or delete rows from the client
create policy "Allow public insert"
  on waitlist for insert
  to anon
  with check (true);

-- Optional: prevent duplicate signups from erroring the whole request
-- (Supabase will throw a unique-violation error on repeat emails — the frontend below handles that gracefully)