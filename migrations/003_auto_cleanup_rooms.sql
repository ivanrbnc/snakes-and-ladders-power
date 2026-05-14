-- Migration 003: Auto-cleanup inactive rooms older than 1 day
-- Requires the pg_cron extension — enable it first:
--   Database → Extensions → search "pg_cron" → Enable

create extension if not exists pg_cron;

select cron.schedule(
  'delete-old-rooms',
  '0 * * * *',
  'delete from public.rooms where created_at < now() - interval ''1 day'''
);
