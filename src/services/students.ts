import { supabase } from "../../supabaseClient";
import { Student } from "@/types/database";

const TABLE = "students";

interface StudentRow {
  student_id: number;
  student_name: string;
  email: string;
  uid: string;
  year: string;
  branch: string;
  skills: string | null;
  profile_picture: string | null;
  created_at: string;
}

const parseSkills = (value: string | null) =>
  value ? value.split(",").map((skill) => skill.trim()).filter(Boolean) : [];

const stringifySkills = (skills: string[]) => skills.join(",");

const rowToStudent = (row: StudentRow): Student => ({
  id: row.student_id,
  name: row.student_name,
  email: row.email,
  uid: row.uid,
  year: row.year,
  branch: row.branch,
  skills: parseSkills(row.skills),
  profilePicture: row.profile_picture ?? undefined,
  createdAt: row.created_at,
});

const toRowPayload = (payload: Partial<Student>): Partial<StudentRow> => {
  const result: Partial<StudentRow> = {};
  if (payload.name !== undefined) result.student_name = payload.name;
  if (payload.email !== undefined) result.email = payload.email;
  if (payload.uid !== undefined) result.uid = payload.uid;
  if (payload.year !== undefined) result.year = payload.year;
  if (payload.branch !== undefined) result.branch = payload.branch;
  if (payload.skills !== undefined) result.skills = stringifySkills(payload.skills);
  if (payload.profilePicture !== undefined) result.profile_picture = payload.profilePicture ?? null;
  return result;
};

export const listStudents = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as StudentRow[]).map(rowToStudent);
};

export const getStudentById = async (id: number) => {
  const { data, error } = await supabase.from(TABLE).select("*").eq("student_id", id).single();
  if (error) throw error;
  return rowToStudent(data as StudentRow);
};

export const getStudentByUid = async (uid: string) => {
  const { data, error } = await supabase.from(TABLE).select("*").eq("uid", uid).maybeSingle();
  if (error) throw error;
  return data ? rowToStudent(data as StudentRow) : null;
};

export const createStudent = async (payload: Omit<Student, "id" | "createdAt">) => {
  const insertPayload = {
    student_name: payload.name,
    email: payload.email,
    uid: payload.uid,
    year: payload.year,
    branch: payload.branch,
    skills: stringifySkills(payload.skills),
    profile_picture: payload.profilePicture ?? null,
  } satisfies Omit<StudentRow, "student_id" | "created_at">;

  const { data, error } = await supabase.from(TABLE).insert(insertPayload).select("*").single();
  if (error) throw error;
  return rowToStudent(data as StudentRow);
};

export const upsertStudentByUid = async (payload: Omit<Student, "id" | "createdAt">) => {
  const insertPayload = {
    student_name: payload.name,
    email: payload.email,
    uid: payload.uid,
    year: payload.year,
    branch: payload.branch,
    skills: stringifySkills(payload.skills),
    profile_picture: payload.profilePicture ?? null,
  } satisfies Omit<StudentRow, "student_id" | "created_at">;

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(insertPayload, { onConflict: "uid" })
    .select("*")
    .single();
  if (error) throw error;
  return rowToStudent(data as StudentRow);
};

export const updateStudent = async (id: number, payload: Partial<Student>) => {
  const updatePayload = toRowPayload(payload);
  const { data, error } = await supabase
    .from(TABLE)
    .update(updatePayload)
    .eq("student_id", id)
    .select("*")
    .single();
  if (error) throw error;
  return rowToStudent(data as StudentRow);
};

export const deleteStudent = async (id: number) => {
  const { error } = await supabase.from(TABLE).delete().eq("student_id", id);
  if (error) throw error;
};
