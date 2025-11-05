-- Profiles with role-based access
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'customer', -- 'customer' | 'admin'
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "profiles are viewable by self" on public.profiles
  for select using (auth.uid() = id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

create policy "profiles are editable by self" on public.profiles
  for update using (auth.uid() = id);

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  price_cents integer not null check (price_cents >= 0),
  active boolean not null default true,
  created_at timestamp with time zone default now()
);

alter table public.products enable row level security;

-- anyone can read active products
create policy "products are publicly readable" on public.products
  for select using (active = true);

-- only admins can write
create policy "products writable by admin" on public.products
  for all using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete set null,
  status text not null default 'pending', -- pending | paid | fulfilled | cancelled
  stripe_payment_intent text,
  amount_cents integer not null,
  shipping_name text,
  shipping_address_line1 text,
  shipping_address_line2 text,
  shipping_city text,
  shipping_state text,
  shipping_postal_code text,
  shipping_country text,
  created_at timestamp with time zone default now()
);

alter table public.orders enable row level security;

create policy "orders readable by owner or admin" on public.orders
  for select using (
    user_id = auth.uid() or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "orders insert by owner" on public.orders
  for insert with check (user_id = auth.uid());

create policy "orders update by admin" on public.orders
  for update using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- Order items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0)
);

alter table public.order_items enable row level security;

create policy "order items readable by owner or admin" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o where o.id = order_items.order_id and (
        o.user_id = auth.uid() or exists (
          select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
        )
      )
    )
  );

-- Carts (simple, per user)
create table if not exists public.carts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  updated_at timestamp with time zone default now()
);

alter table public.carts enable row level security;

create policy "cart owner can read/write" on public.carts
  for all using (user_id = auth.uid());

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_user_id uuid not null references public.carts(user_id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0)
);

alter table public.cart_items enable row level security;

create policy "cart items owner can read/write" on public.cart_items
  for all using (cart_user_id = auth.uid());

-- Ensure profile row exists on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


