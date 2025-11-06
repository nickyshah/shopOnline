-- Fix infinite recursion in profiles RLS policy
-- The issue: The policy checks if user is admin by querying profiles, which triggers the same policy

-- Step 1: Create a security definer function to check admin role (bypasses RLS)
create or replace function public.is_admin(user_id uuid)
returns boolean
language plpgsql
security definer
stable
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = user_id and role = 'admin'
  );
end;
$$;

-- Step 2: Drop the existing problematic policy
drop policy if exists "profiles are viewable by self" on public.profiles;

-- Step 3: Create a new policy that allows:
-- - Users to read their own profile
-- - Admins to read any profile (using the function that bypasses RLS)
create policy "profiles are viewable by self or admin" on public.profiles
  for select using (
    auth.uid() = id 
    or public.is_admin(auth.uid())
  );

-- Step 4: Update the existing update policy to be consistent
drop policy if exists "profiles are editable by self" on public.profiles;
create policy "profiles are editable by self or admin" on public.profiles
  for update using (
    auth.uid() = id 
    or public.is_admin(auth.uid())
  );

-- Step 5: Allow inserts (for new user signups)
drop policy if exists "profiles are insertable on signup" on public.profiles;
create policy "profiles are insertable on signup" on public.profiles
  for insert with check (auth.uid() = id);

-- Step 6: Update other tables' policies to use the function instead of direct queries
-- This prevents recursion when checking admin status from other tables

-- Categories policies
drop policy if exists "categories writable by admin" on public.categories;
drop policy if exists "categories updatable by admin" on public.categories;
drop policy if exists "categories deletable by admin" on public.categories;

create policy "categories writable by admin" on public.categories
  for insert with check (public.is_admin(auth.uid()));

create policy "categories updatable by admin" on public.categories
  for update using (public.is_admin(auth.uid()));

create policy "categories deletable by admin" on public.categories
  for delete using (public.is_admin(auth.uid()));

-- Products policies
drop policy if exists "products insertable by admin" on public.products;
drop policy if exists "products updatable by admin" on public.products;
drop policy if exists "products deletable by admin" on public.products;

create policy "products insertable by admin" on public.products
  for insert with check (public.is_admin(auth.uid()));

create policy "products updatable by admin" on public.products
  for update using (public.is_admin(auth.uid()));

create policy "products deletable by admin" on public.products
  for delete using (public.is_admin(auth.uid()));

-- Orders policies (if they exist)
drop policy if exists "orders readable by owner or admin" on public.orders;
drop policy if exists "orders update by admin" on public.orders;

create policy "orders readable by owner or admin" on public.orders
  for select using (
    user_id = auth.uid() 
    or public.is_admin(auth.uid())
  );

create policy "orders update by admin" on public.orders
  for update using (public.is_admin(auth.uid()));

-- Order items policies
drop policy if exists "order items readable by owner or admin" on public.order_items;

create policy "order items readable by owner or admin" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o 
      where o.id = order_items.order_id 
      and (o.user_id = auth.uid() or public.is_admin(auth.uid()))
    )
  );

