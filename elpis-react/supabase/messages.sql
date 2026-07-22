create table messages (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  author_id uuid not null references profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);
alter table messages enable row level security;

create policy "patient selects own thread" on messages for select
  using (patient_id in (select id from patients where profile_id = (select auth.uid())));
create policy "patient inserts into own thread" on messages for insert
  with check (
    author_id = (select auth.uid())
    and patient_id in (select id from patients where profile_id = (select auth.uid()))
  );
create policy "provider selects assigned patients' threads" on messages for select
  using (patient_id in (select id from patients where provider_id = (select auth.uid())));
create policy "provider inserts into assigned patients' threads" on messages for insert
  with check (
    author_id = (select auth.uid())
    and patient_id in (select id from patients where provider_id = (select auth.uid()))
  );

alter publication supabase_realtime add table messages;

-- Missing since Phase 1 — Postgres doesn't auto-index the referencing side of a
-- FK, so every RLS subquery and provider hook has been sequential-scanning
-- `patients`. Tolerable at hackathon scale; messages is the first chat-frequency
-- table, so fix this now rather than let it compound.
create index on patients (profile_id);
create index on patients (provider_id);
create index on messages (patient_id, created_at);
