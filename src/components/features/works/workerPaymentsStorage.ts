import type { WorkWorkerPayment } from "@/types";
import { supabase } from "@/lib/supabase";

interface Row {
  id: string;
  worker_id: string;
  work_id: string;
  amount: number;
  date: string;
  note: string;
}

function rowToPayment(row: Row): WorkWorkerPayment {
  return {
    id: row.id,
    workerId: row.worker_id,
    workId: row.work_id,
    amount: Number(row.amount),
    date: row.date,
    note: row.note ?? "",
  };
}

export async function fetchWorkerPayments(workId: string): Promise<WorkWorkerPayment[]> {
  const { data, error } = await supabase
    .from("work_worker_payments")
    .select("*")
    .eq("work_id", workId)
    .order("date", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Row[]).map(rowToPayment);
}

export async function addWorkerPayment(
  workerId: string,
  workId: string,
  amount: number,
  date: string,
  note: string,
): Promise<WorkWorkerPayment> {
  const { data, error } = await supabase
    .from("work_worker_payments")
    .insert({ worker_id: workerId, work_id: workId, amount, date, note })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToPayment(data as Row);
}

export async function removeWorkerPayment(id: string): Promise<void> {
  const { error } = await supabase
    .from("work_worker_payments")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}
