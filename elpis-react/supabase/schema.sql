-- Elpis Phase 1 schema: profiles, patients, symptoms, refill_requests
-- Run once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query)

-- profiles: one row per authenticated user, role-gated
create table profiles (
  id uuid primary key references auth.users(id),
  role text not null check (role in ('patient','provider','caregiver')),
  full_name text,
  email text,
  phone text
);
alter table profiles enable row level security;

-- patients: the roster. profile_id nullable = "unclaimed" roster entry (seeded mock patients with no login yet)
create table patients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id),
  age int,
  diagnosis text,
  phase text,
  provider_id uuid references profiles(id),
  next_appointment_note text,
  last_check_in_note text,
  created_at timestamptz default now()
);
alter table patients enable row level security;

-- profiles policies (defined after patients exists, since they reference it)
create policy "self select" on profiles for select
  using (id = (select auth.uid()));
create policy "self update" on profiles for update
  using (id = (select auth.uid()));
create policy "provider reads assigned patients' profiles" on profiles for select
  using (id in (select profile_id from patients where provider_id = (select auth.uid())));

-- patients policies
create policy "patient reads own row" on patients for select
  using (profile_id = (select auth.uid()));
create policy "patient updates own row" on patients for update
  using (profile_id = (select auth.uid()));
create policy "provider reads assigned patients" on patients for select
  using (provider_id = (select auth.uid()));

-- symptoms
create table symptoms (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  symptom text not null,
  severity text not null check (severity in ('Mild','Moderate','Severe')),
  notes text,
  logged_at timestamptz not null default now()
);
alter table symptoms enable row level security;

create policy "patient selects own symptoms" on symptoms for select
  using (patient_id in (select id from patients where profile_id = (select auth.uid())));
create policy "patient inserts own symptoms" on symptoms for insert
  with check (patient_id in (select id from patients where profile_id = (select auth.uid())));
create policy "provider selects assigned patients' symptoms" on symptoms for select
  using (patient_id in (select id from patients where provider_id = (select auth.uid())));

-- refill_requests: medication_name is a plain string (no medications table this phase —
-- matches what Medications.jsx already passes: requestRefillShared(med.name))
create table refill_requests (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  medication_name text not null,
  status text not null default 'pending' check (status in ('pending','handled')),
  requested_at timestamptz not null default now()
);
alter table refill_requests enable row level security;

create policy "patient selects own refill requests" on refill_requests for select
  using (patient_id in (select id from patients where profile_id = (select auth.uid())));
create policy "patient inserts own refill requests" on refill_requests for insert
  with check (patient_id in (select id from patients where profile_id = (select auth.uid())));
create policy "provider selects assigned patients' refill requests" on refill_requests for select
  using (patient_id in (select id from patients where provider_id = (select auth.uid())));

-- Provider "mark handled" goes through an RPC, not a raw UPDATE policy —
-- a table-level UPDATE policy can't restrict *which columns* change (a provider
-- could otherwise rewrite patient_id). SECURITY DEFINER + explicit ownership
-- check inside the function keeps this narrow and auditable.
create or replace function mark_refill_handled(request_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update refill_requests
  set status = 'handled'
  where id = request_id
    and patient_id in (select id from patients where provider_id = auth.uid());
end;
$$;

-- New auth.users row -> profiles row. Role is clamped server-side: a public
-- signUp() call can attach arbitrary raw_user_meta_data, so this must never
-- trust 'provider' from that metadata. Provider accounts are seeded manually.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into profiles (id, role, full_name, email)
  values (
    new.id,
    case when new.raw_user_meta_data->>'role' = 'caregiver' then 'caregiver' else 'patient' end,
    new.raw_user_meta_data->>'full_name',
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Realtime: tables aren't live over postgres_changes until added to the publication
alter publication supabase_realtime add table symptoms, refill_requests;
