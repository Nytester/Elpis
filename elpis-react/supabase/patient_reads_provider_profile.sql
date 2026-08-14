-- Patients could already message their real assigned provider (the "osei"
-- thread in CareTeam.jsx is wired to the real messages table), but there was
-- no RLS policy letting a patient read their provider's own profile row —
-- only the reverse (provider reading assigned patients) existed. Without a
-- real name to show, the UI fell back to a hardcoded placeholder
-- ("Dr. Rina Osei") for every patient, regardless of who their actual
-- provider is. This is the missing, narrowly-scoped read policy.
create policy "patient reads assigned provider's profile" on profiles for select
  using (id in (select provider_id from patients where profile_id = (select auth.uid())));
