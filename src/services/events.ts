import { supabase } from "../../supabaseClient";
import { Event, EventCategory } from "@/types/database";

const TABLE = "events";

interface EventRow {
  event_id: number;
  dept_id: number | null;
  event_name: string;
  event_category: EventCategory;
  event_date: string;
  event_time: string;
  venue: string;
  description: string | null;
  created_by: number | null;
  created_at: string;
}

const rowToEvent = (row: EventRow): Event => ({
  id: row.event_id,
  deptId: row.dept_id,
  name: row.event_name,
  category: row.event_category,
  date: row.event_date,
  time: row.event_time,
  venue: row.venue,
  description: row.description,
  createdBy: row.created_by,
  createdAt: row.created_at,
});

const toRowPayload = (payload: Partial<Event>): Partial<EventRow> => {
  const row: Partial<EventRow> = {};
  if (payload.deptId !== undefined) row.dept_id = payload.deptId;
  if (payload.name !== undefined) row.event_name = payload.name;
  if (payload.category !== undefined) row.event_category = payload.category;
  if (payload.date !== undefined) row.event_date = payload.date;
  if (payload.time !== undefined) row.event_time = payload.time;
  if (payload.venue !== undefined) row.venue = payload.venue;
  if (payload.description !== undefined) row.description = payload.description ?? null;
  if (payload.createdBy !== undefined) row.created_by = payload.createdBy;
  return row;
};

export const listEvents = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("event_date", { ascending: true })
    .order("event_time", { ascending: true });
  if (error) throw error;
  return (data as EventRow[]).map(rowToEvent);
};

export const getEventById = async (id: number) => {
  const { data, error } = await supabase.from(TABLE).select("*").eq("event_id", id).single();
  if (error) throw error;
  return rowToEvent(data as EventRow);
};

export const createEvent = async (payload: Omit<Event, "id" | "createdAt">) => {
  const insertPayload = {
    dept_id: payload.deptId ?? null,
    event_name: payload.name,
    event_category: payload.category,
    event_date: payload.date,
    event_time: payload.time,
    venue: payload.venue,
    description: payload.description ?? null,
    created_by: payload.createdBy ?? null,
  } satisfies Omit<EventRow, "event_id" | "created_at">;

  const { data, error } = await supabase.from(TABLE).insert(insertPayload).select("*").single();
  if (error) throw error;
  return rowToEvent(data as EventRow);
};

export const updateEvent = async (id: number, payload: Partial<Event>) => {
  const updatePayload = toRowPayload(payload);
  const { data, error } = await supabase
    .from(TABLE)
    .update(updatePayload)
    .eq("event_id", id)
    .select("*")
    .single();
  if (error) throw error;
  return rowToEvent(data as EventRow);
};

export const deleteEvent = async (id: number) => {
  const { error } = await supabase.from(TABLE).delete().eq("event_id", id);
  if (error) throw error;
};
