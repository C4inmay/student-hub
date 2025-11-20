import { supabase } from "../../supabaseClient";
import { AttendanceRecord, AttendanceStatus } from "@/types/database";

const TABLE = "attendance";

interface AttendanceRow {
  attendance_id: number;
  event_id: number;
  student_id: number;
  scan_time: string;
  status: AttendanceStatus;
}

const rowToAttendance = (row: AttendanceRow): AttendanceRecord => ({
  id: row.attendance_id,
  eventId: row.event_id,
  studentId: row.student_id,
  scanTime: row.scan_time,
  status: row.status,
});

export const listAttendanceByEvent = async (eventId: number) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("event_id", eventId)
    .order("scan_time", { ascending: false });
  if (error) throw error;
  return (data as AttendanceRow[]).map(rowToAttendance);
};

export const listAttendanceByStudent = async (studentId: number) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("student_id", studentId)
    .order("scan_time", { ascending: false });
  if (error) throw error;
  return (data as AttendanceRow[]).map(rowToAttendance);
};

export const markAttendance = async (
  eventId: number,
  studentId: number,
  status: AttendanceStatus = "Present"
) => {
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      { event_id: eventId, student_id: studentId, status },
      { onConflict: "event_id,student_id" }
    )
    .select("*")
    .single();
  if (error) throw error;
  return rowToAttendance(data as AttendanceRow);
};

export const countAttendanceRecords = async () => {
  const { count, error } = await supabase
    .from(TABLE)
    .select("attendance_id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
};
