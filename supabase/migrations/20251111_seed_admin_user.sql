-- Seed admin user for local development
-- NOTE: The best way to create an admin user is to:
-- 1. Sign up normally at /login with email: admin@rawnode.com, password: admin123
-- 2. Then run this script to set the role to admin
-- OR use Supabase Studio's Auth section to create users

-- This script ensures any user with email 'admin@rawnode.com' has admin role
-- If the user doesn't exist yet, you'll need to sign up first
do $$
declare
  admin_user_id uuid;
  admin_email text := 'admin@rawnode.com';
begin
  -- Check if user exists
  select id into admin_user_id 
  from auth.users 
  where email = admin_email;
  
  if admin_user_id is not null then
    -- User exists, ensure profile has admin role
    insert into public.profiles (id, full_name, role)
    values (admin_user_id, 'Admin User', 'admin')
    on conflict (id) do update set role = 'admin';
    
    raise notice 'Admin role set for user: %', admin_email;
  else
    raise notice 'User % does not exist. Please sign up first, then run this migration again.', admin_email;
  end if;
end $$;

