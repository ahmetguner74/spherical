"use client";

import { useState } from "react";
import type { WorkExpense } from "@/types";
import { formatDate } from "@/lib/utils";
import { WorkExpenseForm } from "./WorkExpenseForm";

interface Props {
  expenses: WorkExpense[];
  onAdd: (description: string, amount: number, date: string) => void;
  onRemove: (expenseId: string) => void;
}

export function WorkExpenseList({ expenses, onAdd, onRemove }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-2">
      {expenses.map((e) => (
        <div key={e.id} className="flex items-center justify-between text-xs px-2 py-1.5 rounded bg-[var(--background)]">
          <span className="text-[var(--foreground)]">{e.description}</span>
          <div className="flex items-center gap-3">
            <span className="text-[var(--muted-foreground)]">{formatDate(e.date)}</span>
            <span className="font-medium text-[var(--foreground)]">₺{e.amount.toLocaleString("tr-TR")}</span>
            {confirmId === e.id ? (
              <ConfirmButtons onYes={() => { onRemove(e.id); setConfirmId(null); }} onNo={() => setConfirmId(null)} />
            ) : (
              <button onClick={() => setConfirmId(e.id)} className="text-red-400 hover:text-red-300 transition-colors">✕</button>
            )}
          </div>
        </div>
      ))}
      {showForm ? (
        <WorkExpenseForm onAdd={(d, a, dt) => { onAdd(d, a, dt); setShowForm(false); }} onCancel={() => setShowForm(false)} />
      ) : (
        <button onClick={() => setShowForm(true)} className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
          + Harcama Ekle
        </button>
      )}
      {expenses.length > 0 && (
        <p className="text-xs font-medium text-[var(--foreground)] text-right">
          Toplam Harcama: ₺{total.toLocaleString("tr-TR")}
        </p>
      )}
    </div>
  );
}

function ConfirmButtons({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-yellow-400">Sil?</span>
      <button onClick={onYes} className="text-red-400 hover:text-red-300 font-medium">Evet</button>
      <button onClick={onNo} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Hayır</button>
    </span>
  );
}
