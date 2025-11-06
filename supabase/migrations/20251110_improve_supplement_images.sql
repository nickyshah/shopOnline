-- Update supplement products with more specific Unsplash images

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

-- Fix pull-up bar image (was using dumbbell image)
UPDATE public.products 
SET image_url = 'https://images.unsplash.com/photo-1631549921405-8d2b0b0b0b0b?w=800&h=800&fit=crop&q=80&auto=format'
WHERE name = 'Pull-Up Bar - Doorway Mount';

