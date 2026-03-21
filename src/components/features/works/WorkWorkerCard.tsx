"use client";

import { useState } from "react";
import type { WorkWorker, WorkWorkerPayment } from "@/types";
import type { WorkerPayout } from "./useWorkDetail";
import { WorkExpenseList } from "./WorkExpenseList";
import { WorkWorkerPaymentList } from "./WorkWorkerPaymentList";

interface Props {
  worker: WorkWorker;
  payout?: WorkerPayout;
  workerPayments: WorkWorkerPayment[];
  onRemove: () => void;
  onUpdateShare: (share: number) => void;
  onAddExpense: (description: string, amount: number, date: string) => void;
  onRemoveExpense: (expenseId: string) => void;
  onAddWorkerPayment: (amount: number, date: string, note: string) => void;
  onRemoveWorkerPayment: (id: string) => void;
}

export function WorkWorkerCard({ worker, payout, workerPayments, onRemove, onUpdateShare, onAddExpense, onRemoveExpense, onAddWorkerPayment, onRemoveWorkerPayment }: Props) {
  const [editShare, setEditShare] = useState(false);
  const [shareVal, setShareVal] = useState(String(worker.share));
  const [confirmRemove, setConfirmRemove] = useState(false);

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
        confirmRemove={confirmRemove}
        onEditShare={() => { setShareVal(String(worker.share)); setEditShare(true); }}
        onShareChange={setShareVal}
        onShareSave={handleShareSave}
        onRemoveClick={() => setConfirmRemove(true)}
        onRemoveConfirm={onRemove}
        onRemoveCancel={() => setConfirmRemove(false)}
      />
      {payout && <PayoutSummary payout={payout} />}
      <WorkExpenseList expenses={worker.expenses ?? []} onAdd={onAddExpense} onRemove={onRemoveExpense} />
      <WorkWorkerPaymentList payments={workerPayments} onAdd={onAddWorkerPayment} onRemove={onRemoveWorkerPayment} />
    </div>
  );
}

function WorkerHeader({ worker, editShare, shareVal, confirmRemove, onEditShare, onShareChange, onShareSave, onRemoveClick, onRemoveConfirm, onRemoveCancel }: {
  worker: WorkWorker; editShare: boolean; shareVal: string; confirmRemove: boolean;
  onEditShare: () => void; onShareChange: (v: string) => void; onShareSave: () => void;
  onRemoveClick: () => void; onRemoveConfirm: () => void; onRemoveCancel: () => void;
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
        {confirmRemove ? (
          <span className="flex items-center gap-1 text-xs">
            <span className="text-yellow-400">Kaldır?</span>
            <button onClick={onRemoveConfirm} className="text-red-400 hover:text-red-300 font-medium">Evet</button>
            <button onClick={onRemoveCancel} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Hayır</button>
          </span>
        ) : (
          <button onClick={onRemoveClick} className="text-xs text-red-400 hover:text-red-300 transition-colors">
            Kaldır
          </button>
        )}
      </div>
    </div>
  );
}

function PayoutSummary({ payout }: { payout: WorkerPayout }) {
  const fmt = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded bg-[var(--surface)]">
        <span className="text-[var(--muted-foreground)]">Toplam Alacak</span>
        <span className="font-semibold text-green-400">₺{fmt(payout.finalPayout)}</span>
      </div>
      {payout.paidToWorker > 0 && (
        <div className="flex items-center justify-between text-xs px-2 py-1 rounded bg-[var(--surface)]">
          <span className="text-[var(--muted-foreground)]">Ödenen</span>
          <span className="text-blue-400">₺{fmt(payout.paidToWorker)}</span>
        </div>
      )}
      <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded bg-[var(--surface)]">
        <span className="text-[var(--muted-foreground)]">Kalan Alacak</span>
        <span className={`font-bold ${payout.remainingPayout > 0 ? "text-yellow-400" : "text-green-400"}`}>
          ₺{fmt(payout.remainingPayout)}
        </span>
      </div>
    </div>
  );
}
