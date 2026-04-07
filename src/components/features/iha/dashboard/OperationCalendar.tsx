"use client";

import { useState, useMemo } from "react";
import type { Operation } from "@/types/iha";
import { OPERATION_STATUS_LABELS, OPERATION_TYPE_LABELS } from "@/types/iha";
import { statusColors } from "@/config/tokens";

interface OperationCalendarProps {
  operations: Operation[];
  onSelect: (op: Operation) => void;
}

export function OperationCalendar({ operations, onSelect }: OperationCalendarProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const opsByDate = useMemo(() => {
    const map = new Map<string, Operation[]>();
    operations.forEach((op) => {
      if (!op.startDate) return;
      const key = op.startDate.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(op);
      map.set(key, list);
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

  const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <button onClick={prev} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-2">←</button>
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          {MONTHS[viewMonth]} {viewYear}
        </h3>
        <button onClick={next} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-2">→</button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs text-[var(--muted-foreground)] border-b border-[var(--border)]">
        {DAYS.map((d) => (
          <div key={d} className="py-2 font-medium">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[4rem] border-b border-r border-[var(--border)] bg-[var(--background)]/30" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayOps = opsByDate.get(dateStr) ?? [];
          const isToday = dateStr === todayStr;

          return (
            <div
              key={day}
              className={`min-h-[4rem] p-1 border-b border-r border-[var(--border)] ${
                isToday ? "bg-[var(--accent)]/5" : ""
              }`}
            >
              <span className={`text-xs font-medium block mb-0.5 ${
                isToday ? "text-[var(--accent)]" : "text-[var(--muted-foreground)]"
              }`}>
                {day}
              </span>
              <div className="space-y-0.5">
                {dayOps.slice(0, 3).map((op) => (
                  <button
                    key={op.id}
                    onClick={() => onSelect(op)}
                    className="w-full text-left rounded px-1 py-0.5 text-[10px] leading-tight truncate hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: `${statusColors[op.status]}20`, color: statusColors[op.status] }}
                    title={`${op.title} — ${OPERATION_STATUS_LABELS[op.status]}`}
                  >
                    {op.title}
                  </button>
                ))}
                {dayOps.length > 3 && (
                  <span className="text-[10px] text-[var(--muted-foreground)] px-1">
                    +{dayOps.length - 3}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-2 border-t border-[var(--border)] flex items-center gap-3 flex-wrap">
        {[
          { status: "talep" as const, label: "Talep" },
          { status: "saha" as const, label: "Saha" },
          { status: "isleme" as const, label: "İşleme" },
          { status: "teslim" as const, label: "Teslim" },
        ].map((item) => (
          <div key={item.status} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: statusColors[item.status] }} />
            <span className="text-[10px] text-[var(--muted-foreground)]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
