"use client";

import { useState } from "react";
import type { WorkWorker } from "@/types";
import { WorkWorkerCard } from "./WorkWorkerCard";
import { WorkWorkerForm } from "./WorkWorkerForm";

interface Props {
  workers: WorkWorker[];
  onAddWorker: (name: string, role: string) => void;
  onRemoveWorker: (workerId: string) => void;
  onAddExpense: (workerId: string, description: string, amount: number, date: string) => void;
  onRemoveExpense: (expenseId: string) => void;
}

export function WorkWorkerList({ workers, onAddWorker, onRemoveWorker, onAddExpense, onRemoveExpense }: Props) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-[var(--muted-foreground)]">
          Çalışanlar ({workers.length})
        </h4>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            + Çalışan Ekle
          </button>
        )}
      </div>
      {showForm && (
        <WorkWorkerForm
          onAdd={(name, role) => { onAddWorker(name, role); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}
      {workers.map((w) => (
        <WorkWorkerCard
          key={w.id}
          worker={w}
          onRemove={() => onRemoveWorker(w.id)}
          onAddExpense={(d, a, dt) => onAddExpense(w.id, d, a, dt)}
          onRemoveExpense={onRemoveExpense}
        />
      ))}
      {workers.length === 0 && !showForm && (
        <p className="text-xs text-[var(--muted-foreground)] text-center py-4">
          Henüz çalışan eklenmemiş
        </p>
      )}
    </div>
  );
}
