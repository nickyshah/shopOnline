-- Update products with Unsplash image URLs
-- Using Unsplash Source API for direct image access

-- Gym Gear products
UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&h=800&fit=crop&q=80&auto=format'
WHERE name = 'Premium Resistance Bands Set';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop&q=80&auto=format'
WHERE name = 'Adjustable Dumbbells 50lbs';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&h=800&fit=crop&q=80&auto=format'
WHERE name = 'Yoga Mat Pro - Extra Thick';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=800&h=800&fit=crop&q=80&auto=format'
WHERE name = 'Foam Roller - High Density';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop&q=80&auto=format'
WHERE name = 'Pull-Up Bar - Doorway Mount';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&h=800&fit=crop&q=80&auto=format'
WHERE name = 'Kettlebell - Cast Iron 35lbs';

-- Natural Supplements products
UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&h=800&fit=crop&q=80&auto=format'
WHERE name = 'Whey Protein Isolate - Vanilla';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1607613009820-a29f7a5d645c?w=800&h=800&fit=crop&q=80&auto=format'
WHERE name = 'Omega-3 Fish Oil - 120 Capsules';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&h=800&fit=crop&q=80&auto=format'
WHERE name = 'Vitamin D3 + K2 - 60 Capsules';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&h=800&fit=crop&q=80&auto=format'
WHERE name = 'Turmeric Curcumin - 90 Capsules';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&h=800&fit=crop&q=80&auto=format'
WHERE name = 'Magnesium Glycinate - 120 Capsules';

UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&h=800&fit=crop&q=80&auto=format'
WHERE name = 'Pre-Workout Natural Energy';

