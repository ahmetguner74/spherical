"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { WorkWorker } from "@/types";
import {
  fetchWorkersWithExpenses,
  addWorker as apiAddWorker,
  removeWorker as apiRemoveWorker,
  addExpense as apiAddExpense,
  removeExpense as apiRemoveExpense,
} from "./workersStorage";

export function useWorkDetail(workId: string | null) {
  const [workers, setWorkers] = useState<WorkWorker[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!workId) { setWorkers([]); return; }
    setLoading(true);
    fetchWorkersWithExpenses(workId)
      .then(setWorkers)
      .catch(() => setWorkers([]))
      .finally(() => setLoading(false));
  }, [workId]);

  const totalExpenses = useMemo(() => {
    return workers.reduce((sum, w) => {
      const wTotal = (w.expenses ?? []).reduce((s, e) => s + e.amount, 0);
      return sum + wTotal;
    }, 0);
  }, [workers]);

  const addWorkerAction = useCallback(
    async (name: string, role: string) => {
      if (!workId) return;
      const worker = await apiAddWorker(workId, name, role);
      setWorkers((prev) => [...prev, worker]);
    },
    [workId],
  );

  const removeWorkerAction = useCallback(async (workerId: string) => {
    await apiRemoveWorker(workerId);
    setWorkers((prev) => prev.filter((w) => w.id !== workerId));
  }, []);

  const addExpenseAction = useCallback(
    async (workerId: string, description: string, amount: number, date: string) => {
      if (!workId) return;
      const expense = await apiAddExpense(workerId, workId, description, amount, date);
      setWorkers((prev) =>
        prev.map((w) =>
          w.id === workerId
            ? { ...w, expenses: [...(w.expenses ?? []), expense] }
            : w,
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

  return {
    workers,
    loading,
    totalExpenses,
    addWorker: addWorkerAction,
    removeWorker: removeWorkerAction,
    addExpense: addExpenseAction,
    removeExpense: removeExpenseAction,
  };
}
