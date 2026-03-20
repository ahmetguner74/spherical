"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { WorkWorker, WorkPayment } from "@/types";
import {
  fetchWorkersWithExpenses,
  addWorker as apiAddWorker,
  removeWorker as apiRemoveWorker,
  addExpense as apiAddExpense,
  removeExpense as apiRemoveExpense,
  updateWorkerShare as apiUpdateShare,
} from "./workersStorage";
import {
  fetchPayments,
  addPayment as apiAddPayment,
  removePayment as apiRemovePayment,
} from "./paymentsStorage";

export interface WorkerPayout {
  workerId: string;
  basePay: number;
  ownExpenses: number;
  expenseCost: number;
  reimbursement: number;
  finalPayout: number;
}

export function useWorkDetail(workId: string | null, totalFee: number = 0) {
  const [workers, setWorkers] = useState<WorkWorker[]>([]);
  const [payments, setPayments] = useState<WorkPayment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!workId) { setWorkers([]); setPayments([]); return; }
    setLoading(true);
    Promise.all([
      fetchWorkersWithExpenses(workId),
      fetchPayments(workId),
    ])
      .then(([w, p]) => { setWorkers(w); setPayments(p); })
      .catch(() => { setWorkers([]); setPayments([]); })
      .finally(() => setLoading(false));
  }, [workId]);

  const totalExpenses = useMemo(() => {
    return workers.reduce((sum, w) => {
      return sum + (w.expenses ?? []).reduce((s, e) => s + e.amount, 0);
    }, 0);
  }, [workers]);

  const paidAmount = useMemo(() => {
    return payments.reduce((s, p) => s + p.amount, 0);
  }, [payments]);

  const payouts = useMemo((): WorkerPayout[] => {
    if (workers.length === 0) return [];
    const netProfit = totalFee - totalExpenses;
    return workers.map((w) => {
      const shareRatio = (w.share || 0) / 100;
      const basePay = totalFee * shareRatio;
      const ownExpenses = (w.expenses ?? []).reduce((s, e) => s + e.amount, 0);
      const expenseCost = totalExpenses * shareRatio;
      const reimbursement = ownExpenses - expenseCost;
      const finalPayout = netProfit * shareRatio + ownExpenses;
      return { workerId: w.id, basePay, ownExpenses, expenseCost, reimbursement, finalPayout };
    });
  }, [workers, totalFee, totalExpenses]);

  const totalSharePercent = useMemo(() => {
    return workers.reduce((s, w) => s + (w.share || 0), 0);
  }, [workers]);

  const addWorkerAction = useCallback(
    async (name: string, role: string, share: number) => {
      if (!workId) return;
      const worker = await apiAddWorker(workId, name, role, share);
      setWorkers((prev) => [...prev, worker]);
    },
    [workId],
  );

  const removeWorkerAction = useCallback(async (wId: string) => {
    await apiRemoveWorker(wId);
    setWorkers((prev) => prev.filter((w) => w.id !== wId));
  }, []);

  const updateShareAction = useCallback(async (wId: string, share: number) => {
    await apiUpdateShare(wId, share);
    setWorkers((prev) => prev.map((w) => w.id === wId ? { ...w, share } : w));
  }, []);

  const addExpenseAction = useCallback(
    async (wId: string, description: string, amount: number, date: string) => {
      if (!workId) return;
      const expense = await apiAddExpense(wId, workId, description, amount, date);
      setWorkers((prev) =>
        prev.map((w) =>
          w.id === wId ? { ...w, expenses: [...(w.expenses ?? []), expense] } : w,
        ),
      );
    },
    [workId],
  );

  const removeExpenseAction = useCallback(async (expenseId: string) => {
    await apiRemoveExpense(expenseId);
    setWorkers((prev) =>
      prev.map((w) => ({
        ...w,
        expenses: (w.expenses ?? []).filter((e) => e.id !== expenseId),
      })),
    );
  }, []);

  const addPaymentAction = useCallback(
    async (amount: number, date: string, note: string) => {
      if (!workId) return;
      const payment = await apiAddPayment(workId, amount, date, note);
      setPayments((prev) => [payment, ...prev]);
    },
    [workId],
  );

  const removePaymentAction = useCallback(async (paymentId: string) => {
    await apiRemovePayment(paymentId);
    setPayments((prev) => prev.filter((p) => p.id !== paymentId));
  }, []);

  return {
    workers,
    payments,
    loading,
    totalExpenses,
    paidAmount,
    payouts,
    totalSharePercent,
    addWorker: addWorkerAction,
    removeWorker: removeWorkerAction,
    updateShare: updateShareAction,
    addExpense: addExpenseAction,
    removeExpense: removeExpenseAction,
    addPayment: addPaymentAction,
    removePayment: removePaymentAction,
  };
}
