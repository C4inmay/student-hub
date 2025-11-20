import { supabase } from "../../supabaseClient";
import { StudentProfile } from "@/types/auth";
import { syncProfileAchievements, publishProfileAchievements } from "./profileAchievements";
import { getProfileById, StudentProfileRow } from "./studentProfiles";
import { upsertStudentByUid } from "./students";
import { deleteProfileImage } from "./storage";

export interface AdminStudentPayload {
  profile: {
    name: string;
    uid: string;
    email: string;
    year: number;
    branch: string;
    major: string;
    cgpa: number;
    skills: string[];
    profilePicture?: string;
  };
  achievements: Pick<
    StudentProfile,
    "certificates" | "hackathons" | "sports" | "internships" | "extracurricular"
  >;
}

export const adminUpdateStudent = async (profileId: string, payload: AdminStudentPayload) => {
  const { profile, achievements } = payload;

  const { data, error } = await supabase
    .from("student_profiles")
    .update({
      name: profile.name,
      uid: profile.uid,
      email: profile.email,
      year: profile.year,
      branch: profile.branch,
      major: profile.major,
      cgpa: profile.cgpa,
      skills: profile.skills,
      profile_picture: profile.profilePicture ?? null,
      verification_status: "approved",
      rejection_reason: null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", profileId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  const updatedRow = data as StudentProfileRow;

  const student = await upsertStudentByUid({
    name: profile.name,
    email: profile.email,
    uid: profile.uid,
    year: String(profile.year),
    branch: profile.branch,
    skills: profile.skills,
    profilePicture: profile.profilePicture,
  });

  await syncProfileAchievements(profileId, updatedRow.user_id, achievements);
  await publishProfileAchievements(profileId, student.id);

  return getProfileById(profileId);
};

export const adminDeleteStudent = async (profileId: string) => {
  const { data, error } = await supabase
    .from("student_profiles")
    .select("id, uid, profile_picture")
    .eq("id", profileId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Student profile not found");
  }

  const profileRow = data as Pick<StudentProfileRow, "uid" | "profile_picture">;

  if (profileRow.profile_picture) {
    await deleteProfileImage(profileRow.profile_picture).catch(() => undefined);
  }

  const { data: studentRow, error: studentLookupError } = await supabase
    .from("students")
    .select("student_id")
    .eq("uid", profileRow.uid)
    .maybeSingle();
  if (studentLookupError) {
    throw studentLookupError;
  }

  const { error: deleteProfileError } = await supabase.from("student_profiles").delete().eq("id", profileId);
  if (deleteProfileError) {
    throw deleteProfileError;
  }

  if (studentRow) {
    const { error: deleteStudentError } = await supabase
      .from("students")
      .delete()
      .eq("student_id", studentRow.student_id);
    if (deleteStudentError) {
      throw deleteStudentError;
    }
  }
};
