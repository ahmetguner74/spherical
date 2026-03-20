"use client";

import type { WorkWorker } from "@/types";
import { WorkExpenseList } from "./WorkExpenseList";

interface Props {
  worker: WorkWorker;
  onRemove: () => void;
  onAddExpense: (description: string, amount: number, date: string) => void;
  onRemoveExpense: (expenseId: string) => void;
}

export function WorkWorkerCard({ worker, onRemove, onAddExpense, onRemoveExpense }: Props) {
  return (
    <div className="rounded-lg border border-[var(--border)] p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-[var(--foreground)]">{worker.name}</span>
          {worker.role && (
            <span className="ml-2 text-xs text-[var(--muted-foreground)]">({worker.role})</span>
          )}
        </div>
        <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-300 transition-colors">
          Kaldır
        </button>
      </div>
      <WorkExpenseList
        expenses={worker.expenses ?? []}
        onAdd={onAddExpense}
        onRemove={onRemoveExpense}
      />
    </div>
  );
}
