import { supabase } from "../../supabaseClient";
import { StudentProfile, VerificationStatus } from "@/types/auth";
import { upsertStudentByUid } from "./students";
import { fetchProfileAchievements, publishProfileAchievements } from "./profileAchievements";

const TABLE = "student_profiles";

export interface StudentProfileRow {
  id: string;
  user_id: string;
  name: string;
  uid: string;
  email: string;
  year: number;
  branch: string;
  major: string;
  cgpa: number;
  skills: string[];
  profile_picture?: string | null;
  verification_status: VerificationStatus;
  rejection_reason?: string | null;
  submitted_at: string;
  reviewed_at?: string | null;
  created_at?: string;
}

const rowToProfile = (
  row: StudentProfileRow,
  achievements?: Partial<StudentProfile>
): StudentProfile => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  uid: row.uid,
  email: row.email,
  year: row.year,
  branch: row.branch,
  major: row.major,
  cgpa: row.cgpa,
  skills: row.skills ?? [],
  profilePicture: row.profile_picture ?? undefined,
  certificates: achievements?.certificates ?? [],
  internships: achievements?.internships ?? [],
  hackathons: achievements?.hackathons ?? [],
  sports: achievements?.sports ?? [],
  extracurricular: achievements?.extracurricular ?? [],
  verificationStatus: row.verification_status,
  rejectionReason: row.rejection_reason ?? undefined,
  submittedAt: row.submitted_at,
  reviewedAt: row.reviewed_at ?? undefined,
});

const profileToRow = (profile: StudentProfile): StudentProfileRow => ({
  id: profile.id,
  user_id: profile.userId,
  name: profile.name,
  uid: profile.uid,
  email: profile.email,
  year: profile.year,
  branch: profile.branch,
  major: profile.major,
  cgpa: profile.cgpa,
  skills: profile.skills,
  profile_picture: profile.profilePicture ?? null,
  verification_status: profile.verificationStatus,
  rejection_reason: profile.rejectionReason ?? null,
  submitted_at: profile.submittedAt,
  reviewed_at: profile.reviewedAt ?? null,
});

const profilePartialToRowPartial = (
  updates: Partial<StudentProfile>
): Partial<StudentProfileRow> => {
  const row: Partial<StudentProfileRow> = {};

  if (updates.id !== undefined) row.id = updates.id;
  if (updates.userId !== undefined) row.user_id = updates.userId;
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.uid !== undefined) row.uid = updates.uid;
  if (updates.email !== undefined) row.email = updates.email;
  if (updates.year !== undefined) row.year = updates.year;
  if (updates.branch !== undefined) row.branch = updates.branch;
  if (updates.major !== undefined) row.major = updates.major;
  if (updates.cgpa !== undefined) row.cgpa = updates.cgpa;
  if (updates.skills !== undefined) row.skills = updates.skills;
  if (updates.profilePicture !== undefined) row.profile_picture = updates.profilePicture ?? null;
  if (updates.verificationStatus !== undefined) row.verification_status = updates.verificationStatus;
  if (updates.rejectionReason !== undefined) row.rejection_reason = updates.rejectionReason ?? null;
  if (updates.submittedAt !== undefined) row.submitted_at = updates.submittedAt;
  if (updates.reviewedAt !== undefined) row.reviewed_at = updates.reviewedAt ?? null;

  return row;
};

const hydrateProfile = async (row: StudentProfileRow) => {
  const achievements = await fetchProfileAchievements(row.id);
  return rowToProfile(row, achievements);
};

export const listProfiles = async (status?: VerificationStatus) => {
  let query = supabase.from(TABLE).select("*").order("submitted_at", { ascending: false });
  if (status) {
    query = query.eq("verification_status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  const rows = data as StudentProfileRow[];
  return Promise.all(rows.map(hydrateProfile));
};

export const listPendingProfiles = async () => listProfiles("pending");

export const getProfileById = async (id: string) => {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
  if (error) throw error;
  return hydrateProfile(data as StudentProfileRow);
};

export const getProfileByUserId = async (userId: string) => {
  const { data, error } = await supabase.from(TABLE).select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data ? hydrateProfile(data as StudentProfileRow) : null;
};

export const getProfileByUid = async (uid: string) => {
  const { data, error } = await supabase.from(TABLE).select("*").eq("uid", uid).maybeSingle();
  if (error) throw error;
  return data ? hydrateProfile(data as StudentProfileRow) : null;
};

export const createProfile = async (profile: StudentProfile) => {
  const { data, error } = await supabase.from(TABLE).insert(profileToRow(profile)).select("*").single();
  if (error) throw error;
  return rowToProfile(data as StudentProfileRow);
};

export const updateProfile = async (id: string, updates: Partial<StudentProfile>) => {
  const payload = profilePartialToRowPartial(updates);
  const { data, error } = await supabase.from(TABLE).update(payload).eq("id", id).select("*").single();
  if (error) throw error;
  return rowToProfile(data as StudentProfileRow);
};

export const updateVerificationStatus = async (
  id: string,
  status: VerificationStatus,
  rejectionReason?: string
) =>
  updateProfile(id, {
    verificationStatus: status,
    rejectionReason: rejectionReason ?? undefined,
    reviewedAt: new Date().toISOString(),
  });

export const deleteProfile = async (id: string) => {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
};

export const approveProfile = async (id: string) => {
  const profile = await getProfileById(id);

  const student = await upsertStudentByUid({
    name: profile.name,
    email: profile.email,
    uid: profile.uid,
    year: String(profile.year),
    branch: profile.branch,
    skills: profile.skills,
    profilePicture: profile.profilePicture,
  });

  await publishProfileAchievements(profile.id, student.id);
  await updateVerificationStatus(id, "approved");

  return getProfileById(id);
};

export const rejectProfile = async (id: string, reason: string) =>
  updateVerificationStatus(id, "rejected", reason);
