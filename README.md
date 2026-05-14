# LDR Snakes & Ladders

A romantic, real-time multiplayer Snakes and Ladders game designed for long-distance couples. Built with React, Vite, Framer Motion, and Supabase.

---

## Features

### Multiplayer & Rooms
- Create or join rooms via a 4-digit room code (shareable link)
- Password-protected private rooms
- Configurable max players (2–6)
- Player color picker in the lobby — duplicates blocked, auto-selects first available color
- Camera capture for custom player avatar
- Reliable disconnect cleanup via `leave_room` Supabase RPC + `navigator.sendBeacon`

### Gameplay
- Classic 10×10 Snakes & Ladders board with snakes and ladders
- Step-by-step animated player movement
- Love Squares — land on one to draw a shuffled LDR Challenge Card (no duplicates until the full deck is exhausted)
- Power Squares — land on one to find a Power Card

### Power Cards
| Card | Effect |
|---|---|
| **Shield** 🛡️ | Protects against Freeze, Prank, Swap, and Snake slides |
| **Freeze** ❄️ | Target skips their next turn |
| **Prank** 🍌 | Moves target back 4 tiles |
| **Swap** 🔄 | Swaps positions with target (blocked by shield) |
| **Turbo** ⚡ | Move yourself forward 4 tiles |
| **Lucky Dice** 🎲 | Guarantees a roll of 6 on your next turn |

- Hold up to 3 Power Cards
- Personalized toast & overlay messages per viewer (actor / target / spectator)
- Power card visual effects: per-type screen effects + animated player token effects (freeze ice crystals, shield atom orbits, prank smelly particles, lucky gold orbits, turbo speed lines)

### Animations & Visual Effects
- Framer Motion animations throughout: dice roll overlay, player tokens, card modals
- Per-card screen effects: icy blue vignette, banana roll, purple swap aura, shield shockwave rings
- Player token effects: frozen ice crust + drifting ❄️ snowflakes, shield bubble + atom orbit rings, prank 💨 particles until pranked player ends their turn
- Active ladder glow (gold) and active snake glow (red) on board traversal
- Winner overlay with 3-burst confetti and player avatar

### Chat & Game Log
- Bubble-style in-game chat (broadcast via Supabase Realtime, no extra table needed)
- Game log with color-coded entries per player
- Both chat history and game log persisted in room data — late joiners see full history

### Mobile Support
- Fully responsive layout for screens < 1024px
- Tab bar UI: **Players | Cards | Log | Chat** tabs below the board
- Roll button pinned at bottom
- Developer tools (force roll, teleport) hidden on mobile

### Developer Tools (DEV only)
- Force next dice roll (1–6)
- Teleport current player to any tile (1–99), synced to all clients

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ENVIRONMENT=DEV   # optional — enables developer tools
```

### 3. Run Development Server
```bash
npm run dev
```

---

## Supabase Backend Setup

### 1. Database Schema & Policies
Run the following in the **SQL Editor**:

```sql
-- 1. Create the rooms table
create table if not exists public.rooms (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- 2. Create the Realtime publication if missing
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

-- 3. Add rooms table to Realtime
do $$
begin
  alter publication supabase_realtime add table rooms;
exception
  when duplicate_object then null;
end $$;

-- 4. Enable RLS with public access
alter table public.rooms enable row level security;

drop policy if exists "Allow public access to rooms" on public.rooms;
create policy "Allow public access to rooms" on public.rooms
  for all using (true) with check (true);

-- 5. Atomic leave_room function for reliable cleanup on disconnect
create or replace function public.leave_room(p_room_id text, p_player_id text)
returns void as $$
declare
  current_data jsonb;
  new_players jsonb;
begin
  select data into current_data from public.rooms where id = p_room_id;
  if current_data is not null then
    select coalesce(jsonb_agg(p), '[]'::jsonb)
    into new_players
    from jsonb_array_elements(current_data->'players') p
    where p->>'id' != p_player_id;

    if new_players = '[]'::jsonb then
      delete from public.rooms where id = p_room_id;
    else
      update public.rooms
      set data = jsonb_set(data, '{players}', new_players)
      where id = p_room_id;
    end if;
  end if;
end;
$$ language plpgsql security definer;
```

### 2. Enable Realtime in Table Editor
1. Go to **Table Editor** in your Supabase Dashboard
2. Find the `rooms` table → click **Edit Table**
3. Ensure **Enable Realtime** is checked → **Save**

### 3. Auto-Cleanup Inactive Rooms (Optional)
Prevents old rooms from cluttering the database:

1. Go to **Database → Extensions**, enable **`pg_cron`**
2. Run in the **SQL Editor**:

```sql
create extension if not exists pg_cron;

select cron.schedule(
  'delete-old-rooms',
  '0 * * * *',
  'delete from public.rooms where created_at < now() - interval ''1 day'''
);
```

---

## Tech Stack

| | |
|---|---|
| **Framework** | React 18 + Vite |
| **Animations** | Framer Motion |
| **Backend / Realtime** | Supabase (Postgres + Realtime broadcast) |
| **Icons** | Lucide React |
| **Confetti** | canvas-confetti |
| **Styling** | CSS + inline styles |
