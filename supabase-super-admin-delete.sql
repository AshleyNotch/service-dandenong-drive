-- Super admin can delete bookings and quote requests
create policy "bookings_delete_super_admin" on public.bookings
  for delete using (public.current_role() = 'super_admin');

create policy "quotes_delete_super_admin" on public.quote_requests
  for delete using (public.current_role() = 'super_admin');
