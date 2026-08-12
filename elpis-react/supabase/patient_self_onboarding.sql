-- Self-registered patients (no provider invite) start with ZERO patients row —
-- provider_create_patient_with_invite is the only INSERT path today, so a
-- patient who registers directly (rather than claiming an invite) has no
-- patients row at all, and every patient-data feature (symptoms,
-- appointments, home_zip, messages) silently does nothing for them.
--
-- This RPC is the self-serve equivalent of the invite flow's
-- update_patient_contact_info(): it creates (or updates) the patient's own
-- row with contact/location fields only — never diagnosis/age/phase/
-- provider_id, which stay provider-owned, exactly like the invite flow.
alter table patients add column if not exists address text;

create or replace function complete_patient_self_onboarding(
  p_full_name text, p_phone text, p_address text, p_zip text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'patient') then
    raise exception 'Only patient accounts can complete this step';
  end if;

  insert into patients (profile_id, full_name, address, home_zip)
  values (auth.uid(), p_full_name, p_address, p_zip)
  on conflict (profile_id) do update
    set full_name = excluded.full_name,
        address = excluded.address,
        home_zip = excluded.home_zip;

  update profiles set full_name = p_full_name, phone = p_phone where id = auth.uid();
end;
$$;
grant execute on function complete_patient_self_onboarding(text,text,text,text) to authenticated;
