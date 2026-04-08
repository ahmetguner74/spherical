"use client";

import React, { useMemo } from "react";
import type { Operation, VehicleEvent } from "@/types/iha";
import { OPERATION_STATUS_LABELS, OPERATION_TYPE_LABELS, VEHICLE_EVENT_TYPE_ICONS, VEHICLE_EVENT_TYPE_LABELS } from "@/types/iha";
import { statusColors, statusBgColors } from "@/config/tokens";
import { DAYS_SHORT, TYPE_ICONS, dateToStr } from "./calendarConstants";

interface WeeklyCalendarProps {
  operations: Operation[];
  opsByDate: Map<string, Operation[]>;
  vehicleEventsByDate: Map<string, VehicleEvent[]>;
  weekStart: Date;
  today: Date;
  todayStr: string;
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
  onSelect: (op: Operation) => void;
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
  onNewOperation,
}: WeeklyCalendarProps) {
  /* 7 gün oluştur */
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
  }, [weekStart]);

  /* Hafta toplam (unique operasyon) */
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
      {weekTotal > 0 && <WeekSummary total={weekTotal} />}
      <WeekDayHeaders
        weekDays={weekDays}
        opsByDate={opsByDate}
        todayStr={todayStr}
        selectedDate={selectedDate}
        onDateSelect={onDateSelect}
      />
      <WeekGrid
        weekDays={weekDays}
        opsByDate={opsByDate}
        vehicleEventsByDate={vehicleEventsByDate}
        todayStr={todayStr}
        selectedDate={selectedDate}
        onSelect={onSelect}
        onNewOperation={onNewOperation}
      />
    </>
  );
}

/* ─── Hafta Özeti ─── */
function WeekSummary({ total }: { total: number }) {
  return (
    <div className="px-4 py-2.5 border-b border-[var(--border)] bg-[var(--background)]/50 text-[11px]">
      <span className="font-bold text-[var(--foreground)] text-xs">Bu hafta: {total} operasyon</span>
    </div>
  );
}

