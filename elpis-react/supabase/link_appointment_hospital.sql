-- Lets a patient attach a hospital (from the static, curated HOSPITALS list
-- in src/lib/hospitals.js — not a database table, so hospital_id is just the
-- zip+name identifier computed by hospitalId() in that file) to one of their
-- own upcoming appointments, from the Transportation page. This is a
-- patient-owned convenience field (which hospital am I going to), not a
-- clinical one, so it's a patient-scoped RPC rather than going through the
-- provider-only appointment RPCs in appointments.sql.
alter table appointments add column hospital_id text;

create or replace function link_appointment_hospital(appointment_id uuid, new_hospital_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update appointments
  set hospital_id = new_hospital_id
  where id = appointment_id
    and patient_id in (select id from patients where profile_id = (select auth.uid()));
end;
$$;
