-- Register.jsx lets a new user pick Patient vs Caregiver before signing up.
-- For email/password signup that choice rides through in signUp()'s
-- options.data and handle_new_user() reads it directly. Google's
-- signInWithOAuth() has no equivalent — the browser fully navigates away and
-- back, so the choice has to be stashed client-side (sessionStorage, same
-- trick ClaimInvite.jsx already uses for its invite token) and applied here
-- once the session reappears.
--
-- Narrowly-scoped on purpose: 'provider' is deliberately not an allowed
-- value, so this can never be used to self-escalate into the provider
-- dashboard. Providers aren't self-service in this app.
create or replace function set_own_role(new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if new_role not in ('patient', 'caregiver') then
    raise exception 'Invalid role';
  end if;

  update profiles set role = new_role where id = auth.uid();
end;
$$;
grant execute on function set_own_role(text) to authenticated;
