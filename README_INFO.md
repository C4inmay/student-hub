# Student Hub – Project Information

This document outlines the technology choices, backend/data layers, and how the codebase is organized so contributors can quickly find the relevant files.

## Tech Stack

| Layer | Primary Tools | Notes |
| --- | --- | --- |
| Frontend | Vite, React 18 (TypeScript), shadcn/ui, Tailwind CSS | UI components, routing, and client-side logic. |
| State/Data | React Query, React Hook Form, Zod | Fetching, caching, form validation, and schema validation. |
| Backend API | Supabase JS SDK (`supabaseClient.js`) | Handles auth, database RPCs, and Storage uploads directly from the client. |
| Database | Supabase Postgres (`supabase/schema.sql`) | Tables for students, profiles, achievements, admins, and ancillary entities. |
| Storage | Supabase Storage (`profile_pictures` bucket) | Stores uploaded profile pictures with helper logic in `src/services/storage.ts`. |

## High-Level Project Structure

```
student-hub/
├── src/
│   ├── components/          # Reusable UI (Navbar, shadcn primitives, etc.)
│   ├── contexts/            # React context providers (auth, theme, etc.)
│   ├── hooks/               # Custom hooks like toast/mobile helpers
│   ├── lib/                 # Utilities, ranking algorithms, Supabase helpers
│   ├── pages/               # Route-level screens (dashboards, analytics, forms)
│   ├── services/            # Supabase data access (students, admins, storage)
│   ├── types/               # Global TypeScript types for auth/database
│   └── main.tsx             # App bootstrap + render
├── public/                  # Static assets (new favicon, placeholder SVG)
├── supabase/                # SQL schema + seeds for Postgres/Storage
├── supabaseClient.js        # Supabase client + bucket constants
├── README.md                # Main project overview, setup, and workflows
├── README_INFO.md           # (This file) detailed structure reference
└── vite.config.ts           # Vite + plugin configuration
```

## Key Files & Their Roles

### Frontend Entrypoints
- `src/main.tsx`: mounts React app with providers.
- `src/App.tsx`: defines all routes (public, student, admin) and wraps global providers (React Query, Tooltip, Toasts).

### Navigation & Layout
- `src/components/Navbar.tsx`: dynamic navbar for public, student, and admin users. Pulls links from `NavLink` helper for active states.
- `src/components/NavLink.tsx`: thin wrapper around `react-router` `NavLink` to support `activeClassName` in a type-safe way.

### Context & Auth
- `src/contexts/AuthContext.tsx`: Supabase-auth backed context exposing `user`, `isAuthenticated`, `logout`, etc. All secure pages consume this context.

### Pages Overview
- `src/pages/Home.tsx`: Student performance dashboard (also surfaced at `/admin/performance`).
- `src/pages/Login.tsx`: Supabase email/password login and registration flow.
- `src/pages/StudentDirectory.tsx` & `StudentProfile.tsx`: read-only directory listing and detail view.
- `src/pages/Rankings.tsx`: New ranking experience with algorithm switcher (TOPSIS/WSM/SAW/AHP) powered by `src/lib/rankingMethods.ts`.
- `src/pages/Analytics.tsx`: Supabase-powered analytics cards/charts.
- `src/pages/StudentDashboard.tsx`: student-specific actions (profile submission, approvals, etc.).
- `src/pages/CreateStudentProfile.tsx` / `UpdateStudentProfile.tsx`: forms that upload to Supabase Storage before persisting student profiles.
- `src/pages/AdminDashboard.tsx`: admin KPI cards, verification queues, and log feed.
- `src/pages/AdminManageStudent.tsx`: admin edit/delete + profile picture cleanup.
- `src/pages/AdminVerifyStudent.tsx`: review+approve pipeline for submitted profiles.

### Services (Data Access Layer)
- `src/services/students.ts`: CRUD + helpers for the `students` table; includes `upsertStudentByUid` used during approvals.
- `src/services/studentProfiles.ts`: CRUD + verification workflow + hydration of achievements.
- `src/services/profileAchievements.ts`: sync helpers for certificates/hackathons/sports/internships/extracurricular tables.
- `src/services/storage.ts`: upload/delete helpers for the `profile_pictures` bucket (normalizes paths, resolves public URLs).
- `src/services/adminStudents.ts`, `logs.ts`, `events.ts`, etc.: smaller modules that encapsulate Supabase queries/mutations per feature area.

### Utilities & Libraries
- `src/lib/utils.ts`: common `cn` helper and other utility functions.
- `src/lib/rankingMethods.ts`: client-side ranking algorithms (TOPSIS, WSM, SAW, AHP) + candidate builders and defaults.

#### Ranking Algorithms in Detail
- **TOPSIS (Technique for Order Preference by Similarity to Ideal Solution)**
	- Implemented in `calculateTopsis` inside `src/lib/rankingMethods.ts`.
	- Used by `src/pages/Rankings.tsx` when the user selects the "TOPSIS" option.
	- After vector normalization and weighted scoring, students are ranked by proximity to ideal best/worst solutions.
- **WSM (Weighted Sum Model)**
	- Implemented in `calculateWsm`.
	- Available via the same ranking selector; uses min–max normalization and sums weighted contributions.
- **SAW (Simple Additive Weighting)**
	- Implemented in `calculateSaw`.
	- Also available in the ranking selector; normalizes values by the max reference for each criterion.
- **AHP (Analytic Hierarchy Process – simplified)**
	- Implemented in `calculateAhp` along with `buildPairwiseMatrixFromWeights`.
	- `Rankings.tsx` falls back to SAW after deriving weights from the pairwise matrix, allowing admins to compare priority distributions.
- **Where applied**: All algorithms run inside `src/pages/Rankings.tsx` via the `runAlgorithm` helper. The resulting scores are shown in the "Overall" tab and integrated into the UI badges when the "Overall" ranking is selected.

### Database & Seeds
- `supabase/schema.sql`: canonical database schema (tables, enums, constraints) for Supabase Postgres.
- `supabase/seed_students.sql`: idempotent seed script that wipes demo UIDs, inserts canonical students, achievements, and configures storage bucket policies.

### Configuration
- `vite.config.ts`: Vite + React SWC plugin config, dev server settings, and path aliases (`@` → `src`).
- `tailwind.config.ts`: Tailwind configuration aligned with shadcn tokens.
- `tsconfig*.json`: TypeScript configs for app, node scripts, and overall compiler options.

## How Frontend, Backend, and Database Interact
1. **Frontend pages/components** call functions in `src/services/*`.
2. **Services** use the singleton Supabase client (`supabaseClient.js`) to run queries/mutations against Postgres tables or Storage buckets.
3. **Database** structure defined in `supabase/schema.sql` ensures the client queries match available columns/constraints. Seeds & storage helpers keep demo data and profile images in sync.

Having this quick-reference should make it easier to onboard new contributors or revisit parts of the project months later. Update this file whenever new major areas (pages, services, or schema changes) are added.
