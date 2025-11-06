-- Migration to set admin role for admin@rawnode.com
-- The role is stored in public.profiles table, not auth.users
-- This migration finds the user in auth.users by email, then updates their profile

DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Find user by email in auth.users table
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@rawnode.com';
  
  IF admin_user_id IS NOT NULL THEN
    -- Update or insert the profile with admin role
    -- The role column is in public.profiles, not auth.users
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (admin_user_id, 'Admin User', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
    
    RAISE NOTICE 'Admin role set for user: admin@rawnode.com (ID: %)', admin_user_id;
  ELSE
    RAISE NOTICE 'User admin@rawnode.com does not exist in auth.users. Please sign up first at /login, then run this migration again.';
  END IF;
END $$;

