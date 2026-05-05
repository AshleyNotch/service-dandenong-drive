-- Backfill contacts from existing bookings and quote requests

insert into public.contacts (name, email, phone)
select distinct on (email) name, email, phone
from public.bookings
where email is not null
on conflict (email) do update set
  name  = excluded.name,
  phone = coalesce(excluded.phone, public.contacts.phone);

insert into public.contacts (name, email, phone)
select distinct on (email) name, email, phone
from public.quote_requests
where email is not null
on conflict (email) do update set
  name  = excluded.name,
  phone = coalesce(excluded.phone, public.contacts.phone);
