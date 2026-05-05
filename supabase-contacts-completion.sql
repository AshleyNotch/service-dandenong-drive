-- Run in Supabase SQL Editor

-- ─── Add 'completed' to booking status ───────────────────────────────────────
alter type public.booking_status add value if not exists 'completed';

-- ─── Service completion fields ────────────────────────────────────────────────
alter table public.bookings add column if not exists completed_at  timestamptz;
alter table public.bookings add column if not exists cost          numeric(10, 2);
alter table public.bookings add column if not exists completion_notes text;

-- ─── Contacts ─────────────────────────────────────────────────────────────────

create table if not exists public.contacts (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text unique not null,
  phone       text,
  created_at  timestamptz not null default now()
);

alter table public.contacts enable row level security;

create policy "contacts_select_admin" on public.contacts
  for select using (public.current_role() in ('admin', 'super_admin'));

create policy "contacts_insert_public" on public.contacts
  for insert with check (true);

create policy "contacts_update_admin" on public.contacts
  for update using (public.current_role() in ('admin', 'super_admin'));

-- ─── Trigger: upsert contact on new booking ───────────────────────────────────

create or replace function public.handle_new_booking()
returns trigger language plpgsql security definer as $$
begin
  insert into public.contacts (name, email, phone)
  values (new.name, new.email, new.phone)
  on conflict (email) do update set
    name  = excluded.name,
    phone = coalesce(excluded.phone, public.contacts.phone);
  return new;
end;
$$;

drop trigger if exists on_booking_created on public.bookings;
create trigger on_booking_created
  after insert on public.bookings
  for each row execute procedure public.handle_new_booking();

-- ─── Trigger: upsert contact on new quote request ────────────────────────────

create or replace function public.handle_new_quote()
returns trigger language plpgsql security definer as $$
begin
  insert into public.contacts (name, email, phone)
  values (new.name, new.email, new.phone)
  on conflict (email) do update set
    name  = excluded.name,
    phone = coalesce(excluded.phone, public.contacts.phone);
  return new;
end;
$$;

drop trigger if exists on_quote_created on public.quote_requests;
create trigger on_quote_created
  after insert on public.quote_requests
  for each row execute procedure public.handle_new_quote();
