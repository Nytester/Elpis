-- Insurance document uploads (cards, EOBs, denial letters, appeals) — real
-- Supabase Storage, not the local-only fake upload the general Documents
-- page currently has. Mirrors the community-photos bucket pattern in
-- community.sql: a PRIVATE bucket, signed URLs for reads, RLS on both the
-- metadata table and storage.objects.
--
-- Unlike community photos (author-owned, folder = auth.uid()), these are
-- PATIENT-owned — either the patient or their assigned provider can upload
-- one, so the storage folder is patient_id, not the uploader's own auth.uid().

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'insurance-documents', 'insurance-documents', false,
  10485760, -- 10 MB — EOBs/denial-letter PDFs run bigger than a typical photo
  array['application/pdf','image/jpeg','image/png','image/webp']
)
on conflict (id) do nothing;

-- ============================================================================
-- insurance_documents
-- ============================================================================
create table insurance_documents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  authorization_id uuid references authorizations(id), -- optional link to the specific prior-auth/claim this doc supports
  name text not null,
  category text not null default 'other' check (category in ('insurance_card','eob','denial_letter','appeal','other')),
  file_path text not null,
  size_bytes bigint,
  uploaded_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);
alter table insurance_documents enable row level security;

create policy "patient selects own insurance documents" on insurance_documents for select
  using (patient_id in (select id from patients where profile_id = (select auth.uid())));
create policy "provider selects assigned patients' insurance documents" on insurance_documents for select
  using (patient_id in (select id from patients where provider_id = (select auth.uid())));

create policy "patient inserts own insurance documents" on insurance_documents for insert
  with check (
    uploaded_by = (select auth.uid())
    and patient_id in (select id from patients where profile_id = (select auth.uid()))
  );
create policy "provider inserts insurance documents for assigned patients" on insurance_documents for insert
  with check (
    uploaded_by = (select auth.uid())
    and patient_id in (select id from patients where provider_id = (select auth.uid()))
  );

-- Whoever uploaded it can remove it — not scoped further by role, since both
-- a patient and a provider can be the uploader and either should be able to
-- undo their own mistake without needing the other party's involvement.
create policy "uploader deletes own insurance document row" on insurance_documents for delete
  using (uploaded_by = (select auth.uid()));

create index on insurance_documents (patient_id);

-- ============================================================================
-- Storage RLS (storage.objects) — private bucket, so these are the ONLY way
-- to read/write/delete the underlying files. The read policy reuses the
-- table's own RLS transitively (same subquery-composition trick as
-- community-photos): a signed URL request only succeeds if the querying
-- user could also see the corresponding insurance_documents row.
-- ============================================================================
create policy "insurance docs: read own/assigned patient docs" on storage.objects for select
  using (
    bucket_id = 'insurance-documents'
    and exists (select 1 from insurance_documents where file_path = storage.objects.name)
  );

create policy "insurance docs: upload for own or assigned patient" on storage.objects for insert
  with check (
    bucket_id = 'insurance-documents'
    and (storage.foldername(name))[1]::uuid in (
      select id from patients where profile_id = (select auth.uid())
      union
      select id from patients where provider_id = (select auth.uid())
    )
  );

create policy "insurance docs: delete own uploads" on storage.objects for delete
  using (
    bucket_id = 'insurance-documents'
    and exists (select 1 from insurance_documents where file_path = storage.objects.name and uploaded_by = (select auth.uid()))
  );

-- ============================================================================
-- Realtime
-- ============================================================================
alter publication supabase_realtime add table insurance_documents;
