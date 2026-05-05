-- Public function to get booked times for a given date (no personal data exposed)
create or replace function public.get_booked_times(p_date date)
returns table(booked_time text) language sql security definer stable as $$
  select time from public.bookings
  where date = p_date
  and status not in ('cancelled');
$$;
