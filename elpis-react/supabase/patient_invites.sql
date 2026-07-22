create extension if not exists pgcrypto;

alter table patients add column emergency_contact_name text;
alter table patients add column emergency_contact_phone text;
alter table patients add column preferred_language text;

-- Database-level backstop: two patient rows can never share a profile_id.
-- (Postgres treats multiple NULLs as distinct, so unclaimed roster rows are unaffected.)
alter table patients add constraint patients_profile_id_key unique (profile_id);

-- The old blanket "patient updates own row" policy is dead code (confirmed: nothing in
-- the client calls .update() on patients) and RLS gates rows, not columns — it could never
-- stop a patient from also patching diagnosis/provider_id in the same request as phone.
-- update_patient_contact_info() below becomes the sole, column-scoped write path.
drop policy "patient updates own row" on patients;

create table patient_invites (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  invited_email text not null,
  token text not null unique default encode(gen_random_bytes(24), 'hex'), -- 192 bits
  status text not null default 'pending' check (status in ('pending','claimed','expired','revoked')),
  created_by uuid not null references profiles(id),
  claimed_by uuid references profiles(id),
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  claimed_at timestamptz
);
alter table patient_invites enable row level security;

create policy "provider selects own invites" on patient_invites for select
  using (created_by = (select auth.uid()));

create index on patient_invites (patient_id);

-- No client-side INSERT policy on patients or patient_invites — creation only ever
-- happens through this one RPC, which is role-checked and atomic (patient + invite
-- created together, so there's no dangling unclaimed row if the client dies mid-flow).
create or replace function provider_create_patient_with_invite(
  p_full_name text, p_age int, p_diagnosis text, p_phase text,
  p_invited_email text, p_next_appointment_note text default null
)
returns table (patient_id uuid, invite_token text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_patient_id uuid;
  v_token text;
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'provider') then
    raise exception 'Only providers can add patients';
  end if;

  insert into patients (full_name, age, diagnosis, phase, provider_id, next_appointment_note, profile_id)
  values (p_full_name, p_age, p_diagnosis, p_phase, auth.uid(), p_next_appointment_note, null)
  returning id into v_patient_id;

  insert into patient_invites (patient_id, invited_email, created_by)
  values (v_patient_id, p_invited_email, auth.uid())
  returning token into v_token;

  return query select v_patient_id, v_token;
end;
$$;
grant execute on function provider_create_patient_with_invite(text,int,text,text,text,text) to authenticated;

-- Claim: links the newly-authenticated caller to the pre-existing patient record.
-- Email-match check closes the gap where a leaked token (forwarded email, browser
-- history, a link-preview bot) would otherwise let anyone who authenticates first
-- permanently bind someone else's clinical record to their own account.
create or replace function claim_patient_invite(invite_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_patient_id uuid;
  v_invited_email text;
begin
  select patient_id, invited_email into v_patient_id, v_invited_email
  from patient_invites
  where token = invite_token and status = 'pending' and expires_at > now();

  if v_patient_id is null then
    raise exception 'Invalid or expired invite';
  end if;

  if lower(auth.email()) is distinct from lower(v_invited_email) then
    raise exception 'This invite was sent to a different email address';
  end if;

  -- Atomic compare-and-swap: under READ COMMITTED, a concurrent second claim attempt
  -- blocks on the row lock, re-evaluates WHERE post-commit, matches zero rows, and
  -- raises here — correct even for two simultaneous claims of the same token.
  update patients set profile_id = auth.uid()
  where id = v_patient_id and profile_id is null;

  if not found then
    raise exception 'This patient record has already been claimed';
  end if;

  update patient_invites set status = 'claimed', claimed_by = auth.uid(), claimed_at = now()
  where token = invite_token;

  return v_patient_id;
end;
$$;
grant execute on function claim_patient_invite(text) to authenticated;

-- Pre-auth preview so the /claim page can show "Dr. X has invited you" before the
-- patient creates an account. Returns only a first name (not full name) + provider
-- name + status/expiry — no clinical data. invited_email is returned too so the
-- client can pre-fill/lock the signup email field to reduce the chance of a mismatch
-- against the claim_patient_invite check above.
create or replace function get_invite_preview(invite_token text)
returns table (patient_first_name text, invited_email text, provider_name text, status text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select split_part(p.full_name, ' ', 1), pi.invited_email, prov.full_name, pi.status, pi.expires_at
  from patient_invites pi
  join patients p on p.id = pi.patient_id
  join profiles prov on prov.id = pi.created_by
  where pi.token = invite_token;
end;
$$;
grant execute on function get_invite_preview(text) to anon, authenticated;

-- Patient's own onboarding-details submission — writes both patients (contact-adjacent
-- columns only, never clinical) and profiles.phone in one transaction, so there's no
-- partial-failure window between the two.
create or replace function update_patient_contact_info(
  new_phone text, new_emergency_contact_name text,
  new_emergency_contact_phone text, new_preferred_language text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update patients
  set emergency_contact_name = new_emergency_contact_name,
      emergency_contact_phone = new_emergency_contact_phone,
      preferred_language = new_preferred_language
  where profile_id = auth.uid();

  if not found then
    raise exception 'No patient record linked to this account';
  end if;

  update profiles set phone = new_phone where id = auth.uid();
end;
$$;
grant execute on function update_patient_contact_info(text,text,text,text) to authenticated;
