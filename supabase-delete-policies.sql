-- Allow super admin to delete user profiles
create policy "profiles_delete_super_admin" on public.profiles
  for delete using (public.current_role() = 'super_admin');

-- Allow admin and super admin to delete contacts
create policy "contacts_delete_admin" on public.contacts
  for delete using (public.current_role() in ('admin', 'super_admin'));
