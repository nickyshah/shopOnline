-- Migration to support guest checkout

-- Step 1: Change carts table structure
-- Drop foreign key constraint from cart_items first
alter table public.cart_items drop constraint if exists cart_items_cart_user_id_fkey;

-- Drop primary key constraint and add id column
alter table public.carts drop constraint if exists carts_pkey;
alter table public.carts add column id uuid primary key default gen_random_uuid();
alter table public.carts alter column user_id drop not null;
alter table public.carts add column session_id text unique;
alter table public.carts add constraint carts_user_or_session check (user_id is not null or session_id is not null);

-- Step 2: Update cart_items to reference carts.id
alter table public.cart_items 
  add column cart_id uuid references public.carts(id) on delete cascade,
  alter column cart_user_id drop not null,
  add column cart_session_id text;

-- Migrate existing data: create cart_id for existing cart_items
update public.cart_items ci
set cart_id = c.id
from public.carts c
where ci.cart_user_id = c.user_id;

-- Make cart_id required after migration
alter table public.cart_items alter column cart_id set not null;

-- Step 3: Update orders to support guest orders
alter table public.orders
  alter column user_id drop not null,
  add column guest_email text,
  add constraint orders_user_or_guest check (user_id is not null or guest_email is not null);

-- Step 4: Drop existing RLS policies
drop policy if exists "cart owner can read/write" on public.carts;
drop policy if exists "cart items owner can read/write" on public.cart_items;
drop policy if exists "orders insert by owner" on public.orders;

-- Step 5: Allow anonymous access to carts (for guests)
alter table public.carts disable row level security;
alter table public.cart_items disable row level security;

-- Re-enable RLS but with permissive policies for guests
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;

-- Allow anyone to read/write carts (we'll filter by session_id in application code)
create policy "carts are publicly accessible" on public.carts
  for all using (true) with check (true);

create policy "cart_items are publicly accessible" on public.cart_items
  for all using (true) with check (true);

-- Step 6: Update orders policy to allow guest orders (insert via service role)
drop policy if exists "orders readable by owner or admin" on public.orders;
create policy "orders readable by owner or admin" on public.orders
  for select using (
    user_id = auth.uid() or 
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Allow service role to insert guest orders (will be done via service role client)

