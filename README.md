# Elpis

Cancer care coordination web app — a shared React frontend backed by a single real Supabase project (Postgres, Auth, RLS, Realtime, Edge Functions). The app code lives in [`elpis-react/`](elpis-react/).

## Prerequisites

- Node.js 18+ and npm
- Git

## 1. Clone and install

```bash
git clone https://github.com/Nytester/Elpis.git
cd Elpis/elpis-react
npm install
```

## 2. Environment variables

Copy the example file:

```bash
cp .env.example .env
```

Then fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — **ask the repo owner for these** (sent privately, not committed here since this repo is public). The anon key is safe to hold locally but shouldn't be pasted into commits, issues, or anywhere else public.

## 3. Run it

```bash
npm run dev
```

Opens at `http://localhost:5173`. Ask the repo owner for a test patient and provider login, or use the "+ Invite patient" flow from the provider dashboard once you have a provider account.

## Backend access (Supabase)

This project uses **one shared Supabase project** — there's no local/per-developer database. If you need to touch anything backend-side (SQL, RLS policies, Edge Functions, secrets):

1. Ask the repo owner to invite you as a member on the Supabase project (Project Settings → Team).
2. SQL migrations live in `elpis-react/supabase/*.sql` and have already been run against the shared project — you don't need to re-run existing ones. If you write a **new** migration, coordinate with the repo owner before running it against the shared database.
3. Edge Functions (`elpis-react/supabase/functions/*/index.ts`) are deployed by pasting the code directly into the Supabase Dashboard → Edge Functions → Deploy (this project doesn't use the Supabase CLI). If you edit one, get the updated code to the repo owner to redeploy, or ask for dashboard access.
4. Third-party secrets (Google OAuth client secret, Resend API key, Supabase service-role key) are stored only in Supabase's dashboard secrets and are never in this repo. You generally won't need them directly — ask the repo owner if a task requires them.

## Project structure

- `elpis-react/src/pages/` — routed pages (patient dashboard, provider dashboard, public marketing pages)
- `elpis-react/src/context/` — `AuthContext` (Supabase auth/session/profile), `PatientDataContext` (patient-scoped realtime data)
- `elpis-react/src/hooks/` — provider-side data hooks (roster, patient detail, inbox)
- `elpis-react/supabase/` — SQL schema/migrations and Edge Functions

## Workflow

Please branch off `main` for changes (`git checkout -b your-feature`) and open a PR rather than pushing straight to `main`, so we can both see what's changing before it lands.
