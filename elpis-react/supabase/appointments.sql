-- Real appointments — replaces the hardcoded "Next appointment" strings on
-- the Dashboard and the dead Sidebar "Appointments" link (href="#"). Same
-- provider-writes/patient-reads shape as authorizations.sql.
--
-- No provider-side UI ships in this pass — that's a separate follow-up — so
-- for now appointments only get created by a provider running SQL directly
-- (or via a future ProviderPatientDetail form using the same insert policy
-- below). Patients with no appointments on file will correctly see an empty
-- state rather than a fake one, which is the honest behavior until that
-- provider UI exists.

create table appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  type text not null,
  scheduled_at timestamptz not null,
  location text,
  provider_note text,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  created_by uuid not null references profiles(id),
  updated_at timestamptz not null default now()
);
alter table appointments enable row level security;

create policy "patient selects own appointments" on appointments for select
  using (patient_id in (select id from patients where profile_id = (select auth.uid())));
create policy "provider selects assigned patients' appointments" on appointments for select
  using (patient_id in (select id from patients where provider_id = (select auth.uid())));
create policy "provider inserts appointments for assigned patients" on appointments for insert
  with check (
    created_by = (select auth.uid())
    and patient_id in (select id from patients where provider_id = (select auth.uid()))
  );

-- Reschedule / status change go through RPCs (not raw UPDATE policies) so
-- only the assigned provider can move a patient's appointment, matching
-- update_authorization_status's pattern.
create or replace function reschedule_appointment(
  appointment_id uuid,
  new_scheduled_at timestamptz,
  new_location text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update appointments
  set scheduled_at = new_scheduled_at,
      location = coalesce(new_location, location),
      updated_at = now()
  where id = appointment_id
    and patient_id in (select id from patients where provider_id = auth.uid());
end;
$$;

create or replace function update_appointment_status(appointment_id uuid, new_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update appointments
  set status = new_status, updated_at = now()
  where id = appointment_id
    and patient_id in (select id from patients where provider_id = auth.uid());
end;
$$;

alter publication supabase_realtime add table appointments;
create index on appointments (patient_id);
create index on appointments (scheduled_at);
