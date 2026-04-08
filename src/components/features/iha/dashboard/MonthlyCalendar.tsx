"use client";

import { useMemo } from "react";
import type { Operation, OperationStatus } from "@/types/iha";
import { OPERATION_TYPE_LABELS } from "@/types/iha";
import { statusColors, statusBgColors } from "@/config/tokens";
import {
  DAYS_FULL,
  DAYS_SHORT,
  TYPE_ICONS,
  toDateStr,
  type MultiDayInfo,
} from "./calendarConstants";

interface MonthlyCalendarProps {
  operations: Operation[];
  opsByDate: Map<string, Operation[]>;
  multiDayByDate: Map<string, MultiDayInfo[]>;
  viewMonth: number;
  viewYear: number;
  today: Date;
  todayStr: string;
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
}

/** Baskın durum rengi */
function dominantStatus(ops: Operation[]): OperationStatus {
  const counts: Partial<Record<OperationStatus, number>> = {};
  ops.forEach((op) => { counts[op.status] = (counts[op.status] ?? 0) + 1; });
  let max = 0;
  let dom: OperationStatus = "talep";
  for (const [s, c] of Object.entries(counts)) {
    if (c > max) { max = c; dom = s as OperationStatus; }
  }
  return dom;
}

export function MonthlyCalendar({
  operations,
  opsByDate,
  multiDayByDate,
  viewMonth,
  viewYear,
  today,
  todayStr,
  selectedDate,
  onDateSelect,
}: MonthlyCalendarProps) {
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  const totalCells = startOffset + daysInMonth;
  const endOffset = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

  /* Ay özet istatistikleri */
  const monthStats = useMemo(() => {
    const stats = { total: 0, saha: 0, teslim: 0, talep: 0, isleme: 0 };
    const monthStart = toDateStr(viewYear, viewMonth, 1);
    const monthEnd = toDateStr(viewYear, viewMonth, daysInMonth);
    operations.forEach((op) => {
      if (!op.startDate) return;
      const start = op.startDate.slice(0, 10);
      if (start >= monthStart && start <= monthEnd) {
        stats.total++;
        if (op.status === "saha") stats.saha++;
        if (op.status === "teslim") stats.teslim++;
        if (op.status === "talep") stats.talep++;
        if (op.status === "isleme") stats.isleme++;
      }
    });
    return stats;
  }, [operations, viewMonth, viewYear, daysInMonth]);

  return (
    <>
      {monthStats.total > 0 && <MonthSummary stats={monthStats} />}
      <DayHeaders />
      <div className="grid grid-cols-7">
        <PrevMonthCells count={startOffset} prevMonthDays={prevMonthDays} />
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = toDateStr(viewYear, viewMonth, day);
          return (
            <MonthDayCell
              key={day}
              day={day}
              dateStr={dateStr}
              dayOps={opsByDate.get(dateStr) ?? []}
              multiDays={multiDayByDate.get(dateStr) ?? []}
              isToday={dateStr === todayStr}
              isSelected={dateStr === selectedDate}
              isWeekend={(startOffset + i) % 7 >= 5}
              onSelect={() => onDateSelect(dateStr === selectedDate ? null : dateStr)}
            />
          );
        })}
        <NextMonthCells count={endOffset} />
      </div>
    </>
  );
}

/* ─── Ay Özet Çubuğu ─── */
function MonthSummary({ stats }: {
  stats: { total: number; saha: number; teslim: number; talep: number; isleme: number };
}) {
  return (
    <div className="px-4 py-2.5 border-b border-[var(--border)] bg-[var(--background)]/50 flex items-center gap-3 flex-wrap text-[11px]">
      <span className="font-bold text-[var(--foreground)] text-xs">
        Bu ay: {stats.total} operasyon
      </span>
      {stats.saha > 0 && (
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: statusColors.saha }} />
          <span className="font-semibold">{stats.saha} saha</span>
        </span>
      )}
      {stats.isleme > 0 && (
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: statusColors.isleme }} />
          <span className="font-semibold">{stats.isleme} işleme</span>
        </span>
      )}
      {stats.teslim > 0 && (
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: statusColors.teslim }} />
          <span className="font-semibold">{stats.teslim} teslim</span>
        </span>
      )}
      {stats.talep > 0 && (
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: statusColors.talep }} />
          <span className="font-semibold">{stats.talep} talep</span>
        </span>
      )}
    </div>
  );
}

/* ─── Gün Başlıkları ─── */
function DayHeaders() {
  return (
    <div className="grid grid-cols-7 text-center border-b border-[var(--border)]">
      {DAYS_SHORT.map((d, i) => (
        <div
          key={d}
          className={`py-2 text-xs font-semibold ${i >= 5 ? "text-red-400/70" : "text-[var(--muted-foreground)]"}`}
        >
          <span className="sm:hidden">{d[0]}</span>
          <span className="hidden sm:inline md:hidden">{DAYS_SHORT[i]}</span>
          <span className="hidden md:inline">{DAYS_FULL[i]}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Önceki Ay Hücreleri ─── */
function PrevMonthCells({ count, prevMonthDays }: { count: number; prevMonthDays: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`prev-${i}`}
          className="min-h-[3.5rem] sm:min-h-[5.5rem] p-1 sm:p-1.5 border-b border-r border-[var(--border)] bg-[var(--background)]/30"
        >
          <span className="text-xs text-[var(--muted-foreground)]/25">{prevMonthDays - count + 1 + i}</span>
        </div>
      ))}
    </>
  );
}

/* ─── Sonraki Ay Hücreleri ─── */
function NextMonthCells({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`next-${i}`}
          className="min-h-[3.5rem] sm:min-h-[5.5rem] p-1 sm:p-1.5 border-b border-r border-[var(--border)] bg-[var(--background)]/30"
        >
          <span className="text-xs text-[var(--muted-foreground)]/25">{i + 1}</span>
        </div>
      ))}
    </>
  );
}

