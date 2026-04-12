"use client";

import React, { useMemo, useState, useCallback } from "react";
import type { Operation, VehicleEvent } from "@/types/iha";
import { OPERATION_STATUS_LABELS, OPERATION_TYPE_LABELS, VEHICLE_EVENT_TYPE_ICONS } from "@/types/iha";
import { statusColors, typeColors, typeBgColors } from "@/config/tokens";
import { DAYS_SHORT, TYPE_ICONS, dateToStr } from "./calendarConstants";

/* ─── Sabitler ─── */
const HOUR_START = 7;
const HOUR_END = 19;
const HOUR_HEIGHT = 32;
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
const DEFAULT_TIME = "08:00";

/** "08:30" → 8.5 */
function timeToHour(time?: string): number {
  if (!time) return 8;
  const [h, m] = time.split(":").map(Number);
  return (h ?? 8) + (m ?? 0) / 60;
}

/** Saat sayısını "HH:MM" formatına çevir */
function hourToStr(h: number): string {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/* ─── Overlap Layout Algoritması ─── */
interface LayoutSlot {
  op: Operation;
  top: number;
  height: number;
  col: number;
  totalCols: number;
}

function layoutDayOps(ops: Operation[]): LayoutSlot[] {
  if (ops.length === 0) return [];

  const items = ops.map((op) => {
    const startH = timeToHour(op.startTime);
    const endH = op.endTime ? timeToHour(op.endTime) : startH + 1;
    return { op, startH, endH };
  }).sort((a, b) => a.startH - b.startH || a.endH - b.endH);

  // Her item'ı bir sütuna yerleştir (greedy)
  const columns: number[][] = []; // her sütun: item index'leri
  const colOf: number[] = [];

  for (let i = 0; i < items.length; i++) {
    let placed = false;
    for (let c = 0; c < columns.length; c++) {
      const lastIdx = columns[c][columns[c].length - 1];
      if (items[lastIdx].endH <= items[i].startH) {
        columns[c].push(i);
        colOf[i] = c;
        placed = true;
        break;
      }
    }
    if (!placed) {
      colOf[i] = columns.length;
      columns.push([i]);
    }
  }

  // Her overlap grubundaki toplam sütun sayısını bul
  // Basit yaklaşım: tüm gün için aynı totalCols kullan
  const totalCols = columns.length;

  return items.map((item, i) => ({
    op: item.op,
    top: (item.startH - HOUR_START) * HOUR_HEIGHT,
    height: Math.max((item.endH - item.startH) * HOUR_HEIGHT, 24),
    col: colOf[i],
    totalCols,
  }));
}

/* ─── Ana Bileşen ─── */
interface WeeklyCalendarProps {
  opsByDate: Map<string, Operation[]>;
  vehicleEventsByDate: Map<string, VehicleEvent[]>;
  weekStart: Date;
  today: Date;
  todayStr: string;
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
  onSelect: (op: Operation) => void;
  onDateChange?: (opId: string, newDate: string, startTime?: string, endTime?: string) => void;
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
    <div className="grid grid-cols-[2.5rem_1fr] sm:grid-cols-[3rem_1fr] border-b border-[var(--border-strong)]">
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
              className={`py-2 sm:py-2.5 px-1 text-center border-r last:border-r-0 border-[var(--border-strong)] transition-colors ${
                isSelected ? "bg-[var(--accent)]/12" : isToday ? "bg-[var(--accent)]/8" : ""
              }`}
            >
              <div className={`text-[10px] sm:text-xs font-semibold ${isWeekend ? "text-[var(--feedback-error)]/70" : "text-[var(--muted-foreground)]"}`}>
                <span className="sm:hidden">{DAYS_SHORT[i][0]}</span>
                <span className="hidden sm:inline">{DAYS_SHORT[i]}</span>
              </div>
              {isToday ? (
                <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--accent)] text-white text-sm sm:text-lg font-bold mt-0.5">
                  {day.getDate()}
                </span>
              ) : (
                <span className={`text-lg sm:text-2xl font-bold mt-0.5 block ${
                  dayOps.length > 0 ? "text-[var(--foreground)]" : isWeekend ? "text-[var(--feedback-error)]/50" : "text-[var(--muted-foreground)]/40"
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
  onDateChange?: (opId: string, newDate: string, startTime?: string, endTime?: string) => void;
  onNewOperation?: (date?: string) => void;
}) {
  const totalHeight = HOURS.length * HOUR_HEIGHT;

  // Seçili zaman dilimi (tıkla → vurgula, tekrar tıkla → kaldır)
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; hour: number } | null>(null);

  const handleSlotClick = useCallback((ds: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const rawHour = HOUR_START + (y / HOUR_HEIGHT);
    const snapped = Math.floor(rawHour * 2) / 2; // 30dk snap
    const hour = Math.max(HOUR_START, Math.min(HOUR_END - 1, snapped));

    setSelectedSlot((prev) =>
      prev && prev.date === ds && prev.hour === hour ? null : { date: ds, hour }
    );
  }, []);

  const handleAddFromSlot = useCallback(() => {
    if (!selectedSlot || !onNewOperation) return;
    onNewOperation(selectedSlot.date);
    setSelectedSlot(null);
  }, [selectedSlot, onNewOperation]);

  // Drop'tan saati hesapla
  const calcDropHour = (e: React.DragEvent, colEl: HTMLElement): string => {
    const rect = colEl.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const rawHour = HOUR_START + (y / HOUR_HEIGHT);
    // 30 dakika snap
    const snapped = Math.round(rawHour * 2) / 2;
    const clamped = Math.max(HOUR_START, Math.min(HOUR_END - 1, snapped));
    return hourToStr(clamped);
  };

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
    if (!opId || !onDateChange) return;
    // Operasyonun süresini koru, yeni saate taşı
    const allOps = [...(opsByDate.values())].flat();
    const op = allOps.find((o) => o.id === opId);
    const newStart = calcDropHour(e, e.currentTarget as HTMLElement);
    const oldStartH = timeToHour(op?.startTime);
    const oldEndH = op?.endTime ? timeToHour(op.endTime) : oldStartH + 1;
    const duration = oldEndH - oldStartH;
    const newStartH = timeToHour(newStart);
    const newEnd = hourToStr(Math.min(newStartH + duration, HOUR_END));
    onDateChange(opId, ds, newStart, newEnd);
  };

  return (
    <div className="grid grid-cols-[2.5rem_1fr] sm:grid-cols-[3rem_1fr]">
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
        {/* Saat çizgileri */}
        {HOURS.map((hour, i) => (
          <div
            key={`line-${hour}`}
            className="absolute left-0 right-0 border-t border-[var(--border-strong)]/60"
            style={{ top: i * HOUR_HEIGHT }}
          />
        ))}

        {/* Gün sütunları */}
        {weekDays.map((day) => {
          const ds = dateToStr(day);
          const isToday = ds === todayStr;
          const dayOps = opsByDate.get(ds) ?? [];
          const dayVehicleEvents = vehicleEventsByDate.get(ds) ?? [];
          const layout = layoutDayOps(dayOps);

          return (
            <div
              key={ds}
              className={`relative border-r last:border-r-0 border-[var(--border-strong)]/60 cursor-pointer ${isToday ? "bg-[var(--accent)]/3" : ""}`}
              style={{ height: totalHeight }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, ds)}
              onClick={(e) => handleSlotClick(ds, e)}
            >
              {/* Seçili zaman dilimi vurgusu */}
              {selectedSlot?.date === ds && (
                <div
                  className="absolute left-0 right-0 bg-[var(--accent)]/15 border border-[var(--accent)]/40 border-dashed rounded-md z-[5] pointer-events-none"
                  style={{
                    top: (selectedSlot.hour - HOUR_START) * HOUR_HEIGHT,
                    height: HOUR_HEIGHT,
                  }}
                />
              )}

              {layout.map((slot) => (
                <TimeOpCard
                  key={slot.op.id}
                  op={slot.op}
                  top={slot.top}
                  height={slot.height}
                  col={slot.col}
                  totalCols={slot.totalCols}
                  onSelect={onSelect}
                  draggable={!!onDateChange}
                />
              ))}

              {/* Araç etkinlikleri — alt kısımda */}
              {dayVehicleEvents.map((ev, idx) => {
                const evTop = (17 - HOUR_START + idx * 0.5) * HOUR_HEIGHT;
                return (
                  <div
                    key={ev.id}
                    className={`absolute left-0.5 right-0.5 rounded-md p-1 text-[10px] truncate ${ev.isCompleted ? "opacity-40" : ""}`}
                    style={{
                      top: evTop,
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

        <CurrentTimeLine todayStr={todayStr} weekDays={weekDays} />
      </div>

      {/* Seçili slot → Operasyon Ekle çubuğu */}
      {selectedSlot && onNewOperation && (
        <div className="col-span-2 flex items-center justify-between gap-2 px-3 py-2 bg-[var(--accent)]/10 border-t border-[var(--accent)]/30">
          <span className="text-xs text-[var(--foreground)]">
            {(() => {
              const d = new Date(selectedSlot.date + "T00:00:00");
              return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")} ${DAYS_SHORT[d.getDay() === 0 ? 6 : d.getDay() - 1]} · ${hourToStr(selectedSlot.hour)}`;
            })()}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedSlot(null)}
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-2 py-1 min-h-[36px]"
            >
              İptal
            </button>
            <button
              onClick={handleAddFromSlot}
              className="text-xs font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-3 py-1 rounded-lg min-h-[36px] transition-colors"
            >
              + Operasyon Ekle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Saat Pozisyonlu Operasyon Kartı ─── */
