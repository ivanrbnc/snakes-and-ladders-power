# LDR Snakes & Ladders - Client

A romantic, multiplayer Snakes and Ladders game designed for long-distance couples. Built with React, Vite, Framer Motion, and Supabase.

## 🚀 Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Create a `.env` file in the `client` directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 🛠️ Supabase Backend Setup

To use Supabase as the game server, follow these steps in your Supabase Dashboard:

### 1. Database Schema & Policies
Run the following script in the **SQL Editor**:

```sql
-- 1. Create the rooms table
create table if not exists public.rooms (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- 2. Create the Realtime publication if it's missing
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

-- 3. Add the rooms table to Realtime
do $$
begin
  alter publication supabase_realtime add table rooms;
exception
  when duplicate_object then
    null; -- Ignore if it's already there
end $$;

-- 4. Enable Public Access (RLS)
alter table public.rooms enable row level security;

drop policy if exists "Allow public access to rooms" on public.rooms;
create policy "Allow public access to rooms" on public.rooms
  for all using (true) with check (true);

-- 5. Create the atomic leave_room function for reliable cleanup
create or replace function public.leave_room(p_room_id text, p_player_id text)
returns void as $$
declare
  current_data jsonb;
  new_players jsonb;
begin
  -- Get current room data
  select data into current_data from public.rooms where id = p_room_id;
  
  if current_data is not null then
    -- Filter out the player
    select coalesce(jsonb_agg(p), '[]'::jsonb)
    into new_players
    from jsonb_array_elements(current_data->'players') p
    where p->>'id' != p_player_id;

    if new_players = '[]'::jsonb then
      -- If room is now empty, delete it
      delete from public.rooms where id = p_room_id;
    else
      -- Otherwise, update with the remaining players
      update public.rooms 
      set data = jsonb_set(data, '{players}', new_players)
      where id = p_room_id;
    end if;
  end if;
end;
$$ language plpgsql security definer;
```

### 2. Enable Realtime in Table Editor
1.  Go to the **Table Editor** in your Supabase Dashboard.
2.  Find the `rooms` table.
3.  Click the **Edit Table** button (or the `...` menu).
4.  Ensure the **Enable Realtime** checkbox is **checked**.
5.  Click **Save**.

### 3. Auto-Cleanup Inactive Rooms (Optional)
To prevent your database from being cluttered with old rooms, you can schedule an automatic cleanup:

1.  Go to **Database** -> **Extensions** in your Supabase Dashboard.
2.  Search for **`pg_cron`** and enable it.
3.  Run the following script in the **SQL Editor**:

```sql
-- 1. Enable the cron extension
create extension if not exists pg_cron;

-- 2. Schedule the deletion job
-- This will run every hour and delete rooms created more than 1 day ago
select cron.schedule(
  'delete-old-rooms', -- Job name
  '0 * * * *',         -- Cron schedule (every hour at minute 0)
  'delete from public.rooms where created_at < now() - interval ''1 day'''
);
```

---

## 🎮 Features
- **Realtime Multiplayer**: Synced movement across different devices using Supabase Realtime.
- **Romantic Theme**: Tailored visuals and "Love Cards" (LDR Cards) for couples.
- **Room System**: Create private rooms with passwords or join existing ones.
- **Smooth Animations**: Powered by Framer Motion for dice rolls and player movement.
