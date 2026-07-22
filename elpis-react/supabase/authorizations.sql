create table authorizations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  procedure text not null,
  status text not null default 'submitted' check (status in ('submitted','under_review','approved','denied')),
  submitted_date date not null default current_date,
  decision_date date,
  at_risk_note text,
  created_by uuid not null references profiles(id),
  updated_at timestamptz not null default now()
);
alter table authorizations enable row level security;

create policy "patient selects own authorizations" on authorizations for select
  using (patient_id in (select id from patients where profile_id = (select auth.uid())));
create policy "provider selects assigned patients' authorizations" on authorizations for select
  using (patient_id in (select id from patients where provider_id = (select auth.uid())));
create policy "provider inserts authorizations for assigned patients" on authorizations for insert
  with check (
    created_by = (select auth.uid())
    and patient_id in (select id from patients where provider_id = (select auth.uid()))
  );

-- Two RPCs, not one: status progression (decision_date only ever gets *set*,
-- never cleared, so coalesce-on-null is correct there) and the risk note
-- (which must be explicitly clearable once a flagged risk resolves — a single
-- coalesce-everything RPC can never null out at_risk_note again).
create or replace function update_authorization_status(
  authorization_id uuid,
  new_status text,
  new_decision_date date default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update authorizations
  set status = new_status,
      decision_date = coalesce(new_decision_date, decision_date),
      updated_at = now()
  where id = authorization_id
    and patient_id in (select id from patients where provider_id = auth.uid());
end;
$$;

create or replace function set_authorization_risk_note(authorization_id uuid, note text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update authorizations
  set at_risk_note = note,
      updated_at = now()
  where id = authorization_id
    and patient_id in (select id from patients where provider_id = auth.uid());
end;
$$;

alter publication supabase_realtime add table authorizations;
create index on authorizations (patient_id);
