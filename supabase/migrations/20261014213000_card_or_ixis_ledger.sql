-- Card or Ixis: permanent purchase ledger, wider SKU list, refund status.
alter table public.launch_orders drop constraint if exists launch_orders_product_key_check;
alter table public.launch_orders add constraint launch_orders_product_key_check
  check (product_key in (
    'launchixis.template.checklist',
    'launchixis.brandkit.oneoff',
    'launchixis.ops.seat',
    'launchixis.enterprise.suite'
  ));

alter table public.launch_orders drop constraint if exists launch_orders_status_check;
alter table public.launch_orders add constraint launch_orders_status_check
  check (status in ('pending', 'captured', 'released', 'refunded'));

alter table public.launch_orders add column if not exists stripe_payment_id text;
alter table public.launch_orders add column if not exists stripe_subscription_id text;
alter table public.launch_orders add column if not exists subscription_status text;
create index if not exists launch_orders_stripe_payment on public.launch_orders(stripe_payment_id) where stripe_payment_id is not null;

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
create unique index if not exists purchase_ledger_stripe_event on public.purchase_ledger(stripe_event_id) where stripe_event_id is not null;
alter table public.purchase_ledger enable row level security;
revoke all on public.purchase_ledger from public, anon, authenticated;
grant select, insert on public.purchase_ledger to service_role;
