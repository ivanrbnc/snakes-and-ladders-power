-- Migration 001: Create rooms table and enable Realtime

create table if not exists public.rooms (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- Create the Realtime publication if missing
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

-- Add rooms table to Realtime
do $$
begin
  alter publication supabase_realtime add table rooms;
exception
  when duplicate_object then null;
end $$;

-- Enable RLS with public access
alter table public.rooms enable row level security;

drop policy if exists "Allow public access to rooms" on public.rooms;
create policy "Allow public access to rooms" on public.rooms
  for all using (true) with check (true);
