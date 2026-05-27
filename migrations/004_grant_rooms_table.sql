-- Migration 004: Explicit grants for public.rooms (required from Oct 30, 2026)

grant select, insert, update, delete
  on public.rooms
  to anon;

grant select, insert, update, delete
  on public.rooms
  to authenticated;

grant select, insert, update, delete
  on public.rooms
  to service_role;
