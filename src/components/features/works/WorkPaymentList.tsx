"use client";

import { useState } from "react";
import type { WorkPayment } from "@/types";
import { formatDate } from "@/lib/utils";
import { WorkPaymentForm } from "./WorkPaymentForm";

interface Props {
  payments: WorkPayment[];
  onAdd: (amount: number, date: string, note: string) => void;
  onRemove: (paymentId: string) => void;
}

export function WorkPaymentList({ payments, onAdd, onRemove }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const total = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-[var(--muted-foreground)]">Ödeme Geçmişi</h4>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="text-xs px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors">
            + Ödeme Ekle
          </button>
        )}
      </div>
      {showForm && (
        <WorkPaymentForm onAdd={(a, d, n) => { onAdd(a, d, n); setShowForm(false); }} onCancel={() => setShowForm(false)} />
      )}
      {payments.map((p) => (
        <div key={p.id} className="flex items-center justify-between text-xs px-2 py-1.5 rounded bg-[var(--background)]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-green-400 font-medium shrink-0">₺{p.amount.toLocaleString("tr-TR")}</span>
            {p.note && <span className="text-[var(--foreground)] truncate">{p.note}</span>}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[var(--muted-foreground)]">{formatDate(p.date)}</span>
            {confirmId === p.id ? (
              <ConfirmButtons onYes={() => { onRemove(p.id); setConfirmId(null); }} onNo={() => setConfirmId(null)} />
            ) : (
              <button onClick={() => setConfirmId(p.id)} className="text-red-400 hover:text-red-300 transition-colors">✕</button>
            )}
          </div>
        </div>
      ))}
      {payments.length === 0 && !showForm && (
        <p className="text-xs text-[var(--muted-foreground)] text-center py-2">Henüz ödeme kaydı yok</p>
      )}
      {total > 0 && (
        <p className="text-xs font-medium text-green-400 text-right">
          Toplam Alınan: ₺{total.toLocaleString("tr-TR")}
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
