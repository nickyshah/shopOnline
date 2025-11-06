-- Auto-set admin role for admin@rawnode.com on signup
-- This modifies the handle_new_user trigger to automatically set admin role

create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_email text;
begin
  -- Get the user's email
  user_email := coalesce(new.email, '');
  
  -- Insert profile with appropriate role
  insert into public.profiles (id, full_name, role)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    -- Auto-set admin role if email is admin@rawnode.com
    case when lower(user_email) = 'admin@rawnode.com' then 'admin' else 'customer' end
  )
  on conflict (id) do update set role = 
    case when lower(user_email) = 'admin@rawnode.com' then 'admin' else profiles.role end;
  
  return new;
end;
$$ language plpgsql security definer;

-- The trigger should already exist from the initial migration
-- Just ensure it's using the updated function

