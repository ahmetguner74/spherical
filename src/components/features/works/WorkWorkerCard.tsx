"use client";

import { useState } from "react";
import type { WorkWorker } from "@/types";
import type { WorkerPayout } from "./useWorkDetail";
import { WorkExpenseList } from "./WorkExpenseList";

interface Props {
  worker: WorkWorker;
  payout?: WorkerPayout;
  onRemove: () => void;
  onUpdateShare: (share: number) => void;
  onAddExpense: (description: string, amount: number, date: string) => void;
  onRemoveExpense: (expenseId: string) => void;
}

export function WorkWorkerCard({ worker, payout, onRemove, onUpdateShare, onAddExpense, onRemoveExpense }: Props) {
  const [editShare, setEditShare] = useState(false);
  const [shareVal, setShareVal] = useState(String(worker.share));

  const handleShareSave = () => {
    onUpdateShare(Number(shareVal) || 0);
    setEditShare(false);
  };

  return (
    <div className="rounded-lg border border-[var(--border)] p-3 space-y-2">
      <WorkerHeader
        worker={worker}
        editShare={editShare}
        shareVal={shareVal}
        onEditShare={() => { setShareVal(String(worker.share)); setEditShare(true); }}
        onShareChange={setShareVal}
        onShareSave={handleShareSave}
        onRemove={onRemove}
      />
      {payout && <PayoutRow payout={payout} />}
      <WorkExpenseList expenses={worker.expenses ?? []} onAdd={onAddExpense} onRemove={onRemoveExpense} />
    </div>
  );
}

function WorkerHeader({ worker, editShare, shareVal, onEditShare, onShareChange, onShareSave, onRemove }: {
  worker: WorkWorker; editShare: boolean; shareVal: string;
  onEditShare: () => void; onShareChange: (v: string) => void; onShareSave: () => void; onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-medium text-[var(--foreground)] truncate">{worker.name}</span>
        {worker.role && <span className="text-xs text-[var(--muted-foreground)]">({worker.role})</span>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {editShare ? (
          <div className="flex items-center gap-1">
            <input type="number" min={0} max={100} value={shareVal} onChange={(e) => onShareChange(e.target.value)}
              className="w-14 px-1 py-0.5 text-xs rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
            <button onClick={onShareSave} className="text-xs text-green-400 hover:text-green-300">✓</button>
          </div>
        ) : (
          <button onClick={onEditShare} className="text-xs px-2 py-0.5 rounded bg-[var(--surface)] text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)] transition-colors">
            %{worker.share}
          </button>
        )}
        <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-300 transition-colors">
          Kaldır
        </button>
      </div>
    </div>
  );
}

function PayoutRow({ payout }: { payout: WorkerPayout }) {
  return (
    <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded bg-[var(--surface)]">
      <span className="text-[var(--muted-foreground)]">Alacak</span>
      <span className="font-semibold text-green-400">
        ₺{payout.finalPayout.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </span>
    </div>
  );
}
