# Student Hub

Student Hub is a Vite + React + TypeScript application that helps administrators and students track academic performance, rankings, achievements, and Supabase-backed profiles. It includes dashboards, analytics, ranking methodologies (TOPSIS/WSM/SAW/AHP), and CRUD flows for admins to manage student data.

## Tech stack

- Vite + React (TypeScript)
- Supabase (auth, Postgres, Storage)
- shadcn/ui + Tailwind CSS
- React Router, React Query, Zod, React Hook Form

## Getting started

```bash
git clone <REPO_URL>
cd student-hub
npm install
npm run dev
```

> Requires Node.js 18+. Using [`nvm`](https://github.com/nvm-sh/nvm) is recommended for managing versions.

### Available scripts

- `npm run dev` – start the Vite dev server
- `npm run build` – create a production build
- `npm run build:dev` – build using development mode (useful for Supabase Edge previews)
- `npm run preview` – preview the production bundle
- `npm run lint` – run ESLint on the project

## Environment variables

Supabase credentials are required for authentication, storage, and database calls.

```bash
cp .env.example .env

# edit .env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Restart the dev server whenever environment variables change.

## Database & storage setup

1. Run `supabase/schema.sql` in the Supabase SQL editor (or via `psql`) to create the tables, enums, and constraints referenced by the app.
2. Apply `supabase/seed_students.sql` to load canonical demo data plus storage bucket policies for profile pictures.
3. Ensure a public `profile_pictures` storage bucket exists; the seed script includes an idempotent `insert ... on conflict do nothing` for convenience.

```bash
psql "$SUPABASE_DB_URL" -f supabase/schema.sql
psql "$SUPABASE_DB_URL" -f supabase/seed_students.sql
```

## Demo accounts

Two sample accounts are available for quick testing:

- Admin — `admin@gmail.com` / `admin@123`
- Student — `Chinmay@gmail.com` / `student@123`

Use the Register tab on the login page to add additional test users.

## Project structure highlights

- `src/pages` – routed views (dashboards, rankings, analytics, admin tools)
- `src/components` – shared UI (Navbar plus shadcn-generated primitives)
- `src/services` – Supabase data access (students, profiles, storage, logs, etc.)
- `src/lib/rankingMethods.ts` – client-side ranking algorithms + helpers
- `supabase/` – SQL schema & seed scripts for Postgres + Storage setup

## Contributing

1. Create a feature branch.
2. Make changes and ensure `npm run lint` passes.
3. Open a pull request describing the updates and any Supabase SQL steps applied.

Feel free to tailor the copy above to match your deployment tooling or CI/CD workflow.
