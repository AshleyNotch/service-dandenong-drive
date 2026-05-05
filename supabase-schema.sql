-- ─── Profiles ────────────────────────────────────────────────────────────────
-- Extends auth.users with role info. Created automatically on sign-up via trigger.

create type public.user_role as enum ('super_admin', 'admin', 'user');
create type public.booking_status as enum ('pending', 'confirmed', 'cancelled');
create type public.quote_status as enum ('pending', 'sent', 'completed');

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  role        public.user_role not null default 'user',
  created_at  timestamptz not null default now()
);

-- Auto-create profile on auth sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    case
      when new.email = 'ashleyrehan.notch@gmail.com' then 'super_admin'::public.user_role
      else 'user'::public.user_role
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Bookings ─────────────────────────────────────────────────────────────────

create table public.bookings (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  time        text not null,
  services    text[] not null,
  make        text not null,
  model       text not null,
  year        text not null,
  odometer    text,
  name        text not null,
  phone       text not null,
  email       text not null,
  status      public.booking_status not null default 'pending',
  notes       text,
  created_at  timestamptz not null default now()
);

-- ─── Quote Requests ───────────────────────────────────────────────────────────

create table public.quote_requests (
  id          uuid primary key default gen_random_uuid(),
  services    text[] not null,
  make        text not null,
  model       text not null,
  year        text not null,
  odometer    text,
  name        text not null,
  phone       text not null,
  email       text not null,
  notes       text,
  status      public.quote_status not null default 'pending',
  created_at  timestamptz not null default now()
);

-- ─── Blocked Slots ────────────────────────────────────────────────────────────
-- A row with time = null blocks the entire day.

create table public.blocked_slots (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  time        text,
  reason      text,
  created_at  timestamptz not null default now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table public.profiles      enable row level security;
alter table public.bookings      enable row level security;
alter table public.quote_requests enable row level security;
alter table public.blocked_slots  enable row level security;

-- Helper: get current user role
create or replace function public.current_role()
returns public.user_role language sql security definer stable as $$
  select role from public.profiles where id = auth.uid();
$$;

-- profiles: users see their own row; admins & super_admin see all
create policy "profiles_select_own"   on public.profiles for select using (id = auth.uid());
create policy "profiles_select_admin" on public.profiles for select using (public.current_role() in ('admin', 'super_admin'));
create policy "profiles_update_admin" on public.profiles for update using (public.current_role() = 'super_admin');

-- bookings: anyone can insert (public form); admins can read/update
create policy "bookings_insert_public" on public.bookings for insert with check (true);
create policy "bookings_select_admin"  on public.bookings for select using (public.current_role() in ('admin', 'super_admin'));
create policy "bookings_update_admin"  on public.bookings for update using (public.current_role() in ('admin', 'super_admin'));

-- quote_requests: same as bookings
create policy "quotes_insert_public" on public.quote_requests for insert with check (true);
create policy "quotes_select_admin"  on public.quote_requests for select using (public.current_role() in ('admin', 'super_admin'));
create policy "quotes_update_admin"  on public.quote_requests for update using (public.current_role() in ('admin', 'super_admin'));

-- blocked_slots: admins can read/write; public can read (so booking widget can hide blocked times)
create policy "slots_select_public" on public.blocked_slots for select using (true);
create policy "slots_insert_admin"  on public.blocked_slots for insert with check (public.current_role() in ('admin', 'super_admin'));
create policy "slots_delete_admin"  on public.blocked_slots for delete using (public.current_role() in ('admin', 'super_admin'));
