"use client";

import { useState, useMemo } from "react";
import type { Operation } from "@/types/iha";
import { OPERATION_STATUS_LABELS } from "@/types/iha";
import { statusColors } from "@/config/tokens";

interface OperationCalendarProps {
  operations: Operation[];
  onSelect: (op: Operation) => void;
}

const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const DAYS_FULL = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
const DAYS_SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export function OperationCalendar({ operations, onSelect }: OperationCalendarProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const opsByDate = useMemo(() => {
    const map = new Map<string, Operation[]>();
    operations.forEach((op) => {
      if (!op.startDate) return;
      const start = op.startDate.slice(0, 10);
      const end = op.endDate?.slice(0, 10) ?? start;
      const d = new Date(start);
      const endD = new Date(end);
      while (d <= endD) {
        const key = d.toISOString().slice(0, 10);
        const list = map.get(key) ?? [];
        list.push(op);
        map.set(key, list);
        d.setDate(d.getDate() + 1);
      }
    });
    return map;
  }, [operations]);

  const prev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const next = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const selectedOps = selectedDate ? opsByDate.get(selectedDate) ?? [] : [];

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {/* Ay Navigasyonu */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <button onClick={prev} className="p-2 -m-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] active:bg-[var(--surface-hover)] rounded-lg">
          ←
        </button>
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          {MONTHS[viewMonth]} {viewYear}
        </h3>
        <button onClick={next} className="p-2 -m-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] active:bg-[var(--surface-hover)] rounded-lg">
          →
        </button>
      </div>

      {/* Gün Başlıkları */}
      <div className="grid grid-cols-7 text-center border-b border-[var(--border)]">
        {DAYS_SHORT.map((d, i) => (
          <div key={d} className="py-2 text-xs font-medium text-[var(--muted-foreground)]">
            <span className="sm:hidden">{d[0]}</span>
            <span className="hidden sm:inline md:hidden">{DAYS_SHORT[i]}</span>
            <span className="hidden md:inline">{DAYS_FULL[i]}</span>
          </div>
        ))}
      </div>

      {/* Takvim Grid */}
      <div className="grid grid-cols-7">
        {/* Boş günler */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`e-${i}`} className="min-h-[3rem] sm:min-h-[4.5rem] border-b border-r border-[var(--border)] bg-[var(--background)]/30" />
        ))}

        {/* Günler */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayOps = opsByDate.get(dateStr) ?? [];
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const hasOps = dayOps.length > 0;

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(isSelected ? null : dateStr)}
              className={`min-h-[3rem] sm:min-h-[4.5rem] p-1 sm:p-1.5 border-b border-r border-[var(--border)] text-left transition-colors ${
                isSelected ? "bg-[var(--accent)]/10 ring-1 ring-inset ring-[var(--accent)]" :
                isToday ? "bg-[var(--accent)]/5" : ""
              } ${hasOps ? "hover:bg-[var(--surface-hover)]" : ""}`}
            >
              {/* Gün numarası */}
              <span className={`text-xs sm:text-sm font-medium block ${
                isToday ? "text-[var(--accent)] font-bold" : "text-[var(--muted-foreground)]"
              }`}>
                {day}
              </span>

              {/* Mobil: Sadece noktalar */}
              <div className="flex gap-0.5 mt-0.5 sm:hidden">
                {dayOps.slice(0, 4).map((op) => (
                  <div
                    key={op.id}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: statusColors[op.status] }}
                  />
                ))}
                {dayOps.length > 4 && <span className="text-[8px] text-[var(--muted-foreground)]">+{dayOps.length - 4}</span>}
              </div>

              {/* Masaüstü: Operasyon etiketleri */}
              <div className="hidden sm:block space-y-0.5 mt-0.5">
                {dayOps.slice(0, 2).map((op) => (
                  <div
                    key={op.id}
                    className="rounded px-1 py-0.5 text-[11px] leading-tight truncate"
                    style={{ backgroundColor: `${statusColors[op.status]}20`, color: statusColors[op.status] }}
                  >
                    {op.title}
                  </div>
                ))}
                {dayOps.length > 2 && (
                  <span className="text-[10px] text-[var(--muted-foreground)] px-1">+{dayOps.length - 2}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Seçili Gün Detayı (Mobilde çok önemli) */}
      {selectedDate && selectedOps.length > 0 && (
        <div className="border-t border-[var(--border)] p-3 space-y-2 bg-[var(--background)]">
          <h4 className="text-xs font-semibold text-[var(--muted-foreground)]">
            {new Date(selectedDate + "T00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
            <span className="ml-1">({selectedOps.length} operasyon)</span>
          </h4>
          {selectedOps.map((op) => (
            <button
              key={op.id}
              onClick={() => onSelect(op)}
              className="w-full text-left rounded-lg p-3 border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-hover)] transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-[var(--foreground)] truncate">{op.title}</span>
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap font-medium"
                  style={{ backgroundColor: `${statusColors[op.status]}20`, color: statusColors[op.status] }}
                >
                  {OPERATION_STATUS_LABELS[op.status]}
                </span>
              </div>
              {op.requester && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{op.requester}</p>}
            </button>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="px-3 py-2 border-t border-[var(--border)] flex items-center gap-3 flex-wrap">
        {(["talep", "saha", "isleme", "teslim"] as const).map((s) => (
          <div key={s} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColors[s] }} />
            <span className="text-[10px] sm:text-xs text-[var(--muted-foreground)]">{OPERATION_STATUS_LABELS[s]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
