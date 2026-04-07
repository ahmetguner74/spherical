"use client";

import { useState, useMemo } from "react";
import type { Operation } from "@/types/iha";
import { OPERATION_TYPE_LABELS } from "@/types/iha";
import { IHA_CONFIG } from "@/config/iha";

interface OperationsCalendarProps {
  operations: Operation[];
  onSelect: (op: Operation) => void;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Pazartesi = 0
}

const MONTH_NAMES = IHA_CONFIG.monthNames;

const DAY_NAMES = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export function OperationsCalendar({ operations, onSelect }: OperationsCalendarProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const opsByDate = useMemo(() => {
    const map: Record<string, Operation[]> = {};
    for (const op of operations) {
      if (op.startDate) {
        const key = op.startDate;
        if (!map[key]) map[key] = [];
        map[key].push(op);
      }
    }
    return map;
  }, [operations]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          ←
        </button>
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          {MONTH_NAMES[month]} {year}
        </h3>
        <button onClick={nextMonth} className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-[var(--border)] rounded-lg overflow-hidden">
        {DAY_NAMES.map((day) => (
          <div key={day} className="bg-[var(--surface)] p-2 text-center text-xs font-medium text-[var(--muted-foreground)]">
            {day}
          </div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-[var(--background)] p-2 min-h-[4rem]" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayOps = opsByDate[dateStr] ?? [];
          const isToday =
            day === now.getDate() &&
            month === now.getMonth() &&
            year === now.getFullYear();

          return (
            <div
              key={day}
              className={`bg-[var(--background)] p-1.5 min-h-[4rem] ${isToday ? "ring-1 ring-[var(--accent)]" : ""}`}
            >
              <span className={`text-xs ${isToday ? "text-[var(--accent)] font-bold" : "text-[var(--muted-foreground)]"}`}>
                {day}
              </span>
              <div className="space-y-0.5 mt-0.5">
                {dayOps.slice(0, 2).map((op) => (
                  <button
                    key={op.id}
                    onClick={() => onSelect(op)}
                    className="w-full text-left text-xs px-1 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] truncate hover:bg-[var(--accent)]/20"
                  >
                    {op.title}
                  </button>
                ))}
                {dayOps.length > 2 && (
                  <span className="text-xs text-[var(--muted-foreground)]">
                    +{dayOps.length - 2}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
