# Set Admin Role for admin@rawnode.com

## Important: Role is in `profiles` table, not `auth.users`

The `role` column is stored in the `public.profiles` table, not in `auth.users`. 
The `auth.users` table only contains authentication data (email, password hash, etc.).

## Quick Method - Run SQL in Supabase Studio

1. Make sure Supabase is running: `supabase start`
2. Open Supabase Studio: http://127.0.0.1:54333
3. Go to **SQL Editor**
4. Run this SQL:

```sql
-- Set admin role for admin@rawnode.com
-- This finds the user in auth.users, then updates their profile role
UPDATE public.profiles 
SET role = 'admin' 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@rawnode.com'
);

-- Verify it worked - check the profiles table:
SELECT u.email, p.role, p.full_name
FROM auth.users u 
JOIN public.profiles p ON u.id = p.id 
WHERE u.email = 'admin@rawnode.com';
```

5. If the user doesn't exist yet:
   - Sign up first at `/login` with email: `admin@rawnode.com`
   - This will automatically create a profile row with role='customer'
   - Then run the SQL above to set role='admin'

## Alternative: Use the Migration

The migration file `supabase/migrations/20251112_set_admin_role.sql` will automatically set the admin role when you restart Supabase:

```bash
supabase db reset
```

This applies all migrations, including the one that sets admin role.

