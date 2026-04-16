"use client";

import React, { useMemo } from "react";
import type { Operation, OperationStatus, VehicleEvent, WeatherDaily } from "@/types/iha";
import { OPERATION_TYPE_LABELS, VEHICLE_EVENT_TYPE_ICONS } from "@/types/iha";
import { statusColors, statusBgColors, typeColors, typeBgColors, mapColors } from "@/config/tokens";
import { getHoliday, getHolidayBgColor, type Holiday } from "@/config/holidays";
import { CalendarWeatherBadge } from "../weather/CalendarWeatherBadge";
import { CalendarHolidayBadge } from "./CalendarHolidayBadge";
import { getDailySuitabilityFromWind } from "../weather/weatherUtils";
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
  vehicleEventsByDate: Map<string, VehicleEvent[]>;
  weatherByDate?: Map<string, WeatherDaily>;
  viewMonth: number;
  viewYear: number;
  today: Date;
  todayStr: string;
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
  onDateChange?: (opId: string, newDate: string) => void;
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
  vehicleEventsByDate,
  weatherByDate,
  viewMonth,
  viewYear,
  today,
  todayStr,
  selectedDate,
  onDateSelect,
  onDateChange,
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
              vehicleEvents={vehicleEventsByDate.get(dateStr) ?? []}
              weather={weatherByDate?.get(dateStr)}
              isToday={dateStr === todayStr}
              isSelected={dateStr === selectedDate}
              isWeekend={(startOffset + i) % 7 >= 5}
              onSelect={() => onDateSelect(dateStr === selectedDate ? null : dateStr)}
              onDateChange={onDateChange}
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
    <div className="grid grid-cols-7 text-center border-b border-[var(--border-strong)]">
      {DAYS_SHORT.map((d, i) => (
        <div
          key={d}
          className={`py-2 text-xs font-semibold ${i >= 5 ? "text-[var(--feedback-error)]/70" : "text-[var(--muted-foreground)]"}`}
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
          className="min-h-[3.5rem] sm:min-h-[5.5rem] p-1 sm:p-1.5 border-b border-r border-[var(--border-strong)] bg-[var(--background)]/30"
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
          className="min-h-[3.5rem] sm:min-h-[5.5rem] p-1 sm:p-1.5 border-b border-r border-[var(--border-strong)] bg-[var(--background)]/30"
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
  vehicleEvents,
  weather,
  isToday,
  isSelected,
  isWeekend,
  onSelect,
  onDateChange,
}: {
  day: number;
  dateStr: string;
  dayOps: Operation[];
  multiDays: MultiDayInfo[];
  vehicleEvents: VehicleEvent[];
  weather?: WeatherDaily;
  isToday: boolean;
  isSelected: boolean;
  isWeekend: boolean;
  onSelect: () => void;
  onDateChange?: (opId: string, newDate: string) => void;
}) {
  const hasOps = dayOps.length > 0;
  const hasVehicleEvents = vehicleEvents.length > 0;
  const hasAny = hasOps || hasVehicleEvents;
  const dominant = hasOps ? dominantStatus(dayOps) : null;

  // Hava uygunluk — çakışma kontrolü için
  const weatherRisky = weather
    ? getDailySuitabilityFromWind(weather.windMax, weather.precipitationSum, weather.weatherCode, weather.gustMax) !== "uygun"
    : false;

  // Resmi tatil kontrolü
  const holiday: Holiday | null = getHoliday(dateStr);

  const handleDragOver = (e: React.DragEvent) => {
    if (!onDateChange) return;
    e.preventDefault();
    e.currentTarget.classList.add("ring-2", "ring-inset", "ring-[var(--accent)]");
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("ring-2", "ring-inset", "ring-[var(--accent)]");
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("ring-2", "ring-inset", "ring-[var(--accent)]");
    const opId = e.dataTransfer.getData("text/plain");
    if (opId && onDateChange) onDateChange(opId, dateStr);
  };

  return (
    <div
      onClick={onSelect}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      className={`min-h-[3.5rem] sm:min-h-[5.5rem] p-1 sm:p-1.5 border-b border-r border-[var(--border-strong)] text-left transition-all relative cursor-pointer ${
        isSelected
          ? "bg-[var(--accent)]/12 ring-2 ring-inset ring-[var(--accent)]/60"
          : isToday
          ? "bg-[var(--accent)]/8"
          : hasAny
          ? "hover:bg-[var(--surface-hover)]"
          : isWeekend
          ? "bg-[var(--background)]/40 hover:bg-[var(--surface-hover)]/50"
          : "hover:bg-[var(--surface-hover)]/50"
      }`}
      style={{
        ...(holiday && !isSelected && !isToday
          ? { backgroundColor: getHolidayBgColor(holiday) }
          : undefined),
        ...(hasOps && !isSelected
          ? { borderLeft: `3px solid ${statusColors[dominant!]}` }
          : hasVehicleEvents && !isSelected
          ? { borderLeft: "3px solid var(--status-planlama)" }
          : undefined),
      }}
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
              hasAny
                ? "text-base sm:text-xl font-bold text-[var(--foreground)]"
                : isWeekend
                ? "text-xs sm:text-sm text-[var(--feedback-error)]/60"
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
            style={{ backgroundColor: statusColors[dominant!], color: mapColors.contrastText }}
          >
            {dayOps.length}
          </span>
        )}
      </div>

      {/* Tatil bayrağı — sol alt köşe */}
      {holiday && (
        <div className="absolute bottom-0.5 left-0.5 sm:bottom-1 sm:left-1">
          <CalendarHolidayBadge holiday={holiday} hasOperations={hasOps} />
        </div>
      )}

      {/* Hava durumu emojisi — sağ alt köşe */}
      {weather && (
        <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1">
          <CalendarWeatherBadge day={weather} hasOperations={hasOps} />
        </div>
      )}

      {/* Mobil: renkli durum noktaları (max 3 dot + "+N" fazlası + hava uyarısı) */}
      <div className="flex gap-1 mt-1 sm:hidden flex-wrap">
        {hasOps && weatherRisky && (
          <span className="text-[10px] leading-none" title="Hava koşulları riskli!">⚠️</span>
        )}
        {dayOps.slice(0, 3).map((op) => (
          <span
            key={op.id}
            className="w-2.5 h-2.5 rounded-full shadow-sm"
            style={{ backgroundColor: typeColors[op.type] }}
            title={OPERATION_TYPE_LABELS[op.type]}
          />
        ))}
        {vehicleEvents.slice(0, 1).map((ev) => (
          <span key={ev.id} className="text-[10px] leading-none" title={ev.title}>
            {VEHICLE_EVENT_TYPE_ICONS[ev.eventType]}
          </span>
        ))}
        {(dayOps.length + vehicleEvents.length) > 3 && (
          <span className="text-[9px] font-bold text-[var(--muted-foreground)]">
            +{dayOps.length + vehicleEvents.length - 3}
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
              draggable={!!onDateChange}
              onDragStart={(e) => { e.dataTransfer.setData("text/plain", op.id); e.dataTransfer.effectAllowed = "move"; }}
              className={`rounded px-1 py-0.5 text-[11px] leading-tight truncate flex items-center gap-0.5 font-semibold ${onDateChange ? "cursor-grab active:cursor-grabbing" : ""}`}
              style={{
                backgroundColor: typeBgColors[op.type],
                color: typeColors[op.type],
                borderLeft: `2px solid ${weatherRisky ? "var(--feedback-error)" : statusColors[op.status]}`,
              }}
            >
              {weatherRisky && <span className="text-[10px] shrink-0" title="Hava koşulları riskli!">⚠️</span>}
              <span className="text-[10px]">{TYPE_ICONS[op.type]}</span>
              <span className="truncate">{op.title}</span>
            </div>
          ))}
        {dayOps.length > 2 && (
          <span className="text-[10px] text-[var(--muted-foreground)] px-1 font-semibold">
            +{dayOps.length - 2}
          </span>
        )}
        {/* Araç etkinlikleri */}
        {vehicleEvents.slice(0, 1).map((ev) => (
          <div
            key={ev.id}
            className={`rounded px-1 py-0.5 text-[10px] leading-tight truncate flex items-center gap-0.5 font-semibold ${
              ev.isCompleted ? "opacity-50 line-through" : ""
            }`}
            style={{ backgroundColor: "var(--status-planlama-bg)", color: "var(--status-planlama)" }}
          >
            <span className="text-[10px]">{VEHICLE_EVENT_TYPE_ICONS[ev.eventType]}</span>
            <span className="truncate">{ev.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
