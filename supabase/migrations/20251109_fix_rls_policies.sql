-- Fix RLS policies to prevent infinite recursion and ensure public access

-- Drop and recreate categories policies
drop policy if exists "categories are publicly readable" on public.categories;
drop policy if exists "categories writable by admin" on public.categories;

-- Allow anyone to read categories (public access)
create policy "categories are publicly readable" on public.categories
  for select using (true);

-- Only admins can write categories (but we'll use service role for inserts anyway)
create policy "categories writable by admin" on public.categories
  for insert with check (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "categories updatable by admin" on public.categories
  for update using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "categories deletable by admin" on public.categories
  for delete using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Drop and recreate products policies to ensure public read access
drop policy if exists "products are publicly readable" on public.products;
drop policy if exists "products writable by admin" on public.products;

-- Allow anyone to read active products (public access)
create policy "products are publicly readable" on public.products
  for select using (active = true);

-- Only admins can write products
create policy "products insertable by admin" on public.products
  for insert with check (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "products updatable by admin" on public.products
  for update using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "products deletable by admin" on public.products
  for delete using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

