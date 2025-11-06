-- Migration to add categories and sample products

-- Create categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamp with time zone default now()
);

alter table public.categories enable row level security;

-- Allow anyone to read categories
create policy "categories are publicly readable" on public.categories
  for select using (true);

-- Only admins can write categories
create policy "categories writable by admin" on public.categories
  for all using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- Add category_id to products
alter table public.products
  add column category_id uuid references public.categories(id) on delete set null;

-- Insert categories
insert into public.categories (name, slug, description) values
  ('Gym Gear', 'gym-gear', 'Premium fitness equipment and workout essentials'),
  ('Natural Supplements', 'natural-supplements', 'Organic and natural health supplements')
on conflict (name) do nothing;

-- Insert sample products for Gym Gear
do $$
declare
  gym_gear_id uuid;
begin
  select id into gym_gear_id from public.categories where slug = 'gym-gear';
  
  if gym_gear_id is not null then
    insert into public.products (name, description, price_cents, category_id, active) 
    select * from (values
      ('Premium Resistance Bands Set', 'Professional-grade resistance bands set with 5 different resistance levels. Perfect for home workouts, strength training, and physical therapy. Made from durable natural latex.', 2999, gym_gear_id, true),
      ('Adjustable Dumbbells 50lbs', 'Space-saving adjustable dumbbells with quick-change plates. From 5lbs to 50lbs per hand. Perfect for home gyms and small spaces.', 19999, gym_gear_id, true),
      ('Yoga Mat Pro - Extra Thick', 'Premium 10mm thick yoga mat with superior grip and cushioning. Eco-friendly TPE material, non-slip surface for all yoga poses and workouts.', 6999, gym_gear_id, true),
      ('Foam Roller - High Density', 'Professional foam roller for muscle recovery and deep tissue massage. Durable EPP foam construction, perfect for post-workout recovery.', 3499, gym_gear_id, true),
      ('Pull-Up Bar - Doorway Mount', 'Heavy-duty doorway pull-up bar with multiple grip positions. No drilling required, supports up to 300lbs. Perfect for home workouts.', 4999, gym_gear_id, true),
      ('Kettlebell - Cast Iron 35lbs', 'Professional cast iron kettlebell with powder-coated finish. Perfect for full-body workouts, functional training, and strength building.', 8999, gym_gear_id, true)
    ) as v(name, description, price_cents, category_id, active)
    where not exists (select 1 from public.products where name = v.name);
  end if;
end $$;

-- Insert sample products for Natural Supplements
do $$
declare
  supplements_id uuid;
begin
  select id into supplements_id from public.categories where slug = 'natural-supplements';
  
  if supplements_id is not null then
    insert into public.products (name, description, price_cents, category_id, active) 
    select * from (values
      ('Whey Protein Isolate - Vanilla', '100% grass-fed whey protein isolate. 25g protein per serving, zero sugar, no artificial flavors. Perfect for post-workout recovery.', 5999, supplements_id, true),
      ('Omega-3 Fish Oil - 120 Capsules', 'Premium wild-caught fish oil with 1000mg EPA and DHA per serving. Supports heart health, brain function, and joint mobility.', 2999, supplements_id, true),
      ('Vitamin D3 + K2 - 60 Capsules', 'High-potency vitamin D3 with K2 for optimal absorption. Supports bone health, immune system, and calcium metabolism.', 2499, supplements_id, true),
      ('Turmeric Curcumin - 90 Capsules', 'Standardized turmeric extract with black pepper for enhanced absorption. Supports joint health, inflammation reduction, and antioxidant support.', 3499, supplements_id, true),
      ('Magnesium Glycinate - 120 Capsules', 'Chelated magnesium for better absorption. Promotes muscle relaxation, sleep quality, and stress relief. Gentle on the stomach.', 2799, supplements_id, true),
      ('Pre-Workout Natural Energy', 'Clean energy blend with green tea extract, B vitamins, and natural caffeine from guarana. No artificial ingredients or crash.', 4499, supplements_id, true)
    ) as v(name, description, price_cents, category_id, active)
    where not exists (select 1 from public.products where name = v.name);
  end if;
end $$;

