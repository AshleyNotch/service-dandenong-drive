-- Run in Supabase SQL Editor to add admin notes to bookings and quote requests

alter table public.bookings       add column if not exists admin_notes text;
alter table public.quote_requests add column if not exists admin_notes text;
