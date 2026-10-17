-- Launchixis public schema. Schema only: no rows, no environment values.
--
-- Method: rebuilt from scripts/schema.sql plus every file in supabase/migrations/,
-- applied in filename order, then collapsed into this final shape. No database
-- credentials were available, so this is not a read of the live project.
-- Supabase already provides auth.users and the anon, authenticated, and
-- service_role roles. Do not apply this file to production from a pull request.
-- Ship changes as new files in supabase/migrations/.

create table if not exists public.launches (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  one_liner text not null default '',
  domain text not null default '',
  repo text not null default '',
  vercel_project text not null default '',
  status text not null default 'not_started',
  notes text not null default '',
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner_id uuid references auth.users(id),
  version integer not null default 1
);

create unique index if not exists launches_one_customer_workspace
  on public.launches(owner_id) where owner_id is not null;

alter table public.launches enable row level security;
revoke all on public.launches from anon, authenticated;
grant all on public.launches to service_role;

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  subject text not null,
  message text not null,
  company_slug text not null default 'launchixis',
  source_inbox text not null default 'launchixis@apixis.dev',
  route_to text not null default 'awad@apixis.dev',
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.support_tickets enable row level security;
revoke all on public.support_tickets from anon, authenticated;
grant all on public.support_tickets to service_role;

create table if not exists public.launch_orders (
  id uuid primary key,
  user_id uuid not null references auth.users(id),
  attempt_id uuid not null,
  product_key text not null check (product_key in (
    'launchixis.template.checklist',
    'launchixis.brandkit.oneoff',
    'launchixis.ops.seat',
    'launchixis.enterprise.suite'
  )),
  status text not null default 'pending' check (status in ('pending', 'captured', 'released', 'refunded')),
  reservation_id text,
  receipt_id text,
  content text not null check (length(content) > 100),
  template_version integer not null,
  created_at timestamptz not null default now(),
  stripe_payment_id text,
  stripe_subscription_id text,
  subscription_status text,
  unique (user_id, attempt_id)
);

create unique index if not exists launch_orders_one_active_purchase
  on public.launch_orders(user_id, product_key) where status in ('pending', 'captured');
create index if not exists launch_orders_stripe_payment
  on public.launch_orders(stripe_payment_id) where stripe_payment_id is not null;

alter table public.launch_orders enable row level security;
revoke all on public.launch_orders from public, anon, authenticated;
grant all on public.launch_orders to service_role;

create table if not exists public.request_limits (
  key text primary key,
  hits integer not null,
  expires_at timestamptz not null
);

create index if not exists request_limits_expiry on public.request_limits(expires_at);

alter table public.request_limits enable row level security;
revoke all on public.request_limits from public, anon, authenticated;
grant all on public.request_limits to service_role;

create table if not exists public.purchase_ledger (
  id uuid primary key,
  order_id uuid not null references public.launch_orders(id),
  user_id uuid not null references auth.users(id),
  product_key text not null,
  method text not null check (method in ('ixis', 'card')),
  receipt_id text not null,
  amount_label text not null,
  entry_kind text not null check (entry_kind in ('purchase', 'renewal', 'refund')),
  stripe_event_id text,
  created_at timestamptz not null default now(),
  unique (order_id, entry_kind, receipt_id)
);

create unique index if not exists purchase_ledger_stripe_event
  on public.purchase_ledger(stripe_event_id) where stripe_event_id is not null;

alter table public.purchase_ledger enable row level security;
revoke all on public.purchase_ledger from public, anon, authenticated;
grant select, insert on public.purchase_ledger to service_role;

-- Atomic across all server instances. IP addresses are hashed before reaching this table.
create or replace function public.consume_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare v_hits integer;
begin
  if p_limit < 1 or p_window_seconds < 1 or length(p_key) != 64 then
    raise exception 'invalid rate limit';
  end if;
  delete from public.request_limits where expires_at < now() - interval '1 day';
  insert into public.request_limits as limits(key,hits,expires_at)
    values(p_key,1,now()+make_interval(secs=>p_window_seconds))
    on conflict(key) do update set
      hits = case when limits.expires_at <= now() then 1 else least(limits.hits+1, p_limit+1) end,
      expires_at = case when limits.expires_at <= now() then now()+make_interval(secs=>p_window_seconds) else limits.expires_at end
    returning hits into v_hits;
  return v_hits <= p_limit;
end;
$$;
revoke all on function public.consume_rate_limit(text,integer,integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text,integer,integer) to service_role;
