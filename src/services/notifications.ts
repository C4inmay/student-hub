import { supabase } from "../../supabaseClient";
import { NotificationRecord } from "@/types/database";

const TABLE = "notifications";

interface NotificationRow {
  notification_id: number;
  user_type: NotificationRecord["userType"];
  user_id: number;
  message: string;
  created_at: string;
  read_status: boolean;
}

const rowToNotification = (row: NotificationRow): NotificationRecord => ({
  id: row.notification_id,
  userType: row.user_type,
  userId: row.user_id,
  message: row.message,
  createdAt: row.created_at,
  readStatus: row.read_status,
});

export const listNotifications = async (userId: number, userType: NotificationRecord["userType"]) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .eq("user_type", userType)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as NotificationRow[]).map(rowToNotification);
};

export const sendNotification = async (
  payload: Omit<NotificationRow, "notification_id" | "created_at" | "read_status">
) => {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...payload, read_status: false })
    .select("*")
    .single();
  if (error) throw error;
  return rowToNotification(data as NotificationRow);
};

export const markNotificationRead = async (notificationId: number) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ read_status: true })
    .eq("notification_id", notificationId)
    .select("*")
    .single();
  if (error) throw error;
  return rowToNotification(data as NotificationRow);
};
