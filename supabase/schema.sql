-- Supabase/Postgres schema for Student Hub
-- Execute inside the Supabase SQL editor or with psql.

create schema if not exists public;
create extension if not exists "uuid-ossp";

-- Enum definitions ---------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_category') THEN
    CREATE TYPE event_category AS ENUM ('Seminar', 'Workshop', 'Competition', 'Guest Lecture');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
    CREATE TYPE attendance_status AS ENUM ('Present', 'Absent');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'certificate_status') THEN
    CREATE TYPE certificate_status AS ENUM ('Generated', 'Pending');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_user_type') THEN
    CREATE TYPE notification_user_type AS ENUM ('Student', 'Admin');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
    CREATE TYPE admin_role AS ENUM ('SuperAdmin', 'DepartmentAdmin');
  END IF;
END
$$;

-- 1. Departments -----------------------------------------------------------
create table if not exists public.departments (
  dept_id       bigserial primary key,
  dept_name     varchar(255) not null unique,
  dept_description text,
  created_at    timestamptz not null default now()
);

-- 2. Students --------------------------------------------------------------
create table if not exists public.students (
  student_id    bigserial primary key,
  student_name  varchar(255) not null,
  email         varchar(255) not null unique,
  uid           varchar(100) not null unique,
  year          varchar(50) not null,
  branch        varchar(100) not null,
  skills        text,
  created_at    timestamptz not null default now()
);

-- 2a. Student Profiles ----------------------------------------------------
create table if not exists public.student_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id       text not null,
  name          text not null,
  uid           text not null unique,
  email         text not null,
  year          integer not null check (year between 1 and 4),
  branch        text not null,
  major         text not null,
  cgpa          numeric(3,2) not null check (cgpa between 0 and 10),
  skills        text[] not null default '{}',
  profile_picture text,
  verification_status text not null default 'pending' check (verification_status in ('pending','approved','rejected')),
  rejection_reason text,
  submitted_at  timestamptz not null default now(),
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists idx_student_profiles_user on public.student_profiles(user_id);

-- 2b. Profile Achievements ------------------------------------------------
create table if not exists public.student_certificates (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.student_profiles(id) on delete cascade,
  user_id text not null,
  student_id bigint references public.students(student_id) on delete cascade,
  title text not null,
  category text not null,
  year text not null,
  proof_link text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists idx_student_certificates_profile on public.student_certificates(profile_id);

create table if not exists public.student_hackathons (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.student_profiles(id) on delete cascade,
  user_id text not null,
  student_id bigint references public.students(student_id) on delete cascade,
  event_name text not null,
  position text not null,
  year text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists idx_student_hackathons_profile on public.student_hackathons(profile_id);

create table if not exists public.sports_achievements (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.student_profiles(id) on delete cascade,
  user_id text not null,
  student_id bigint references public.students(student_id) on delete cascade,
  sport text not null,
  level text not null,
  position text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists idx_sports_achievements_profile on public.sports_achievements(profile_id);

create table if not exists public.student_internships (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.student_profiles(id) on delete cascade,
  user_id text not null,
  student_id bigint references public.students(student_id) on delete cascade,
  company text not null,
  role text not null,
  duration text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists idx_student_internships_profile on public.student_internships(profile_id);

create table if not exists public.extracurricular_activities (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.student_profiles(id) on delete cascade,
  user_id text not null,
  student_id bigint references public.students(student_id) on delete cascade,
  activity_name text not null,
  year text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists idx_extracurricular_activities_profile on public.extracurricular_activities(profile_id);

-- 3. Admins ---------------------------------------------------------------
create table if not exists public.admins (
  admin_id      bigserial primary key,
  admin_name    varchar(255) not null,
  email         varchar(255) not null unique,
  password      varchar(255) not null,
  role          admin_role not null default 'DepartmentAdmin',
  dept_id       bigint references public.departments(dept_id) on delete set null,
  created_at    timestamptz not null default now()
);

-- 4. Events ---------------------------------------------------------------
create table if not exists public.events (
  event_id      bigserial primary key,
  dept_id       bigint references public.departments(dept_id) on delete set null,
  event_name    varchar(255) not null,
  event_category event_category not null,
  event_date    date not null,
  event_time    time not null,
  venue         varchar(255) not null,
  description   text,
  created_by    bigint references public.admins(admin_id) on delete set null,
  created_at    timestamptz not null default now()
);

-- 5. Registrations --------------------------------------------------------
create table if not exists public.registrations (
  registration_id bigserial primary key,
  event_id      bigint not null references public.events(event_id) on delete cascade,
  student_id    bigint not null references public.students(student_id) on delete cascade,
  registration_date timestamptz not null default now(),
  constraint registrations_unique_event_student unique (event_id, student_id)
);

-- 6. Attendance -----------------------------------------------------------
create table if not exists public.attendance (
  attendance_id bigserial primary key,
  event_id      bigint not null references public.events(event_id) on delete cascade,
  student_id    bigint not null references public.students(student_id) on delete cascade,
  scan_time     timestamptz not null default now(),
  status        attendance_status not null default 'Present'
);

create unique index if not exists attendance_unique_event_student on public.attendance (event_id, student_id);

-- 7. Certificates ---------------------------------------------------------
create table if not exists public.certificates (
  certificate_id bigserial primary key,
  event_id      bigint not null references public.events(event_id) on delete cascade,
  student_id    bigint not null references public.students(student_id) on delete cascade,
  cert_url      varchar(512) not null,
  generated_at  timestamptz not null default now(),
  status        certificate_status not null default 'Pending',
  constraint certificates_unique_event_student unique (event_id, student_id)
);

-- 8. Logs -----------------------------------------------------------------
create table if not exists public.logs (
  log_id        bigserial primary key,
  admin_id      bigint references public.admins(admin_id) on delete set null,
  action        text not null,
  event_id      bigint references public.events(event_id) on delete set null,
  created_at    timestamptz not null default now()
);

-- 9. Notifications --------------------------------------------------------
create table if not exists public.notifications (
  notification_id bigserial primary key,
  user_type     notification_user_type not null,
  user_id       bigint not null,
  message       text not null,
  created_at    timestamptz not null default now(),
  read_status   boolean not null default false
);

comment on table public.notifications is 'user_id refers to students.student_id when user_type = ''Student'' and admins.admin_id when user_type = ''Admin''.';

-- Optional helper indexes -------------------------------------------------
create index if not exists idx_events_dept on public.events(dept_id);
create index if not exists idx_events_created_by on public.events(created_by);
create index if not exists idx_registrations_student on public.registrations(student_id);
create index if not exists idx_attendance_status on public.attendance(status);
create index if not exists idx_certificates_status on public.certificates(status);
create index if not exists idx_logs_admin on public.logs(admin_id);
create index if not exists idx_notifications_user on public.notifications(user_type, user_id);