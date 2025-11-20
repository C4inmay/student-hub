import { supabase } from "../../supabaseClient";
import { CertificateRecord, CertificateStatus } from "@/types/database";

const TABLE = "certificates";

interface CertificateRow {
  certificate_id: number;
  event_id: number;
  student_id: number;
  cert_url: string;
  generated_at: string;
  status: CertificateStatus;
}

const rowToCertificate = (row: CertificateRow): CertificateRecord => ({
  id: row.certificate_id,
  eventId: row.event_id,
  studentId: row.student_id,
  certUrl: row.cert_url,
  generatedAt: row.generated_at,
  status: row.status,
});

export const listCertificatesByEvent = async (eventId: number) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("event_id", eventId)
    .order("generated_at", { ascending: false });
  if (error) throw error;
  return (data as CertificateRow[]).map(rowToCertificate);
};

export const listCertificatesByStudent = async (studentId: number) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("student_id", studentId)
    .order("generated_at", { ascending: false });
  if (error) throw error;
  return (data as CertificateRow[]).map(rowToCertificate);
};

export const generateCertificate = async (
  payload: Omit<CertificateRecord, "id" | "generatedAt">
) => {
  const insertPayload = {
    event_id: payload.eventId,
    student_id: payload.studentId,
    cert_url: payload.certUrl,
    status: payload.status,
  } satisfies Omit<CertificateRow, "certificate_id" | "generated_at">;

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(insertPayload, { onConflict: "event_id,student_id" })
    .select("*")
    .single();
  if (error) throw error;
  return rowToCertificate(data as CertificateRow);
};

export const countCertificates = async () => {
  const { count, error } = await supabase
    .from(TABLE)
    .select("certificate_id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
};
