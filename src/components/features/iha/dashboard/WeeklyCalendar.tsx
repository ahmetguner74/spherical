"use client";

import React, { useMemo } from "react";
import type { Operation, VehicleEvent } from "@/types/iha";
import { OPERATION_STATUS_LABELS, OPERATION_TYPE_LABELS, VEHICLE_EVENT_TYPE_ICONS, VEHICLE_EVENT_TYPE_LABELS } from "@/types/iha";
import { statusColors, statusBgColors, typeColors, typeBgColors } from "@/config/tokens";
import { DAYS_SHORT, TYPE_ICONS, dateToStr } from "./calendarConstants";

/* ─── Sabitler ─── */
const HOUR_START = 7;
const HOUR_END = 19;
const HOUR_HEIGHT = 48; // px per hour
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
const DEFAULT_TIME = "08:00";

/** Saat string'ini saate çevir (ör: "08:30" → 8.5) */
function timeToHour(time?: string): number {
  if (!time) return 8;
  const [h, m] = time.split(":").map(Number);
  return (h ?? 8) + (m ?? 0) / 60;
}

interface WeeklyCalendarProps {
  opsByDate: Map<string, Operation[]>;
  vehicleEventsByDate: Map<string, VehicleEvent[]>;
  weekStart: Date;
  today: Date;
  todayStr: string;
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
  onSelect: (op: Operation) => void;
  onDateChange?: (opId: string, newDate: string) => void;
  onNewOperation?: (date?: string) => void;
}

export function WeeklyCalendar({
  opsByDate,
  vehicleEventsByDate,
  weekStart,
  todayStr,
  selectedDate,
  onDateSelect,
  onSelect,
  onDateChange,
  onNewOperation,
}: WeeklyCalendarProps) {
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const weekTotal = useMemo(() => {
    const seen = new Set<string>();
    weekDays.forEach((d: Date) => {
      const ops = opsByDate.get(dateToStr(d)) ?? [];
      ops.forEach((op) => seen.add(op.id));
    });
    return seen.size;
  }, [weekDays, opsByDate]);

  return (
    <>
      {weekTotal > 0 && (
        <div className="px-4 py-2.5 border-b border-[var(--border)] bg-[var(--background)]/50 text-[11px]">
          <span className="font-bold text-[var(--foreground)] text-xs">Bu hafta: {weekTotal} operasyon</span>
        </div>
      )}
      <WeekDayHeaders weekDays={weekDays} opsByDate={opsByDate} todayStr={todayStr} selectedDate={selectedDate} onDateSelect={onDateSelect} />
      <WeekTimeGrid
        weekDays={weekDays}
        opsByDate={opsByDate}
        vehicleEventsByDate={vehicleEventsByDate}
        todayStr={todayStr}
        onSelect={onSelect}
        onDateChange={onDateChange}
        onNewOperation={onNewOperation}
      />
    </>
  );
}

