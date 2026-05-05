-- Add quotation delivery preference to quote requests
alter table public.quote_requests
  add column if not exists quote_delivery text default 'email',
  add column if not exists whatsapp_number text;
