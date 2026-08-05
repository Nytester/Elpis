-- Plain-language coverage summary (plan name, deductible, out-of-pocket max).
-- Patient-entered, real numbers from their own insurance card/plan — there's
-- no eligibility/claims API integration here, so this is never auto-filled
-- or guessed; it's just a structured place to put what the patient already
-- knows, one row per patient (upsert, not an append-only log).

create table insurance_coverage (
  patient_id uuid primary key references patients(id),
  plan_name text,
  member_id text,
  deductible_total numeric(10,2),
  deductible_met numeric(10,2),
  oop_max_total numeric(10,2),
  oop_met numeric(10,2),
  notes text,
  updated_at timestamptz not null default now()
);
alter table insurance_coverage enable row level security;

create policy "patient selects own coverage" on insurance_coverage for select
  using (patient_id in (select id from patients where profile_id = (select auth.uid())));
create policy "patient inserts own coverage" on insurance_coverage for insert
  with check (patient_id in (select id from patients where profile_id = (select auth.uid())));
create policy "patient updates own coverage" on insurance_coverage for update
  using (patient_id in (select id from patients where profile_id = (select auth.uid())));
create policy "provider selects assigned patients' coverage" on insurance_coverage for select
  using (patient_id in (select id from patients where provider_id = (select auth.uid())));

alter publication supabase_realtime add table insurance_coverage;
