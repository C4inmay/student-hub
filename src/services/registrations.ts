import { supabase } from "../../supabaseClient";
import { Registration } from "@/types/database";

const TABLE = "registrations";

interface RegistrationRow {
  registration_id: number;
  event_id: number;
  student_id: number;
  registration_date: string;
}

const rowToRegistration = (row: RegistrationRow): Registration => ({
  id: row.registration_id,
  eventId: row.event_id,
  studentId: row.student_id,
  registrationDate: row.registration_date,
});

export const listRegistrationsByEvent = async (eventId: number) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("event_id", eventId)
    .order("registration_date", { ascending: false });
  if (error) throw error;
  return (data as RegistrationRow[]).map(rowToRegistration);
};

export const listRegistrationsByStudent = async (studentId: number) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("student_id", studentId)
    .order("registration_date", { ascending: false });
  if (error) throw error;
  return (data as RegistrationRow[]).map(rowToRegistration);
};

export const registerForEvent = async (studentId: number, eventId: number) => {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ student_id: studentId, event_id: eventId })
    .select("*")
    .single();
  if (error) throw error;
  return rowToRegistration(data as RegistrationRow);
};

export const deleteRegistration = async (registrationId: number) => {
  const { error } = await supabase.from(TABLE).delete().eq("registration_id", registrationId);
  if (error) throw error;
};

export const countRegistrations = async () => {
  const { count, error } = await supabase
    .from(TABLE)
    .select("registration_id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
};
