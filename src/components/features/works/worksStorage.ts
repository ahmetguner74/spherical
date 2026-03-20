import type { Work } from "@/types";
import { supabase } from "@/lib/supabase";

interface WorkRow {
  id: string;
  title: string;
  description: string;
  client: string;
  status: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

function rowToWork(row: WorkRow): Work {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    client: row.client,
    status: row.status as Work["status"],
    startDate: row.start_date,
    endDate: row.end_date ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function workToRow(
  work: Omit<Work, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
  },
) {
  return {
    ...(work.id ? { id: work.id } : {}),
    title: work.title,
    description: work.description,
    client: work.client,
    status: work.status,
    start_date: work.startDate,
    end_date: work.endDate ?? null,
    created_at: work.createdAt ?? new Date().toISOString().split("T")[0],
    updated_at: work.updatedAt ?? new Date().toISOString().split("T")[0],
  };
}

export async function fetchWorks(): Promise<Work[]> {
  const { data, error } = await supabase
    .from("works")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as WorkRow[]).map(rowToWork);
}

export async function insertWork(
  work: Omit<Work, "id" | "createdAt" | "updatedAt">,
): Promise<Work> {
  const now = new Date().toISOString().split("T")[0];
  const row = workToRow({ ...work, createdAt: now, updatedAt: now });

  const { data, error } = await supabase
    .from("works")
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToWork(data as WorkRow);
}

export async function patchWork(
  id: string,
  updates: Partial<Work>,
): Promise<Work> {
  const now = new Date().toISOString().split("T")[0];
  const row: Record<string, unknown> = { updated_at: now };

  if (updates.title !== undefined) row.title = updates.title;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.client !== undefined) row.client = updates.client;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.startDate !== undefined) row.start_date = updates.startDate;
  if ("endDate" in updates) row.end_date = updates.endDate ?? null;

  const { data, error } = await supabase
    .from("works")
    .update(row)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToWork(data as WorkRow);
}

export async function removeWork(id: string): Promise<void> {
  const { error } = await supabase.from("works").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
