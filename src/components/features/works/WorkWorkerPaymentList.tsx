"use client";

import { useState } from "react";
import type { WorkWorkerPayment } from "@/types";
import { formatDate } from "@/lib/utils";

interface Props {
  payments: WorkWorkerPayment[];
  onAdd: (amount: number, date: string, note: string) => void;
  onRemove: (id: string) => void;
}

export function WorkWorkerPaymentList({ payments, onAdd, onRemove }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const total = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--muted-foreground)]">Yapılan Ödemeler</span>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
            + Ödeme Yap
          </button>
        )}
      </div>
      {showForm && (
        <PaymentForm onAdd={(a, d, n) => { onAdd(a, d, n); setShowForm(false); }} onCancel={() => setShowForm(false)} />
      )}
      {payments.map((p) => (
        <div key={p.id} className="flex items-center justify-between text-xs px-2 py-1 rounded bg-[var(--background)]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-blue-400 font-medium shrink-0">₺{p.amount.toLocaleString("tr-TR")}</span>
            {p.note && <span className="text-[var(--foreground)] truncate">{p.note}</span>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[var(--muted-foreground)]">{formatDate(p.date)}</span>
            {confirmId === p.id ? (
              <span className="flex items-center gap-1">
                <span className="text-yellow-400">Sil?</span>
                <button onClick={() => { onRemove(p.id); setConfirmId(null); }} className="text-red-400 hover:text-red-300 font-medium">Evet</button>
                <button onClick={() => setConfirmId(null)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Hayır</button>
              </span>
            ) : (
              <button onClick={() => setConfirmId(p.id)} className="text-red-400 hover:text-red-300 transition-colors">✕</button>
            )}
          </div>
        </div>
      ))}
      {total > 0 && (
        <p className="text-xs text-blue-400 text-right">
          Toplam Ödenen: ₺{total.toLocaleString("tr-TR")}
        </p>
      )}
    </div>
  );
}

function PaymentForm({ onAdd, onCancel }: { onAdd: (a: number, d: string, n: string) => void; onCancel: () => void }) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  const inputClass = "w-full px-2 py-1.5 rounded bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(amount);
    if (!val || val <= 0) return;
    onAdd(val, date, note.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-1.5">
      <div className="flex gap-2">
        <input type="number" min={1} step="any" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Tutar" autoFocus className={inputClass} />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
      </div>
      <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Not (opsiyonel)" className={inputClass} />
      <div className="flex gap-2">
        <button type="submit" className="px-3 py-1.5 rounded bg-[var(--accent)] text-white text-xs hover:bg-[var(--accent-hover)] transition-colors">Kaydet</button>
        <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded bg-[var(--surface)] text-xs text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)] transition-colors">İptal</button>
      </div>
    </form>
  );
}
