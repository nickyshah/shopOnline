-- AliExpress Affiliate integration tables

create table if not exists public.external_products (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('aliexpress')),
  source_product_id text not null,
  original_url text,
  title text,
  description text,
  images jsonb default '[]'::jsonb,
  currency text default 'USD',
  price_min_cents integer,
  price_max_cents integer,
  raw_payload jsonb,
  last_synced_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (source, source_product_id)
);

create table if not exists public.external_variants (
  id uuid primary key default gen_random_uuid(),
  external_product_id uuid not null references public.external_products(id) on delete cascade,
  variant_key text, -- concatenated attributes
  attributes jsonb default '{}'::jsonb,
  sku text,
  currency text default 'USD',
  price_cents integer,
  stock integer,
  raw_payload jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.external_sync_logs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  action text not null, -- import | sync | publish
  status text not null, -- success | error
  message text,
  meta jsonb,
  created_at timestamptz default now()
);

-- RLS
alter table public.external_products enable row level security;
alter table public.external_variants enable row level security;
alter table public.external_sync_logs enable row level security;

-- Admin-only write; readable by all for now (can tighten later)
create policy "external readable" on public.external_products for select using (true);
create policy "external variants readable" on public.external_variants for select using (true);
create policy "external logs readable" on public.external_sync_logs for select using (true);

create policy "external products writable by admin" on public.external_products for all using (public.is_admin(auth.uid()));
create policy "external variants writable by admin" on public.external_variants for all using (public.is_admin(auth.uid()));
create policy "external logs writable by admin" on public.external_sync_logs for all using (public.is_admin(auth.uid()));

-- updated_at triggers
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

drop trigger if exists t_external_products_updated on public.external_products;
create trigger t_external_products_updated before update on public.external_products
for each row execute function public.set_updated_at();

drop trigger if exists t_external_variants_updated on public.external_variants;
create trigger t_external_variants_updated before update on public.external_variants
for each row execute function public.set_updated_at();


