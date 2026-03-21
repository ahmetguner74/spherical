"use client";

import { useState } from "react";

interface Props {
  onAdd: (name: string, role: string, share: number) => void;
  onCancel: () => void;
  defaultShare?: number;
  maxShare?: number;
}

export function WorkWorkerForm({ onAdd, onCancel, defaultShare = 50, maxShare = 100 }: Props) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [share, setShare] = useState(String(defaultShare));

  const shareVal = Number(share) || 0;
  const isOverLimit = shareVal > maxShare;

  const inputClass = "w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isOverLimit) return;
    onAdd(name.trim(), role.trim(), shareVal);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-[var(--muted-foreground)]">İsim *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Çalışan adı" autoFocus className={inputClass} />
        </div>
        <div className="flex-1">
          <label className="text-xs text-[var(--muted-foreground)]">Rol</label>
          <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="ör: Teknisyen" className={inputClass} />
        </div>
        <div className="w-20">
          <label className="text-xs text-[var(--muted-foreground)]">Pay %</label>
          <input type="number" min={0} max={maxShare} value={share} onChange={(e) => setShare(e.target.value)} className={`${inputClass} ${isOverLimit ? "border-red-500 ring-1 ring-red-500" : ""}`} />
        </div>
      </div>
      {isOverLimit && (
        <p className="text-xs text-red-400">Maksimum %{maxShare} pay verilebilir</p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={isOverLimit} className="px-3 py-2 rounded-lg bg-[var(--accent)] text-white text-sm hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Ekle
        </button>
        <button type="button" onClick={onCancel} className="px-3 py-2 rounded-lg bg-[var(--surface)] text-sm text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)] transition-colors">
          İptal
        </button>
      </div>
    </form>
  );
}
