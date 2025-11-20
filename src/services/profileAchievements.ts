import { supabase } from "../../supabaseClient";
import type { PostgrestError } from "@supabase/supabase-js";
import { StudentProfile } from "@/types/auth";

const CERTIFICATES_TABLE = "student_certificates";
const HACKATHONS_TABLE = "student_hackathons";
const SPORTS_TABLE = "sports_achievements";
const INTERNSHIPS_TABLE = "student_internships";
const EXTRACURRICULAR_TABLE = "extracurricular_activities";

type ProfileAchievements = Pick<
  StudentProfile,
  "certificates" | "hackathons" | "sports" | "internships" | "extracurricular"
>;

interface BaseRow {
  id: string;
  profile_id: string;
  user_id: string;
  student_id?: number | null;
  status: string;
  created_at: string;
}

interface CertificateRow extends BaseRow {
  title: string;
  category: string;
  year: string;
  proof_link: string;
}

interface HackathonRow extends BaseRow {
  event_name: string;
  position: string;
  year: string;
}

interface SportRow extends BaseRow {
  sport: string;
  level: string;
  position: string;
}

interface InternshipRow extends BaseRow {
  company: string;
  role: string;
  duration: string;
}

interface ExtracurricularRow extends BaseRow {
  activity_name: string;
  year: string;
}

const rowToAchievements = (rows: {
  certificates?: CertificateRow[];
  hackathons?: HackathonRow[];
  sports?: SportRow[];
  internships?: InternshipRow[];
  extracurricular?: ExtracurricularRow[];
}): ProfileAchievements => ({
  certificates: rows.certificates?.map((row) => ({
    title: row.title,
    category: row.category,
    year: row.year,
    proofLink: row.proof_link,
  })) ?? [],
  hackathons: rows.hackathons?.map((row) => ({
    eventName: row.event_name,
    position: row.position,
    year: row.year,
  })) ?? [],
  sports: rows.sports?.map((row) => ({
    sport: row.sport,
    level: row.level,
    position: row.position,
  })) ?? [],
  internships: rows.internships?.map((row) => ({
    company: row.company,
    role: row.role,
    duration: row.duration,
  })) ?? [],
  extracurricular: rows.extracurricular?.map((row) => ({
    activityName: row.activity_name,
    year: row.year,
  })) ?? [],
});

const syncTable = async <T>(table: string, profileId: string, rows: T[]) => {
  const { error: deleteError } = await supabase.from(table).delete().eq("profile_id", profileId);
  if (deleteError) throw deleteError;
  if (rows.length === 0) return;
  const { error } = await supabase.from(table).insert(rows);
  if (error) throw error;
};

export const syncProfileAchievements = async (
  profileId: string,
  userId: string,
  achievements: ProfileAchievements
) => {
  await Promise.all([
    syncTable(
      CERTIFICATES_TABLE,
      profileId,
      achievements.certificates.map((certificate) => ({
        profile_id: profileId,
        user_id: userId,
        title: certificate.title,
        category: certificate.category,
        year: certificate.year,
        proof_link: certificate.proofLink,
        status: "pending",
      }))
    ),
    syncTable(
      HACKATHONS_TABLE,
      profileId,
      achievements.hackathons.map((hackathon) => ({
        profile_id: profileId,
        user_id: userId,
        event_name: hackathon.eventName,
        position: hackathon.position,
        year: hackathon.year,
        status: "pending",
      }))
    ),
    syncTable(
      SPORTS_TABLE,
      profileId,
      achievements.sports.map((sport) => ({
        profile_id: profileId,
        user_id: userId,
        sport: sport.sport,
        level: sport.level,
        position: sport.position,
        status: "pending",
      }))
    ),
    syncTable(
      INTERNSHIPS_TABLE,
      profileId,
      achievements.internships.map((internship) => ({
        profile_id: profileId,
        user_id: userId,
        company: internship.company,
        role: internship.role,
        duration: internship.duration,
        status: "pending",
      }))
    ),
    syncTable(
      EXTRACURRICULAR_TABLE,
      profileId,
      achievements.extracurricular.map((activity) => ({
        profile_id: profileId,
        user_id: userId,
        activity_name: activity.activityName,
        year: activity.year,
        status: "pending",
      }))
    ),
  ]);
};

export const fetchProfileAchievements = async (profileId: string): Promise<ProfileAchievements> => {
  const [certificates, hackathons, sports, internships, extracurricular] = await Promise.all([
    supabase.from(CERTIFICATES_TABLE).select("*").eq("profile_id", profileId),
    supabase.from(HACKATHONS_TABLE).select("*").eq("profile_id", profileId),
    supabase.from(SPORTS_TABLE).select("*").eq("profile_id", profileId),
    supabase.from(INTERNSHIPS_TABLE).select("*").eq("profile_id", profileId),
    supabase.from(EXTRACURRICULAR_TABLE).select("*").eq("profile_id", profileId),
  ]);

  const throwIfError = (response: { error: PostgrestError | null }) => {
    if (response.error) {
      throw response.error;
    }
  };

  [certificates, hackathons, sports, internships, extracurricular].forEach(throwIfError);

  return rowToAchievements({
    certificates: certificates.data as CertificateRow[] | undefined,
    hackathons: hackathons.data as HackathonRow[] | undefined,
    sports: sports.data as SportRow[] | undefined,
    internships: internships.data as InternshipRow[] | undefined,
    extracurricular: extracurricular.data as ExtracurricularRow[] | undefined,
  });
};

const approveTable = async (table: string, profileId: string, studentId: number) => {
  const { error } = await supabase
    .from(table)
    .update({ status: "approved", student_id: studentId })
    .eq("profile_id", profileId);
  if (error) throw error;
};

export const publishProfileAchievements = async (profileId: string, studentId: number) => {
  await Promise.all([
    approveTable(CERTIFICATES_TABLE, profileId, studentId),
    approveTable(HACKATHONS_TABLE, profileId, studentId),
    approveTable(SPORTS_TABLE, profileId, studentId),
    approveTable(INTERNSHIPS_TABLE, profileId, studentId),
    approveTable(EXTRACURRICULAR_TABLE, profileId, studentId),
  ]);
};
