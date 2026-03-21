"use client";

import { useState } from "react";

interface Props {
  onAdd: (description: string, amount: number, date: string) => void;
  onCancel: () => void;
}

export function WorkExpenseForm({ onAdd, onCancel }: Props) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(amount);
    if (!description.trim() || !val || val <= 0) return;
    onAdd(description.trim(), val, date);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end flex-wrap">
      <div className="flex-1 min-w-[120px]">
        <label className="text-xs text-[var(--muted-foreground)]">Açıklama</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="ör: Malzeme"
          autoFocus
          className="w-full px-2 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
      </div>
      <div className="w-24">
        <label className="text-xs text-[var(--muted-foreground)]">Tutar (₺)</label>
        <input
          type="number"
          min={1}
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="w-full px-2 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
      </div>
      <div className="w-32">
        <label className="text-xs text-[var(--muted-foreground)]">Tarih</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-2 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
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
