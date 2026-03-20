import type { WorkWorker, WorkExpense } from "@/types";
import { supabase } from "@/lib/supabase";

interface WorkerRow {
  id: string;
  work_id: string;
  name: string;
  role: string;
  share: number;
}

interface ExpenseRow {
  id: string;
  worker_id: string;
  work_id: string;
  description: string;
  amount: number;
  date: string;
}

function rowToWorker(row: WorkerRow, expenses: WorkExpense[] = []): WorkWorker {
  return {
    id: row.id,
    workId: row.work_id,
    name: row.name,
    role: row.role,
    share: Number(row.share) || 0,
    expenses,
  };
}

function rowToExpense(row: ExpenseRow): WorkExpense {
  return {
    id: row.id,
    workerId: row.worker_id,
    workId: row.work_id,
    description: row.description,
    amount: Number(row.amount),
    date: row.date,
  };
}

export async function fetchWorkersWithExpenses(workId: string): Promise<WorkWorker[]> {
  const { data: workers, error: wErr } = await supabase
    .from("work_workers")
    .select("*")
    .eq("work_id", workId);

  if (wErr) throw new Error(wErr.message);

  const { data: expenses, error: eErr } = await supabase
    .from("work_expenses")
    .select("*")
    .eq("work_id", workId);

  if (eErr) throw new Error(eErr.message);

  const expenseMap = new Map<string, WorkExpense[]>();
  for (const row of expenses as ExpenseRow[]) {
    const list = expenseMap.get(row.worker_id) ?? [];
    list.push(rowToExpense(row));
    expenseMap.set(row.worker_id, list);
  }

  return (workers as WorkerRow[]).map((w) =>
    rowToWorker(w, expenseMap.get(w.id) ?? []),
  );
}

export async function addWorker(
  workId: string,
  name: string,
  role: string,
  share: number,
): Promise<WorkWorker> {
  const { data, error } = await supabase
    .from("work_workers")
    .insert({ work_id: workId, name, role, share })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToWorker(data as WorkerRow);
}

export async function updateWorkerShare(
  workerId: string,
  share: number,
): Promise<void> {
  const { error } = await supabase
    .from("work_workers")
    .update({ share })
    .eq("id", workerId);
  if (error) throw new Error(error.message);
}

export async function removeWorker(workerId: string): Promise<void> {
  const { error } = await supabase
    .from("work_workers")
    .delete()
    .eq("id", workerId);
  if (error) throw new Error(error.message);
}

export async function addExpense(
  workerId: string,
  workId: string,
  description: string,
  amount: number,
  date: string,
): Promise<WorkExpense> {
  const { data, error } = await supabase
    .from("work_expenses")
    .insert({
      worker_id: workerId,
      work_id: workId,
      description,
      amount,
      date,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToExpense(data as ExpenseRow);
}

export async function removeExpense(expenseId: string): Promise<void> {
  const { error } = await supabase
    .from("work_expenses")
    .delete()
    .eq("id", expenseId);
  if (error) throw new Error(error.message);
}
