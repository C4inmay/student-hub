-- Ensure profile pictures column + bucket + policies exist
alter table public.students
  add column if not exists profile_picture text;

insert into storage.buckets (id, name, public)
values ('profile_pictures', 'profile_pictures', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'profile_pictures_public_read'
  ) then
    create policy "profile_pictures_public_read"
      on storage.objects
      for select
      using (bucket_id = 'profile_pictures');
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'profile_pictures_authenticated_insert'
  ) then
    create policy "profile_pictures_authenticated_insert"
      on storage.objects
      for insert
      with check (
        bucket_id = 'profile_pictures'
        and (auth.role() = 'authenticated' or auth.role() = 'service_role')
      );
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'profile_pictures_authenticated_update'
  ) then
    create policy "profile_pictures_authenticated_update"
      on storage.objects
      for update
      using (
        bucket_id = 'profile_pictures'
        and (auth.role() = 'authenticated' or auth.role() = 'service_role')
      )
      with check (
        bucket_id = 'profile_pictures'
        and (auth.role() = 'authenticated' or auth.role() = 'service_role')
      );
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'profile_pictures_authenticated_delete'
  ) then
    create policy "profile_pictures_authenticated_delete"
      on storage.objects
      for delete
      using (
        bucket_id = 'profile_pictures'
        and (auth.role() = 'authenticated' or auth.role() = 'service_role')
      );
  end if;
end$$;

-- Seed script for demo students + achievements
-- Run inside the Supabase SQL editor or via psql: \i supabase/seed_students.sql

begin;

-- Remove existing achievements tied to the reserved UIDs
delete from public.extracurricular_activities ea
using public.student_profiles sp
where ea.profile_id = sp.id
  and sp.uid in ('STU2021001','STU2021002','STU2021003','STU2021004','STU2021005','STU2021006','STU2021007','STU2021008','STU2021009','STU2021010');

delete from public.student_internships si
using public.student_profiles sp
where si.profile_id = sp.id
  and sp.uid in ('STU2021001','STU2021002','STU2021003','STU2021004','STU2021005','STU2021006','STU2021007','STU2021008','STU2021009','STU2021010');

delete from public.sports_achievements sa
using public.student_profiles sp
where sa.profile_id = sp.id
  and sp.uid in ('STU2021001','STU2021002','STU2021003','STU2021004','STU2021005','STU2021006','STU2021007','STU2021008','STU2021009','STU2021010');

delete from public.student_hackathons sh
using public.student_profiles sp
where sh.profile_id = sp.id
  and sp.uid in ('STU2021001','STU2021002','STU2021003','STU2021004','STU2021005','STU2021006','STU2021007','STU2021008','STU2021009','STU2021010');

delete from public.student_certificates sc
using public.student_profiles sp
where sc.profile_id = sp.id
  and sp.uid in ('STU2021001','STU2021002','STU2021003','STU2021004','STU2021005','STU2021006','STU2021007','STU2021008','STU2021009','STU2021010');

-- Remove profiles + students for the reserved UIDs
delete from public.student_profiles
where uid in ('STU2021001','STU2021002','STU2021003','STU2021004','STU2021005','STU2021006','STU2021007','STU2021008','STU2021009','STU2021010');

delete from public.students
where uid in ('STU2021001','STU2021002','STU2021003','STU2021004','STU2021005','STU2021006','STU2021007','STU2021008','STU2021009','STU2021010');

-- Insert canonical students
insert into public.students (student_name, email, uid, year, branch, skills)
values
  ('Rahul Sharma', 'rahul.sharma@university.edu', 'STU2021001', '3', 'Computer Science', 'Python,React,Machine Learning,Data Structures'),
  ('Priya Patel', 'priya.patel@university.edu', 'STU2021002', '3', 'Computer Science', 'TensorFlow,PyTorch,NLP,Computer Vision'),
  ('Arjun Kumar', 'arjun.kumar@university.edu', 'STU2021003', '2', 'Electronics', 'Arduino,Raspberry Pi,C++,IoT Protocols'),
  ('Sneha Reddy', 'sneha.reddy@university.edu', 'STU2021004', '4', 'Computer Science', 'Network Security,Penetration Testing,Cryptography,Python'),
  ('Vikram Singh', 'vikram.singh@university.edu', 'STU2021005', '3', 'Mechanical', 'CAD,SolidWorks,Finite Element Analysis,Automotive Design'),
  ('Ananya Iyer', 'ananya.iyer@university.edu', 'STU2021006', '2', 'Computer Science', 'React,Node.js,TypeScript,GraphQL'),
  ('Neha Kapoor', 'neha.kapoor@university.edu', 'STU2021007', '4', 'Information Technology', 'SQL,PowerBI,Data Analysis,Python'),
  ('Karan Mehta', 'karan.mehta@university.edu', 'STU2021008', '3', 'Civil Engineering', 'AutoCAD,STAAD Pro,Project Planning,Surveying'),
  ('Divya Nair', 'divya.nair@university.edu', 'STU2021009', '1', 'Computer Science', 'Python,Robotics,ROS,Computer Vision'),
  ('Rohan Das', 'rohan.das@university.edu', 'STU2021010', '2', 'Electronics', 'Embedded C,VHDL,PCB Design,Signal Processing')
