"use client";

import { useState } from "react";

interface Props {
  onAdd: (amount: number, date: string, note: string) => void;
  onCancel: () => void;
}

export function WorkPaymentForm({ onAdd, onCancel }: Props) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");

  const inputClass = "w-full px-2 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(amount);
    if (!val || val <= 0) return;
    onAdd(val, date, note.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end flex-wrap">
      <div className="w-24">
        <label className="text-xs text-[var(--muted-foreground)]">Tutar (₺)</label>
        <input type="number" min={1} step="any" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" autoFocus className={inputClass} />
      </div>
      <div className="w-32">
        <label className="text-xs text-[var(--muted-foreground)]">Tarih</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
      </div>
      <div className="flex-1 min-w-[100px]">
        <label className="text-xs text-[var(--muted-foreground)]">Not</label>
        <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="ör: Kapora" className={inputClass} />
      </div>
      <button type="submit" className="px-2 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs hover:bg-[var(--accent-hover)] transition-colors">
        Ekle
      </button>
      <button type="button" onClick={onCancel} className="px-2 py-1.5 rounded-lg bg-[var(--surface)] text-xs text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)] transition-colors">
        İptal
      </button>
    </form>
  );
}
