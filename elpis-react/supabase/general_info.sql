-- Two small, independent additions — neither depends on how the user
-- authenticated (works with the existing email/password login today, and
-- will keep working unchanged once Google auth is added as a second
-- sign-in method, since both just write to the same profiles/patients rows
-- via the existing session).

-- Patient's own home zip — real, self-reported, used to default the
-- Transportation search instead of asking every time.
alter table patients add column if not exists home_zip text;

-- Narrowly-scoped RPC (not a raw UPDATE policy) so a patient can only ever
-- touch this one column on their own row, not diagnosis/phase/provider_id/etc,
-- which the existing broad "patient updates own row" policy would otherwise
-- technically allow.
create or replace function update_patient_home_zip(new_zip text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update patients
  set home_zip = new_zip
  where profile_id = auth.uid();
end;
$$;
grant execute on function update_patient_home_zip(text) to authenticated;

-- Provider's own hospital/clinic — captured once on their profile, so every
-- patient they invite inherits it via provider_id (looked up, not copied
-- per-patient — stays correct if the provider's hospital ever changes).
alter table profiles add column if not exists hospital_name text;
alter table profiles add column if not exists hospital_zip text;