on conflict (uid) do update set
  student_name = excluded.student_name,
  email = excluded.email,
  year = excluded.year,
  branch = excluded.branch,
  skills = excluded.skills;

-- Insert approved student profiles
insert into public.student_profiles (
  user_id, name, uid, email, year, branch, major, cgpa, skills, profile_picture,
  verification_status, reviewed_at
)
values
  ('seed-user-rahul', 'Rahul Sharma', 'STU2021001', 'rahul.sharma@university.edu', 3, 'Computer Science', 'Software Engineering', 9.2,
    ARRAY['Python','React','Machine Learning','Data Structures'], null, 'approved', now()),
  ('seed-user-priya', 'Priya Patel', 'STU2021002', 'priya.patel@university.edu', 3, 'Computer Science', 'AI & Data Science', 9.5,
    ARRAY['TensorFlow','PyTorch','NLP','Computer Vision'], null, 'approved', now()),
  ('seed-user-arjun', 'Arjun Kumar', 'STU2021003', 'arjun.kumar@university.edu', 2, 'Electronics', 'IoT Systems', 8.8,
    ARRAY['Arduino','Raspberry Pi','C++','IoT Protocols'], null, 'approved', now()),
  ('seed-user-sneha', 'Sneha Reddy', 'STU2021004', 'sneha.reddy@university.edu', 4, 'Computer Science', 'Cybersecurity', 9.0,
    ARRAY['Network Security','Penetration Testing','Cryptography','Python'], null, 'approved', now()),
  ('seed-user-vikram', 'Vikram Singh', 'STU2021005', 'vikram.singh@university.edu', 3, 'Mechanical', 'Automotive Design', 8.5,
    ARRAY['CAD','AutoCAD','SolidWorks','Finite Element Analysis'], null, 'approved', now()),
  ('seed-user-ananya', 'Ananya Iyer', 'STU2021006', 'ananya.iyer@university.edu', 2, 'Computer Science', 'Web Development', 8.9,
    ARRAY['React','Node.js','TypeScript','GraphQL'], null, 'approved', now()),
  ('seed-user-neha', 'Neha Kapoor', 'STU2021007', 'neha.kapoor@university.edu', 4, 'Information Technology', 'Data Analytics', 9.1,
    ARRAY['SQL','PowerBI','Python','Data Storytelling'], null, 'approved', now()),
  ('seed-user-karan', 'Karan Mehta', 'STU2021008', 'karan.mehta@university.edu', 3, 'Civil Engineering', 'Structural Design', 8.2,
    ARRAY['AutoCAD','STAAD Pro','Project Planning','Surveying'], null, 'approved', now()),
  ('seed-user-divya', 'Divya Nair', 'STU2021009', 'divya.nair@university.edu', 1, 'Computer Science', 'AI & Robotics', 9.3,
    ARRAY['Python','Robotics','ROS','Computer Vision'], null, 'approved', now()),
  ('seed-user-rohan', 'Rohan Das', 'STU2021010', 'rohan.das@university.edu', 2, 'Electronics', 'Embedded Systems', 8.7,
    ARRAY['Embedded C','VHDL','PCB Design','Signal Processing'], null, 'approved', now())
on conflict (uid) do update set
  name = excluded.name,
  email = excluded.email,
  year = excluded.year,
  branch = excluded.branch,
  major = excluded.major,
  cgpa = excluded.cgpa,
  skills = excluded.skills,
  profile_picture = excluded.profile_picture,
  verification_status = excluded.verification_status,
  reviewed_at = excluded.reviewed_at;

-- Certificates -----------------------------------------------------------
with certificate_data (uid, title, category, year, proof_link) as (
  values
    ('STU2021001', 'AWS Solutions Architect', 'Cloud', '2024', 'https://example.com/certs/aws-rahul'),
    ('STU2021002', 'Deep Learning Specialization', 'AI', '2024', 'https://example.com/certs/dl-priya'),
    ('STU2021002', 'TensorFlow Developer', 'AI', '2023', 'https://example.com/certs/tf-priya'),
    ('STU2021003', 'IoT Specialist', 'IoT', '2023', 'https://example.com/certs/iot-arjun'),
    ('STU2021004', 'Certified Ethical Hacker', 'Cybersecurity', '2024', 'https://example.com/certs/ceh-sneha'),
    ('STU2021005', 'AutoCAD Professional', 'Design', '2023', 'https://example.com/certs/cad-vikram'),
    ('STU2021006', 'Full Stack Developer', 'Web', '2024', 'https://example.com/certs/fsd-ananya'),
    ('STU2021007', 'Data Analytics Professional', 'Analytics', '2024', 'https://example.com/certs/data-neha'),
    ('STU2021008', 'BIM Fundamentals', 'Civil', '2023', 'https://example.com/certs/bim-karan'),
    ('STU2021009', 'Robotics Masterclass', 'Robotics', '2024', 'https://example.com/certs/robotics-divya'),
    ('STU2021010', 'Embedded Systems Pro', 'Embedded', '2024', 'https://example.com/certs/embedded-rohan')
)
insert into public.student_certificates (profile_id, user_id, student_id, title, category, year, proof_link, status)
select sp.id, sp.user_id, s.student_id, cd.title, cd.category, cd.year, cd.proof_link, 'approved'
from certificate_data cd
join public.student_profiles sp on sp.uid = cd.uid
join public.students s on s.uid = cd.uid;

