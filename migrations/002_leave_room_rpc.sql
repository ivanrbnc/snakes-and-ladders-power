-- Migration 002: Atomic leave_room RPC for reliable disconnect cleanup

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
