-- Fix: SECURITY DEFINER functions don't reliably inherit the caller's search_path,
-- so the unqualified "profiles" reference could fail to resolve. Qualify it explicitly.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, email)
  values (
    new.id,
    case when new.raw_user_meta_data->>'role' = 'caregiver' then 'caregiver' else 'patient' end,
    new.raw_user_meta_data->>'full_name',
    new.email
  );
  return new;
end;
$$;