-- Hackathons -------------------------------------------------------------
with hackathon_data (uid, event_name, position, year) as (
  values
    ('STU2021001', 'Smart India Hackathon', 'Winner', '2024'),
    ('STU2021002', 'Google AI Challenge', 'Winner', '2024'),
    ('STU2021003', 'IoT Innovators', 'Runner-up', '2023'),
    ('STU2021004', 'CyberSec CTF', 'Top 10', '2024'),
    ('STU2021006', 'React Conf Hack', 'Winner', '2023'),
    ('STU2021009', 'RoboCup Collegiate', 'Finalist', '2024')
)
insert into public.student_hackathons (profile_id, user_id, student_id, event_name, position, year, status)
select sp.id, sp.user_id, s.student_id, hd.event_name, hd.position, hd.year, 'approved'
from hackathon_data hd
join public.student_profiles sp on sp.uid = hd.uid
join public.students s on s.uid = hd.uid;

-- Sports -----------------------------------------------------------------
with sport_data (uid, sport, level, position) as (
  values
    ('STU2021003', 'Football', 'University', 'Captain'),
    ('STU2021005', 'Basketball', 'National', 'Champion'),
    ('STU2021005', 'Volleyball', 'State', 'Winner'),
    ('STU2021010', 'Athletics', 'State', 'Silver'),
    ('STU2021009', 'Badminton', 'College', 'Gold')
)
insert into public.sports_achievements (profile_id, user_id, student_id, sport, level, position, status)
select sp.id, sp.user_id, s.student_id, sd.sport, sd.level, sd.position, 'approved'
from sport_data sd
join public.student_profiles sp on sp.uid = sd.uid
join public.students s on s.uid = sd.uid;

-- Internships ------------------------------------------------------------
with internship_data (uid, company, role, duration) as (
  values
    ('STU2021001', 'Microsoft', 'SDE Intern', 'May 2024 - Jul 2024'),
    ('STU2021002', 'Google', 'AI Research Intern', 'May 2024 - Jul 2024'),
    ('STU2021003', 'Bosch', 'IoT Intern', 'Jun 2023 - Aug 2023'),
    ('STU2021004', 'IBM Security', 'Security Analyst Intern', 'May 2024 - Jul 2024'),
    ('STU2021005', 'Tata Motors', 'Design Intern', 'Jun 2024 - Aug 2024'),
    ('STU2021006', 'Stripe', 'Frontend Intern', 'May 2024 - Jul 2024'),
    ('STU2021007', 'Deloitte', 'Data Analyst Intern', 'Jan 2024 - Apr 2024'),
    ('STU2021008', 'Larsen & Toubro', 'Structural Intern', 'Jun 2024 - Aug 2024'),
    ('STU2021009', 'Boston Dynamics', 'Robotics Intern', 'May 2024 - Jul 2024'),
    ('STU2021010', 'Texas Instruments', 'Embedded Intern', 'Jan 2024 - Apr 2024')
)
insert into public.student_internships (profile_id, user_id, student_id, company, role, duration, status)
select sp.id, sp.user_id, s.student_id, idata.company, idata.role, idata.duration, 'approved'
from internship_data idata
join public.student_profiles sp on sp.uid = idata.uid
join public.students s on s.uid = idata.uid;

-- Extracurricular --------------------------------------------------------
with activity_data (uid, activity_name, year) as (
  values
    ('STU2021001', 'Coding Club President', '2024'),
    ('STU2021002', 'AI Research Lead', '2024'),
    ('STU2021004', 'Cybersecurity Society VP', '2024'),
    ('STU2021006', 'Web Dev Club Lead', '2024'),
    ('STU2021007', 'Data Stories Meetup Host', '2024'),
    ('STU2021008', 'Infra Innovation Forum', '2023'),
    ('STU2021009', 'Robotics Club Captain', '2024'),
    ('STU2021010', 'Electronics Society Treasurer', '2024')
)
insert into public.extracurricular_activities (profile_id, user_id, student_id, activity_name, year, status)
select sp.id, sp.user_id, s.student_id, ad.activity_name, ad.year, 'approved'
from activity_data ad
join public.student_profiles sp on sp.uid = ad.uid
join public.students s on s.uid = ad.uid;

commit;
