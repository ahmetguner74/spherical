"use client";

import { useState } from "react";
import type { WorkWorker } from "@/types";
import type { WorkerPayout } from "./useWorkDetail";
import { WorkWorkerCard } from "./WorkWorkerCard";
import { WorkWorkerForm } from "./WorkWorkerForm";

interface Props {
  workers: WorkWorker[];
  payouts: WorkerPayout[];
  totalSharePercent: number;
  onAddWorker: (name: string, role: string, share: number) => void;
  onRemoveWorker: (workerId: string) => void;
  onUpdateShare: (workerId: string, share: number) => void;
  onAddExpense: (workerId: string, description: string, amount: number, date: string) => void;
  onRemoveExpense: (expenseId: string) => void;
}

export function WorkWorkerList({ workers, payouts, totalSharePercent, onAddWorker, onRemoveWorker, onUpdateShare, onAddExpense, onRemoveExpense }: Props) {
  const [showForm, setShowForm] = useState(false);
  const defaultShare = workers.length === 0 ? 50 : Math.max(0, 100 - totalSharePercent);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-[var(--muted-foreground)]">
          Çalışanlar ({workers.length})
        </h4>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="text-xs px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors">
            + Çalışan Ekle
          </button>
        )}
      </div>
      {totalSharePercent !== 100 && workers.length > 0 && (
        <ShareWarning total={totalSharePercent} />
      )}
      {showForm && (
        <WorkWorkerForm
          onAdd={(name, role, share) => { onAddWorker(name, role, share); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
          defaultShare={defaultShare}
        />
      )}
      {workers.map((w) => {
        const payout = payouts.find((p) => p.workerId === w.id);
        return (
          <WorkWorkerCard
            key={w.id}
            worker={w}
            payout={payout}
            onRemove={() => onRemoveWorker(w.id)}
            onUpdateShare={(share) => onUpdateShare(w.id, share)}
            onAddExpense={(d, a, dt) => onAddExpense(w.id, d, a, dt)}
            onRemoveExpense={onRemoveExpense}
          />
        );
      })}
      {workers.length === 0 && !showForm && (
        <p className="text-xs text-[var(--muted-foreground)] text-center py-4">
          Henüz çalışan eklenmemiş
        </p>
      )}
    </div>
  );
}

function ShareWarning({ total }: { total: number }) {
  return (
    <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 px-3 py-2 text-xs text-yellow-400">
      Pay toplamı %{total} — %100 olmalı
    </div>
  );
}
