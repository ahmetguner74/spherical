"use client";

import { useState } from "react";

interface Props {
  onAdd: (name: string, role: string) => void;
  onCancel: () => void;
}

export function WorkWorkerForm({ onAdd, onCancel }: Props) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), role.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="flex-1">
        <label className="text-xs text-[var(--muted-foreground)]">İsim</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Çalışan adı"
          autoFocus
          className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
      </div>
      <div className="flex-1">
        <label className="text-xs text-[var(--muted-foreground)]">Rol</label>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="ör: Teknisyen"
          className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
      </div>
      <button type="submit" className="px-3 py-2 rounded-lg bg-[var(--accent)] text-white text-sm hover:bg-[var(--accent-hover)] transition-colors">
        Ekle
      </button>
      <button type="button" onClick={onCancel} className="px-3 py-2 rounded-lg bg-[var(--surface)] text-sm text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)] transition-colors">
        İptal
      </button>
    </form>
  );
}
