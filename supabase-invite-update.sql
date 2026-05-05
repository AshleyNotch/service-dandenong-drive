-- Run this in the Supabase SQL Editor to enable the invite-admin feature.

-- ─── Pending Admins ──────────────────────────────────────────────────────────
-- Super admin pre-registers an email here before sending the invite link.
-- The sign-up trigger checks this table and assigns the admin role automatically.

create table if not exists public.pending_admins (
  email       text primary key,
  invited_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.pending_admins enable row level security;

-- Only super_admin can insert / delete invites
create policy "pending_admins_insert" on public.pending_admins
  for insert with check (public.current_role() = 'super_admin');

create policy "pending_admins_select" on public.pending_admins
  for select using (public.current_role() = 'super_admin');

create policy "pending_admins_delete" on public.pending_admins
  for delete using (public.current_role() = 'super_admin');

-- ─── Update trigger to check pending_admins ───────────────────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  assigned_role public.user_role;
begin
  if new.email = 'ashleyrehan.notch@gmail.com' then
    assigned_role := 'super_admin';
  elsif exists (select 1 from public.pending_admins where email = new.email) then
    assigned_role := 'admin';
    delete from public.pending_admins where email = new.email;
  else
    assigned_role := 'user';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    assigned_role
  );

  return new;
end;
$$;
