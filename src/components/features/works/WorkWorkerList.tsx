"use client";

import { useState } from "react";
import type { WorkWorker, WorkWorkerPayment } from "@/types";
import type { WorkerPayout } from "./useWorkDetail";
import { WorkWorkerCard } from "./WorkWorkerCard";
import { WorkWorkerForm } from "./WorkWorkerForm";

interface Props {
  workers: WorkWorker[];
  payouts: WorkerPayout[];
  workerPayments: WorkWorkerPayment[];
  totalSharePercent: number;
  onAddWorker: (name: string, role: string, share: number) => void;
  onRemoveWorker: (workerId: string) => void;
  onUpdateShare: (workerId: string, share: number) => void;
  onAddExpense: (workerId: string, description: string, amount: number, date: string) => void;
  onRemoveExpense: (expenseId: string) => void;
  onAddWorkerPayment: (workerId: string, amount: number, date: string, note: string) => void;
  onRemoveWorkerPayment: (id: string) => void;
}

export function WorkWorkerList({ workers, payouts, workerPayments, totalSharePercent, onAddWorker, onRemoveWorker, onUpdateShare, onAddExpense, onRemoveExpense, onAddWorkerPayment, onRemoveWorkerPayment }: Props) {
  const [showForm, setShowForm] = useState(false);
  const remainingShare = Math.max(0, 100 - totalSharePercent);
  const defaultShare = workers.length === 0 ? 50 : remainingShare;

  const handleAddWorker = (name: string, role: string, share: number) => {
    if (totalSharePercent + share > 100) return;
    onAddWorker(name, role, share);
    setShowForm(false);
  };

  const handleUpdateShare = (workerId: string, newShare: number): boolean => {
    const currentWorker = workers.find((w) => w.id === workerId);
    const currentShare = currentWorker?.share ?? 0;
    const otherShares = totalSharePercent - currentShare;
    if (otherShares + newShare > 100) return false;
    onUpdateShare(workerId, newShare);
    return true;
  };

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
          onAdd={handleAddWorker}
          onCancel={() => setShowForm(false)}
          defaultShare={defaultShare}
          maxShare={remainingShare}
        />
      )}
      {workers.map((w) => {
        const payout = payouts.find((p) => p.workerId === w.id);
        const wPayments = workerPayments.filter((wp) => wp.workerId === w.id);
        return (
          <WorkWorkerCard
            key={w.id}
            worker={w}
            payout={payout}
            workerPayments={wPayments}
            onRemove={() => onRemoveWorker(w.id)}
            onUpdateShare={(share) => handleUpdateShare(w.id, share)}
            onAddExpense={(d, a, dt) => onAddExpense(w.id, d, a, dt)}
            onRemoveExpense={onRemoveExpense}
            onAddWorkerPayment={(a, d, n) => onAddWorkerPayment(w.id, a, d, n)}
            onRemoveWorkerPayment={onRemoveWorkerPayment}
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
