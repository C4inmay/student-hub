import { supabase } from "../../supabaseClient";
import { LogEntry } from "@/types/database";

const TABLE = "logs";

interface LogRow {
  log_id: number;
  admin_id: number | null;
  action: string;
  event_id: number | null;
  created_at: string;
}

const rowToLog = (row: LogRow): LogEntry => ({
  id: row.log_id,
  adminId: row.admin_id,
  action: row.action,
  eventId: row.event_id,
  createdAt: row.created_at,
});

export const listLogs = async (limit = 10) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as LogRow[]).map(rowToLog);
};

export const createLog = async (payload: Omit<LogRow, "log_id" | "created_at">) => {
  const { data, error } = await supabase.from(TABLE).insert(payload).select("*").single();
  if (error) throw error;
  return rowToLog(data as LogRow);
};
