-- "Need help with this?" — a patient-raised task that lands on the assigned
-- provider's roster as an alert, same visibility shape as authorizations.sql.
-- Scoped generally (not insurance-only) since the same pattern is the right
-- shape for any "flag this for my care team" button elsewhere later, but the
-- only caller today is the Insurance page.

create table care_tasks (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  authorization_id uuid references authorizations(id),
  category text not null default 'insurance_help' check (category in ('insurance_help','other')),
  note text,
  status text not null default 'open' check (status in ('open','in_progress','done')),
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
alter table care_tasks enable row level security;

create policy "patient selects own tasks" on care_tasks for select
  using (patient_id in (select id from patients where profile_id = (select auth.uid())));
create policy "patient inserts own tasks" on care_tasks for insert
  with check (
    created_by = (select auth.uid())
    and patient_id in (select id from patients where profile_id = (select auth.uid()))
  );
create policy "provider selects assigned patients' tasks" on care_tasks for select
  using (patient_id in (select id from patients where provider_id = (select auth.uid())));

-- Status changes go through an RPC (not a raw UPDATE policy) so only the
-- assigned provider can resolve a task, matching update_authorization_status.
create or replace function update_care_task_status(task_id uuid, new_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update care_tasks
  set status = new_status,
      resolved_at = case when new_status = 'done' then now() else resolved_at end
  where id = task_id
    and patient_id in (select id from patients where provider_id = auth.uid());
end;
$$;

alter publication supabase_realtime add table care_tasks;
create index on care_tasks (patient_id);