/* ─── Gün Hücresi (İyileştirilmiş) ─── */
function MonthDayCell({
  day,
  dateStr,
  dayOps,
  multiDays,
  isToday,
  isSelected,
  isWeekend,
  onSelect,
}: {
  day: number;
  dateStr: string;
  dayOps: Operation[];
  multiDays: MultiDayInfo[];
  isToday: boolean;
  isSelected: boolean;
  isWeekend: boolean;
  onSelect: () => void;
}) {
  const hasOps = dayOps.length > 0;
  const dominant = hasOps ? dominantStatus(dayOps) : null;

  return (
    <button
      onClick={onSelect}
      className={`min-h-[3.5rem] sm:min-h-[5.5rem] p-1 sm:p-1.5 border-b border-r border-[var(--border)] text-left transition-all relative ${
        isSelected
          ? "bg-[var(--accent)]/12 ring-2 ring-inset ring-[var(--accent)]/60"
          : isToday
          ? "bg-[var(--accent)]/8"
          : hasOps
          ? "hover:bg-[var(--surface-hover)]"
          : isWeekend
          ? "bg-[var(--background)]/40 hover:bg-[var(--surface-hover)]/50"
          : "hover:bg-[var(--surface-hover)]/50"
      }`}
      style={
        hasOps && !isSelected
          ? { borderLeft: `3px solid ${statusColors[dominant!]}` }
          : undefined
      }
    >
      {/* Gün numarası + operasyon sayısı */}
      <div className="flex items-start justify-between">
        {isToday ? (
          <span className="inline-flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[var(--accent)] text-white text-sm sm:text-base font-bold">
            {day}
          </span>
        ) : (
          <span
            className={`block leading-none ${
              hasOps
                ? "text-base sm:text-xl font-bold text-[var(--foreground)]"
                : isWeekend
                ? "text-xs sm:text-sm text-red-400/60"
                : "text-xs sm:text-sm text-[var(--muted-foreground)]"
            }`}
          >
            {day}
          </span>
        )}

        {/* Operasyon sayısı badge */}
        {hasOps && (
          <span
            className="text-[10px] sm:text-xs font-bold min-w-[18px] sm:min-w-[22px] h-[18px] sm:h-[22px] flex items-center justify-center rounded-full shadow-sm"
            style={{ backgroundColor: statusColors[dominant!], color: "#fff" }}
          >
            {dayOps.length}
          </span>
        )}
      </div>

      {/* Mobil: renkli durum noktaları */}
      <div className="flex gap-1 mt-1 sm:hidden flex-wrap">
        {dayOps.slice(0, 4).map((op) => (
          <span
            key={op.id}
            className="w-2.5 h-2.5 rounded-full shadow-sm"
            style={{ backgroundColor: statusColors[op.status] }}
            title={OPERATION_TYPE_LABELS[op.type]}
          />
        ))}
        {dayOps.length > 4 && (
          <span className="text-[9px] font-bold text-[var(--muted-foreground)]">
            +{dayOps.length - 4}
          </span>
        )}
      </div>

      {/* Masaüstü: operasyon etiketleri */}
      <div className="hidden sm:block space-y-0.5 mt-1">
        {multiDays.slice(0, 1).map((md) => (
          <div
            key={`md-${md.op.id}`}
            className={`h-[20px] flex items-center text-[10px] leading-tight truncate font-semibold ${
              md.isStart
                ? "rounded-l pl-1 -mr-1.5"
                : md.isEnd
                ? "rounded-r pr-1 -ml-1.5"
                : "-mx-1.5 px-1"
            }`}
            style={{
              backgroundColor: statusBgColors[md.op.status],
              color: statusColors[md.op.status],
              borderLeft: md.isStart ? `3px solid ${statusColors[md.op.status]}` : "none",
            }}
          >
            {md.isStart && (
              <span className="truncate">{TYPE_ICONS[md.op.type]} {md.op.title}</span>
            )}
          </div>
        ))}
        {dayOps
          .filter((op) => {
            const start = op.startDate?.slice(0, 10);
            const end = op.endDate?.slice(0, 10) ?? start;
            return start === end;
          })
          .slice(0, multiDays.length > 0 ? 1 : 2)
          .map((op) => (
            <div
              key={op.id}
              className="rounded px-1 py-0.5 text-[11px] leading-tight truncate flex items-center gap-0.5 font-semibold"
              style={{ backgroundColor: statusBgColors[op.status], color: statusColors[op.status] }}
            >
              <span className="text-[10px]">{TYPE_ICONS[op.type]}</span>
              <span className="truncate">{op.title}</span>
            </div>
          ))}
        {dayOps.length > 2 && (
          <span className="text-[10px] text-[var(--muted-foreground)] px-1 font-semibold">
            +{dayOps.length - 2}
          </span>
        )}
      </div>
    </button>
  );
}
