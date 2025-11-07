-- Add phone number to orders table for customer contact information
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS phone text;

