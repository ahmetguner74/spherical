"use client";

import { useState } from "react";

interface Props {
  onAdd: (name: string, role: string, share: number) => void;
  onCancel: () => void;
  defaultShare?: number;
}

export function WorkWorkerForm({ onAdd, onCancel, defaultShare = 50 }: Props) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [share, setShare] = useState(String(defaultShare));

  const inputClass = "w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), role.trim(), Number(share) || 0);
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
          <input type="number" min={0} max={100} value={share} onChange={(e) => setShare(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="px-3 py-2 rounded-lg bg-[var(--accent)] text-white text-sm hover:bg-[var(--accent-hover)] transition-colors">
          Ekle
        </button>
        <button type="button" onClick={onCancel} className="px-3 py-2 rounded-lg bg-[var(--surface)] text-sm text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)] transition-colors">
          İptal
        </button>
      </div>
    </form>
  );
}
