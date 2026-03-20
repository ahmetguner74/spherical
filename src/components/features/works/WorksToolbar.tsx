"use client";

import type { WorkStatus } from "@/types";

interface WorksToolbarProps {
  view: "table" | "grid";
  onViewChange: (v: "table" | "grid") => void;
  statusFilter: WorkStatus | "all";
  onStatusChange: (s: WorkStatus | "all") => void;
  clientFilter: string;
  onClientChange: (c: string) => void;
  clients: string[];
  onAdd: () => void;
}

export function WorksToolbar(props: WorksToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Filters {...props} />
      <div className="ml-auto flex items-center gap-2">
        <ViewToggle view={props.view} onChange={props.onViewChange} />
        <AddButton onClick={props.onAdd} />
      </div>
    </div>
  );
}

function Filters({ statusFilter, onStatusChange, clientFilter, onClientChange, clients }: WorksToolbarProps) {
  const selectClass = "rounded-lg bg-[var(--surface)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";

  return (
    <>
      <select value={statusFilter} onChange={(e) => onStatusChange(e.target.value as WorkStatus | "all")} className={selectClass}>
        <option value="all">Tüm Durumlar</option>
        <option value="completed">Tamamlandı</option>
        <option value="in_progress">Devam Ediyor</option>
        <option value="pending">Beklemede</option>
      </select>
      <select value={clientFilter} onChange={(e) => onClientChange(e.target.value)} className={selectClass}>
        <option value="">Tüm Müşteriler</option>
        {clients.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </>
  );
}

function ViewToggle({ view, onChange }: { view: "table" | "grid"; onChange: (v: "table" | "grid") => void }) {
  const base = "px-3 py-2 text-sm rounded-lg border transition-colors";
  const active = "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30";
  const inactive = "bg-[var(--surface)] text-[var(--muted-foreground)] border-[var(--border)] hover:bg-[var(--surface-hover)]";

  return (
    <div className="flex gap-1">
      <button onClick={() => onChange("table")} className={`${base} ${view === "table" ? active : inactive}`}>Tablo</button>
      <button onClick={() => onChange("grid")} className={`${base} ${view === "grid" ? active : inactive}`}>Kart</button>
    </div>
  );
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
    >
      + Yeni İş
    </button>
  );
}
