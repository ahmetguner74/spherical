"use client";

import { useMemo } from "react";
import type { Operation } from "@/types/iha";

interface KpiCardsProps {
  operations: Operation[];
  /** "Yapılıyor" kartına tıklanınca — OperationsTab'a geç + filtrele */
  onShowActive?: () => void;
}

interface KpiAlert {
  id: string;
  type: "overdue" | "inprogress" | "nodate";
  label: string;
}

// "YYYY-AA-GG" formatındaki tarihi yerel Date objesine çevirir (timezone safe)
function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function KpiCards({ operations, onShowActive }: KpiCardsProps) {
  const today = todayStr();

  const stats = useMemo(() => {
    const active = operations.filter((o) => ["saha", "isleme", "kontrol"].includes(o.status));
    const pending = operations.filter((o) => ["talep", "planlama"].includes(o.status));
    const done = operations.filter((o) => o.status === "teslim");
    const cancelled = operations.filter((o) => o.status === "iptal");

    // Gecikmeli: bitiş tarihi bugünden önce ve hâlâ aktif/beklemede
    const overdue = operations.filter((o) => {
      if (!["talep", "planlama", "saha", "isleme", "kontrol"].includes(o.status)) return false;
      if (!o.endDate) return false;
      return o.endDate < today;
    });

    // Bu hafta teslim beklenen (bugün → +6 gün)
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekEndStr = weekEnd.toISOString().slice(0, 10);
    const dueSoon = operations.filter((o) => {
      if (!["talep", "planlama", "saha", "isleme", "kontrol"].includes(o.status)) return false;
      if (!o.endDate) return false;
      return o.endDate >= today && o.endDate <= weekEndStr;
    });

    // Tarih girilmemiş aktif operasyonlar
    const noDate = active.filter((o) => !o.endDate);

    const alerts: KpiAlert[] = [
      ...overdue.map((o) => ({
        id: o.id,
        type: "overdue" as const,
        label: `"${o.title}" — son tarih geçmiş (${o.endDate})`,
      })),
      ...dueSoon.map((o) => ({
        id: o.id,
        type: "inprogress" as const,
        label: `"${o.title}" — bu hafta bitiyor (${o.endDate})`,
      })),
      ...noDate.slice(0, 2).map((o) => ({
        id: o.id,
        type: "nodate" as const,
        label: `"${o.title}" — tarih girilmemiş`,
      })),
    ].slice(0, 5); // max 5 uyarı

    return { active, pending, done, cancelled, overdue, dueSoon, noDate, alerts };
  }, [operations, today]);

  const cards = [
    {
      label: "Sahada",
      value: stats.active.length,
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.10)",
      icon: "✈",
      onClick: onShowActive,
      clickable: !!onShowActive,
    },
    {
      label: "Beklemede",
      value: stats.pending.length,
      color: "#f97316",
      bg: "rgba(249,115,22,0.10)",
      icon: "⏳",
      onClick: undefined,
      clickable: false,
    },
    {
      label: "Teslim Edildi",
      value: stats.done.length,
      color: "#22c55e",
      bg: "rgba(34,197,94,0.10)",
      icon: "✓",
      onClick: undefined,
      clickable: false,
    },
    {
      label: "Toplam",
      value: operations.length,
      color: "var(--muted-foreground)",
      bg: "var(--surface-hover)",
      icon: "#",
      onClick: undefined,
      clickable: false,
    },
  ];

  return (
    <div className="space-y-3">
      {/* KPI Kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {cards.map((card) => (
          <div
            key={card.label}
            onClick={card.onClick}
            role={card.clickable ? "button" : undefined}
            tabIndex={card.clickable ? 0 : undefined}
            onKeyDown={card.clickable ? (e) => e.key === "Enter" && card.onClick?.() : undefined}
            className={`rounded-xl border border-[var(--border)] p-3 flex flex-col gap-1 transition-all ${
              card.clickable ? "cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98]" : ""
            }`}
            style={{ backgroundColor: card.bg }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: card.color }}
              >
                {card.label}
              </span>
              <span className="text-base" aria-hidden="true">{card.icon}</span>
            </div>
            <span
              className="text-3xl font-bold tabular-nums leading-none"
              style={{ color: card.color }}
            >
              {card.value}
            </span>
            {card.clickable && (
              <span className="text-[10px]" style={{ color: card.color, opacity: 0.7 }}>
                Tümünü gör →
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Dikkat Bölümü — sadece uyarı varsa göster */}
      {stats.alerts.length > 0 && (
        <div className="rounded-xl border border-[var(--feedback-warning)]/40 bg-[var(--feedback-warning-bg)] p-3 space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--feedback-warning)]">
            ⚠ Dikkat — {stats.alerts.length} uyarı
          </p>
          <ul className="space-y-1">
            {stats.alerts.map((alert) => (
              <li key={alert.id} className="flex items-start gap-1.5 text-xs text-[var(--foreground)]">
                <span className="shrink-0 mt-0.5" style={{ color: alert.type === "overdue" ? "var(--feedback-error)" : "var(--feedback-warning)" }}>
                  {alert.type === "overdue" ? "●" : "○"}
                </span>
                <span className={alert.type === "overdue" ? "text-[var(--feedback-error)]" : ""}>
                  {alert.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