/* ─── Gün Başlıkları ─── */
function WeekDayHeaders({
  weekDays,
  opsByDate,
  todayStr,
  selectedDate,
  onDateSelect,
}: {
  weekDays: Date[];
  opsByDate: Map<string, Operation[]>;
  todayStr: string;
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
}) {
  return (
    <div className="grid grid-cols-7 border-b border-[var(--border)]">
      {weekDays.map((day, i) => {
        const ds = dateToStr(day);
        const isToday = ds === todayStr;
        const isWeekend = i >= 5;
        const isSelected = ds === selectedDate;
        const dayOps = opsByDate.get(ds) ?? [];
        const hasOps = dayOps.length > 0;

        return (
          <button
            key={ds}
            onClick={() => onDateSelect(isSelected ? null : ds)}
            className={`py-2.5 sm:py-3 px-1 text-center border-r last:border-r-0 border-[var(--border)] transition-colors ${
              isSelected
                ? "bg-[var(--accent)]/12"
                : isToday
                ? "bg-[var(--accent)]/8"
                : ""
            }`}
          >
            <div
              className={`text-[10px] sm:text-xs font-semibold tracking-wide ${
                isWeekend ? "text-red-400/70" : "text-[var(--muted-foreground)]"
              }`}
            >
              <span className="sm:hidden">{DAYS_SHORT[i][0]}</span>
              <span className="hidden sm:inline">{DAYS_SHORT[i]}</span>
            </div>
            {isToday ? (
              <span className="inline-flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[var(--accent)] text-white text-base sm:text-xl font-bold mt-1">
                {day.getDate()}
              </span>
            ) : (
              <span
                className={`text-xl sm:text-2xl font-bold mt-1 block ${
                  hasOps
                    ? "text-[var(--foreground)]"
                    : isWeekend
                    ? "text-red-400/50"
                    : "text-[var(--muted-foreground)]/40"
                }`}
              >
                {day.getDate()}
              </span>
            )}
            {hasOps && (
              <span className="text-[10px] font-bold text-[var(--accent)] mt-0.5 block">
                {dayOps.length} op.
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Operasyon Grid ─── */
function WeekGrid({
  weekDays,
  opsByDate,
  vehicleEventsByDate,
  todayStr,
  selectedDate,
  onSelect,
  onNewOperation,
}: {
  weekDays: Date[];
  opsByDate: Map<string, Operation[]>;
  vehicleEventsByDate: Map<string, VehicleEvent[]>;
  todayStr: string;
  selectedDate: string | null;
  onSelect: (op: Operation) => void;
  onNewOperation?: (date?: string) => void;
}) {
  return (
    <div className="grid grid-cols-7 min-h-[200px] sm:min-h-[320px]">
      {weekDays.map((day, i) => {
        const ds = dateToStr(day);
        const dayOps = opsByDate.get(ds) ?? [];
        const dayVehicleEvents = vehicleEventsByDate.get(ds) ?? [];
        const isToday = ds === todayStr;
        const isSelected = ds === selectedDate;
        const isWeekend = i >= 5;
        const isEmpty = dayOps.length === 0 && dayVehicleEvents.length === 0;

        return (
          <div
            key={ds}
            className={`border-r last:border-r-0 border-[var(--border)] p-0.5 sm:p-1.5 space-y-1 ${
              isSelected
                ? "bg-[var(--accent)]/8"
                : isToday
                ? "bg-[var(--accent)]/5"
                : isWeekend
                ? "bg-[var(--background)]/40"
                : ""
            }`}
          >
            {dayOps.map((op) => (
              <WeekOpCard key={`${op.id}-${ds}`} op={op} dateStr={ds} onSelect={onSelect} />
            ))}
            {dayVehicleEvents.map((ev) => (
              <WeekVehicleCard key={ev.id} event={ev} />
            ))}
            {isEmpty && onNewOperation && (
              <div className="h-full min-h-[60px] flex items-center justify-center">
                <button
                  onClick={() => onNewOperation(ds)}
                  className="text-[var(--muted-foreground)]/20 text-2xl hover:text-[var(--accent)] transition-colors rounded-lg w-8 h-8 flex items-center justify-center hover:bg-[var(--accent)]/10"
                >
                  +
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Haftalık Operasyon Kartı ─── */
function WeekOpCard({
  op,
  dateStr,
  onSelect,
}: {
  op: Operation;
  dateStr: string;
  onSelect: (op: Operation) => void;
}) {
  const isMultiDay =
    op.startDate?.slice(0, 10) !== (op.endDate?.slice(0, 10) ?? op.startDate?.slice(0, 10));
  const isStart = op.startDate?.slice(0, 10) === dateStr;

  return (
    <button
      onClick={(e: React.MouseEvent) => { e.stopPropagation(); onSelect(op); }}
      className="w-full text-left rounded-md p-1 sm:p-2 transition-all hover:ring-1 hover:ring-[var(--accent)]/40 hover:shadow-sm"
      style={{
        backgroundColor: statusBgColors[op.status],
        borderLeft: `3px solid ${statusColors[op.status]}`,
      }}
    >
      <div className="flex items-center gap-0.5">
        <span className="text-xs sm:text-sm shrink-0">{TYPE_ICONS[op.type]}</span>
        <span
          className="text-[10px] sm:text-xs font-semibold truncate"
          style={{ color: statusColors[op.status] }}
        >
          {op.title}
        </span>
      </div>
      {/* Masaüstü detaylar */}
      <div className="hidden sm:block mt-1 space-y-0.5">
        <span
          className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full inline-block"
          style={{ backgroundColor: statusBgColors[op.status], color: statusColors[op.status] }}
        >
          {OPERATION_STATUS_LABELS[op.status]}
        </span>
        {op.requester && (
          <p className="text-[10px] text-[var(--muted-foreground)] truncate">{op.requester}</p>
        )}
        {isMultiDay && (
          <p className="text-[9px] text-[var(--muted-foreground)] font-medium">
            {isStart ? "Başlangıç" : "Devam"}
          </p>
        )}
      </div>
    </button>
  );
}

/* ─── Haftalık Araç Etkinlik Kartı ─── */
function WeekVehicleCard({ event }: { event: VehicleEvent }) {
  return (
    <div
      className={`w-full text-left rounded-md p-1 sm:p-2 ${event.isCompleted ? "opacity-50" : ""}`}
      style={{
        backgroundColor: "var(--status-planlama-bg)",
        borderLeft: "3px solid var(--status-planlama)",
      }}
    >
      <div className="flex items-center gap-0.5">
        <span className="text-xs sm:text-sm shrink-0">{VEHICLE_EVENT_TYPE_ICONS[event.eventType]}</span>
        <span className="text-[10px] sm:text-xs font-semibold truncate" style={{ color: "var(--status-planlama)" }}>
          {event.title}
        </span>
      </div>
      <div className="hidden sm:block mt-0.5">
        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full inline-block" style={{ color: "var(--status-planlama)" }}>
          {VEHICLE_EVENT_TYPE_LABELS[event.eventType]}
        </span>
        {event.equipmentName && (
          <p className="text-[10px] text-[var(--muted-foreground)] truncate">{event.equipmentName}</p>
        )}
      </div>
    </div>
  );
}
