import { supabase } from "../../supabaseClient";
import { AdminRole, AdminUser } from "@/types/database";

const TABLE = "admins";

interface AdminRow {
  admin_id: number;
  admin_name: string;
  email: string;
  password: string;
  role: AdminRole;
  dept_id: number | null;
  created_at: string;
}

const rowToAdmin = (row: AdminRow): AdminUser => ({
  id: row.admin_id,
  name: row.admin_name,
  email: row.email,
  role: row.role,
  deptId: row.dept_id,
  createdAt: row.created_at,
});

const toRowPayload = (payload: Partial<AdminRow>) => payload;

export const listAdmins = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as AdminRow[]).map(rowToAdmin);
};

export const createAdmin = async (
  payload: Omit<AdminRow, "admin_id" | "created_at">
) => {
  const { data, error } = await supabase.from(TABLE).insert(payload).select("*").single();
  if (error) throw error;
  return rowToAdmin(data as AdminRow);
};

export const updateAdmin = async (id: number, payload: Partial<AdminRow>) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(toRowPayload(payload))
    .eq("admin_id", id)
    .select("*")
    .single();
  if (error) throw error;
  return rowToAdmin(data as AdminRow);
};
