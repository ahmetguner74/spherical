"use client";

import { useState, useEffect, useMemo } from "react";
import * as db from "../shared/ihaStorage";
import type { AuditEntry, AuditAction, AuditTarget } from "@/types/iha";
import { selectClass } from "../shared/styles";

// ─── Etiketler ───

const ACTION_LABELS: Record<AuditAction, string> = {
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

const ACTION_COLORS: Record<AuditAction, string> = {
  ekledi: "text-[var(--feedback-success)]",
  guncelledi: "text-[var(--feedback-warning)]",
  sildi: "text-[var(--feedback-error)]",
};

const ACTION_DOTS: Record<AuditAction, string> = {
  ekledi: "bg-[var(--feedback-success)]",
  guncelledi: "bg-[var(--feedback-warning)]",
  sildi: "bg-[var(--feedback-error)]",
};

// ─── Component ───

export function AuditLogList() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [profileMap, setProfileMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(50);

  // Filtreler
  const [filterAction, setFilterAction] = useState<AuditAction | "">("");
  const [filterTarget, setFilterTarget] = useState<AuditTarget | "">("");

  useEffect(() => {
    setLoading(true);
    Promise.all([db.fetchAuditLog(limit), db.fetchProfileMap()])
      .then(([auditData, profiles]) => {
        setEntries(auditData);
        setProfileMap(profiles);
      })
      .finally(() => setLoading(false));
  }, [limit]);

  const filtered = useMemo(() => {
    let result = entries;
    if (filterAction) result = result.filter((e) => e.action === filterAction);
    if (filterTarget) result = result.filter((e) => e.target === filterTarget);
    return result;
  }, [entries, filterAction, filterTarget]);

  // Mevcut hedefler (filtrede sadece var olanları göster)
  const availableTargets = useMemo(() => {
    const set = new Set(entries.map((e) => e.target));
    return Array.from(set).sort();
  }, [entries]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  };

  const resolveUser = (userId: string) => {
    if (userId === "bilinmiyor") return "Bilinmiyor";
    return profileMap[userId] ?? userId.slice(0, 8) + "…";
  };

  return (
    <div className="space-y-3">
      {/* Filtreler */}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value as AuditAction | "")}
          className={selectClass + " text-xs"}
        >
          <option value="">Tüm İşlemler</option>
          {(["ekledi", "guncelledi", "sildi"] as AuditAction[]).map((a) => (
            <option key={a} value={a}>{ACTION_LABELS[a]}</option>
          ))}
        </select>

        <select
          value={filterTarget}
          onChange={(e) => setFilterTarget(e.target.value as AuditTarget | "")}
          className={selectClass + " text-xs"}
        >
          <option value="">Tüm Hedefler</option>
          {availableTargets.map((t) => (
            <option key={t} value={t}>{TARGET_LABELS[t] ?? t}</option>
          ))}
        </select>

        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className={selectClass + " text-xs"}
        >
          <option value={25}>Son 25</option>
          <option value={50}>Son 50</option>
          <option value={100}>Son 100</option>
          <option value={250}>Son 250</option>
        </select>

        <span className="text-xs text-[var(--muted-foreground)] ml-auto">
          {filtered.length} / {entries.length} kayıt
        </span>
      </div>

      {/* Liste */}
      {loading ? (
        <p className="text-xs text-[var(--muted-foreground)] py-4 text-center">Yükleniyor...</p>
      ) : filtered.length === 0 ? (
        <p className="text-xs text-[var(--muted-foreground)] py-4 text-center">
          {entries.length === 0 ? "Henüz işlem kaydı yok" : "Filtreye uygun kayıt bulunamadı"}
        </p>
      ) : (
        <div className="max-h-[500px] overflow-y-auto space-y-0.5">
          {filtered.map((e) => (
            <div
              key={e.id}
              className="flex items-start gap-2 text-xs py-2 px-2 rounded-md hover:bg-[var(--surface)] border-b border-[var(--border)] last:border-0 transition-colors"
            >
              {/* Renk göstergesi */}
              <span className={`mt-1.5 shrink-0 w-2 h-2 rounded-full ${ACTION_DOTS[e.action] ?? ""}`} />

              {/* Ana içerik */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`font-medium ${ACTION_COLORS[e.action] ?? ""}`}>
                    {ACTION_LABELS[e.action] ?? e.action}
                  </span>
                  <span className="text-[var(--muted-foreground)]">·</span>
                  <span className="text-[var(--foreground)]">
                    {TARGET_LABELS[e.target] ?? e.target}
                  </span>
                </div>
                <p className="text-[var(--muted-foreground)] truncate mt-0.5">{e.description}</p>
              </div>

              {/* Sağ: kullanıcı + tarih */}
              <div className="shrink-0 text-right">
                <p className="text-[var(--foreground)] font-medium">{resolveUser(e.performedBy)}</p>
                <p className="text-[var(--muted-foreground)]">
                  {formatDate(e.performedAt)} {formatTime(e.performedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
