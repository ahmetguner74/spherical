"use client";

import { useState, useEffect } from "react";
import * as db from "../shared/ihaStorage";
import type { AuditEntry } from "@/types/iha";

const ACTION_LABELS: Record<string, string> = {
  ekledi: "Ekledi",
  guncelledi: "Güncelledi",
  sildi: "Sildi",
};

const TARGET_LABELS: Record<string, string> = {
  operasyon: "Operasyon",
  ekipman: "Ekipman",
  yazilim: "Yazılım",
  personel: "Personel",
  depolama: "Depolama",
  ucus_defteri: "Uçuş Defteri",
  bakim: "Bakım",
};

const ACTION_COLORS: Record<string, string> = {
  ekledi: "text-green-400",
  guncelledi: "text-yellow-400",
  sildi: "text-red-400",
};

export function AuditLogList() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    setLoading(true);
    db.fetchAuditLog(limit)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [limit]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString("tr-TR")} ${d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className="ring-2 ring-red-500 rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">
          İşlem Geçmişi (Audit Log)
        </p>
        <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="text-xs bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] rounded px-2 py-1">
          <option value={25}>Son 25</option>
          <option value={50}>Son 50</option>
          <option value={100}>Son 100</option>
        </select>
      </div>

      {loading ? (
        <p className="text-xs text-[var(--muted-foreground)]">Yükleniyor...</p>
      ) : entries.length === 0 ? (
        <p className="text-xs text-[var(--muted-foreground)]">Henüz işlem kaydı yok</p>
      ) : (
        <div className="space-y-0.5 max-h-[400px] overflow-y-auto">
          {entries.map((e) => (
            <div key={e.id} className="flex items-start gap-2 text-xs py-1.5 border-b border-[var(--border)] last:border-0">
              <span className="text-[var(--muted-foreground)] shrink-0 w-28">{formatDate(e.performedAt)}</span>
              <span className={`shrink-0 w-16 font-medium ${ACTION_COLORS[e.action] ?? ""}`}>
                {ACTION_LABELS[e.action] ?? e.action}
              </span>
              <span className="text-[var(--muted-foreground)] shrink-0 w-20">
                {TARGET_LABELS[e.target] ?? e.target}
              </span>
              <span className="text-[var(--foreground)] truncate flex-1">{e.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
