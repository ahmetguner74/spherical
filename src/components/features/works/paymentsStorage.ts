import type { WorkPayment } from "@/types";
import { supabase } from "@/lib/supabase";

interface PaymentRow {
  id: string;
  work_id: string;
  amount: number;
  date: string;
  note: string;
}

function rowToPayment(row: PaymentRow): WorkPayment {
  return {
    id: row.id,
    workId: row.work_id,
    amount: Number(row.amount),
    date: row.date,
    note: row.note ?? "",
  };
}

export async function fetchPayments(workId: string): Promise<WorkPayment[]> {
  const { data, error } = await supabase
    .from("work_payments")
    .select("*")
    .eq("work_id", workId)
    .order("date", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as PaymentRow[]).map(rowToPayment);
}

export async function addPayment(
  workId: string,
  amount: number,
  date: string,
  note: string,
): Promise<WorkPayment> {
  const { data, error } = await supabase
    .from("work_payments")
    .insert({ work_id: workId, amount, date, note })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToPayment(data as PaymentRow);
}

export async function removePayment(paymentId: string): Promise<void> {
  const { error } = await supabase
    .from("work_payments")
    .delete()
    .eq("id", paymentId);
  if (error) throw new Error(error.message);
}