/* ─── Gün Başlıkları ─── */
function WeekDayHeaders({ weekDays, opsByDate, todayStr, selectedDate, onDateSelect }: {
  weekDays: Date[];
  opsByDate: Map<string, Operation[]>;
  todayStr: string;
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
}) {
  return (
    <div className="grid grid-cols-[3rem_1fr] border-b border-[var(--border)]">
      <div />
      <div className="grid grid-cols-7">
        {weekDays.map((day, i) => {
          const ds = dateToStr(day);
          const isToday = ds === todayStr;
          const isWeekend = i >= 5;
          const isSelected = ds === selectedDate;
          const dayOps = opsByDate.get(ds) ?? [];

          return (
            <button
              key={ds}
              onClick={() => onDateSelect(isSelected ? null : ds)}
              className={`py-2 sm:py-2.5 px-1 text-center border-r last:border-r-0 border-[var(--border)] transition-colors ${
                isSelected ? "bg-[var(--accent)]/12" : isToday ? "bg-[var(--accent)]/8" : ""
              }`}
            >
              <div className={`text-[10px] sm:text-xs font-semibold ${isWeekend ? "text-red-400/70" : "text-[var(--muted-foreground)]"}`}>
                <span className="sm:hidden">{DAYS_SHORT[i][0]}</span>
                <span className="hidden sm:inline">{DAYS_SHORT[i]}</span>
              </div>
              {isToday ? (
                <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--accent)] text-white text-sm sm:text-lg font-bold mt-0.5">
                  {day.getDate()}
                </span>
              ) : (
                <span className={`text-lg sm:text-2xl font-bold mt-0.5 block ${
                  dayOps.length > 0 ? "text-[var(--foreground)]" : isWeekend ? "text-red-400/50" : "text-[var(--muted-foreground)]/40"
                }`}>
                  {day.getDate()}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Saat Izgarası + Operasyonlar ─── */
function WeekTimeGrid({ weekDays, opsByDate, vehicleEventsByDate, todayStr, onSelect, onDateChange, onNewOperation }: {
  weekDays: Date[];
  opsByDate: Map<string, Operation[]>;
  vehicleEventsByDate: Map<string, VehicleEvent[]>;
  todayStr: string;
  onSelect: (op: Operation) => void;
  onDateChange?: (opId: string, newDate: string) => void;
  onNewOperation?: (date?: string) => void;
}) {
  const totalHeight = HOURS.length * HOUR_HEIGHT;

  /* DnD handlers */
  const handleDragOver = (e: React.DragEvent) => {
    if (!onDateChange) return;
    e.preventDefault();
    e.currentTarget.classList.add("bg-[var(--accent)]/10");
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("bg-[var(--accent)]/10");
  };
  const handleDrop = (e: React.DragEvent, ds: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-[var(--accent)]/10");
    const opId = e.dataTransfer.getData("text/plain");
    if (opId && onDateChange) onDateChange(opId, ds);
  };

  return (
    <div className="grid grid-cols-[3rem_1fr] overflow-auto" style={{ maxHeight: "500px" }}>
      {/* Sol: Saat etiketleri */}
      <div className="relative" style={{ height: totalHeight }}>
        {HOURS.map((hour, i) => (
          <div
            key={hour}
            className="absolute left-0 right-0 text-[10px] text-[var(--muted-foreground)]/60 text-right pr-2 font-mono"
            style={{ top: i * HOUR_HEIGHT - 6 }}
          >
            {String(hour).padStart(2, "0")}:00
          </div>
        ))}
      </div>

      {/* Sağ: 7 gün sütunları */}
      <div className="grid grid-cols-7 relative">
        {/* Saat çizgileri (arka plan) */}
        {HOURS.map((hour, i) => (
          <div
            key={`line-${hour}`}
            className="absolute left-0 right-0 border-t border-[var(--border)]/30"
            style={{ top: i * HOUR_HEIGHT }}
          />
        ))}

        {/* Gün sütunları */}
        {weekDays.map((day, colIdx) => {
          const ds = dateToStr(day);
          const isToday = ds === todayStr;
          const dayOps = opsByDate.get(ds) ?? [];
          const dayVehicleEvents = vehicleEventsByDate.get(ds) ?? [];

          return (
            <div
              key={ds}
              className={`relative border-r last:border-r-0 border-[var(--border)]/30 ${isToday ? "bg-[var(--accent)]/3" : ""}`}
              style={{ height: totalHeight }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, ds)}
              onClick={() => onNewOperation?.(ds)}
            >
              {/* Operasyonlar — saat pozisyonunda */}
              {dayOps.map((op) => {
                const startH = timeToHour(op.startTime);
                const endH = op.endTime ? timeToHour(op.endTime) : startH + 1;
                const top = (startH - HOUR_START) * HOUR_HEIGHT;
                const height = Math.max((endH - startH) * HOUR_HEIGHT, 24);

                return (
                  <TimeOpCard
                    key={`${op.id}-${ds}`}
                    op={op}
                    top={top}
                    height={height}
                    onSelect={onSelect}
                    draggable={!!onDateChange}
                  />
                );
              })}

              {/* Araç etkinlikleri — sabit pozisyon (17:00) */}
              {dayVehicleEvents.map((ev, idx) => {
                const top = (17 - HOUR_START + idx * 0.5) * HOUR_HEIGHT;
                return (
                  <div
                    key={ev.id}
                    className={`absolute left-0.5 right-0.5 rounded-md p-1 text-[10px] truncate ${ev.isCompleted ? "opacity-40" : ""}`}
                    style={{
                      top,
                      height: HOUR_HEIGHT * 0.4,
                      backgroundColor: "var(--status-planlama-bg)",
                      borderLeft: "2px solid var(--status-planlama)",
                      color: "var(--status-planlama)",
                    }}
                  >
                    {VEHICLE_EVENT_TYPE_ICONS[ev.eventType]} {ev.title}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Şu anki saat çizgisi */}
        <CurrentTimeLine todayStr={todayStr} weekDays={weekDays} />
      </div>
    </div>
  );
}

/* ─── Saat Pozisyonlu Operasyon Kartı ─── */
function TimeOpCard({ op, top, height, onSelect, draggable }: {
  op: Operation;
  top: number;
  height: number;
  onSelect: (op: Operation) => void;
  draggable: boolean;
}) {
  return (
    <button
      onClick={(e: React.MouseEvent) => { e.stopPropagation(); onSelect(op); }}
      draggable={draggable}
      onDragStart={(e: React.DragEvent) => { e.dataTransfer.setData("text/plain", op.id); e.dataTransfer.effectAllowed = "move"; }}
      className={`absolute left-0.5 right-0.5 rounded-md p-1 sm:p-1.5 text-left overflow-hidden transition-all hover:ring-1 hover:ring-[var(--accent)]/40 hover:shadow-md z-10 ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
      style={{
        top,
        height,
        backgroundColor: typeBgColors[op.type],
        borderLeft: `3px solid ${statusColors[op.status]}`,
      }}
    >
      <div className="flex items-center gap-0.5">
        <span className="text-[10px] sm:text-xs shrink-0">{TYPE_ICONS[op.type]}</span>
        <span className="text-[10px] sm:text-xs font-semibold truncate" style={{ color: typeColors[op.type] }}>
          {op.title}
        </span>
      </div>
      {height > 36 && (
        <div className="mt-0.5">
          <span className="text-[9px] font-medium" style={{ color: statusColors[op.status] }}>
            {op.startTime ?? DEFAULT_TIME}–{op.endTime ?? `${String(timeToHour(op.startTime) + 1).padStart(2, "0")}:00`}
          </span>
          <span className="text-[9px] ml-1 hidden sm:inline" style={{ color: statusColors[op.status] }}>
            {OPERATION_STATUS_LABELS[op.status]}
          </span>
        </div>
      )}
    </button>
  );
}

/* ─── Şu Anki Saat Çizgisi (kırmızı) ─── */
function CurrentTimeLine({ todayStr, weekDays }: { todayStr: string; weekDays: Date[] }) {
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  if (currentHour < HOUR_START || currentHour > HOUR_END) return null;

  const todayIndex = weekDays.findIndex((d) => dateToStr(d) === todayStr);
  if (todayIndex === -1) return null;

  const top = (currentHour - HOUR_START) * HOUR_HEIGHT;
  const leftPercent = (todayIndex / 7) * 100;
  const widthPercent = (1 / 7) * 100;

  return (
    <div className="absolute z-20 pointer-events-none" style={{ top, left: `${leftPercent}%`, width: `${widthPercent}%` }}>
      <div className="flex items-center">
        <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
        <div className="flex-1 h-[2px] bg-red-500" />
      </div>
    </div>
  );
}