function TimeOpCard({ op, top, height, col, totalCols, onSelect, draggable }: {
  op: Operation;
  top: number;
  height: number;
  col: number;
  totalCols: number;
  onSelect: (op: Operation) => void;
  draggable: boolean;
}) {
  const widthPct = totalCols > 1 ? `${(1 / totalCols) * 100}%` : "calc(100% - 4px)";
  const leftPct = totalCols > 1 ? `${(col / totalCols) * 100}%` : "2px";

  const startStr = op.startTime ?? DEFAULT_TIME;
  const endStr = op.endTime ?? hourToStr(timeToHour(op.startTime) + 1);

  return (
    <button
      onClick={(e: React.MouseEvent) => { e.stopPropagation(); onSelect(op); }}
      draggable={draggable}
      onDragStart={(e: React.DragEvent) => { e.dataTransfer.setData("text/plain", op.id); e.dataTransfer.effectAllowed = "move"; }}
      className={`absolute rounded-md p-1 sm:p-1.5 text-left overflow-hidden transition-all hover:ring-1 hover:ring-[var(--accent)]/40 hover:shadow-md z-10 ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
      style={{
        top,
        height,
        left: leftPct,
        width: widthPct,
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
            {startStr}–{endStr}
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
        <div className="w-2 h-2 rounded-full bg-[var(--feedback-error)] -ml-1" />
        <div className="flex-1 h-[2px] bg-[var(--feedback-error)]" />
      </div>
    </div>
  );
}
