"use client";

import React from "react";
import type { Operation, OperationStatus, VehicleEvent } from "@/types/iha";
import { OPERATION_STATUS_LABELS, OPERATION_TYPE_LABELS, VEHICLE_EVENT_TYPE_ICONS, VEHICLE_EVENT_TYPE_LABELS } from "@/types/iha";
import { statusColors, statusBgColors, typeColors } from "@/config/tokens";
import { TYPE_ICONS } from "./calendarConstants";

const STATUS_FLOW: OperationStatus[] = ["talep", "saha", "isleme", "teslim"];

interface CalendarDayDetailProps {
  selectedDate: string;
  operations: Operation[];
  vehicleEvents?: VehicleEvent[];
  onSelect: (op: Operation) => void;
  onStatusChange?: (opId: string, status: OperationStatus) => void;
  onNewOperation?: (date?: string) => void;
}

export function CalendarDayDetail({
  selectedDate,
  operations,
  vehicleEvents = [],
  onSelect,
  onStatusChange,
  onNewOperation,
}: CalendarDayDetailProps) {
  const dateLabel = new Date(selectedDate + "T00:00").toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    weekday: "long",
  });

  const totalCount = operations.length + vehicleEvents.length;

  return (
    <div className="border-t border-[var(--border)] p-3 space-y-2 bg-[var(--background)]">
      <DetailHeader label={dateLabel} count={totalCount} date={selectedDate} onNew={onNewOperation} />
      {totalCount === 0 ? (
        <DetailEmpty date={selectedDate} onNew={onNewOperation} />
      ) : (
        <>
          {operations.map((op) => (
            <DetailCard key={op.id} op={op} onSelect={onSelect} onStatusChange={onStatusChange} />
          ))}
          {vehicleEvents.length > 0 && operations.length > 0 && (
            <div className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider pt-1">Araç Etkinlikleri</div>
          )}
          {vehicleEvents.map((ev) => <VehicleEventDetailCard key={ev.id} event={ev} />)}
        </>
      )}
    </div>
  );
}

/* ─── Alt bileşenler ─── */

function DetailHeader({ label, count, date, onNew }: {
  label: string; count: number; date: string; onNew?: (d?: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <h4 className="text-xs font-semibold text-[var(--muted-foreground)]">
        {label}
        {count > 0 && <span className="ml-1">({count} operasyon)</span>}
      </h4>
      {onNew && (
        <button
          onClick={() => onNew(date)}
          className="text-[11px] px-2.5 py-1 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors font-medium"
        >
          + Operasyon Ekle
        </button>
      )}
    </div>
  );
}

function DetailEmpty({ date, onNew }: { date: string; onNew?: (d?: string) => void }) {
  return (
    <div className="text-center py-4">
      <p className="text-sm text-[var(--muted-foreground)]">Bu gün için operasyon yok</p>
      {onNew && (
        <button onClick={() => onNew(date)} className="mt-2 text-sm text-[var(--accent)] hover:underline">
          Yeni operasyon oluştur →
        </button>
      )}
    </div>
  );
}

function DetailCard({ op, onSelect, onStatusChange }: {
  op: Operation;
  onSelect: (op: Operation) => void;
  onStatusChange?: (opId: string, status: OperationStatus) => void;
}) {
  return (
    <div className="rounded-lg p-3 border border-[var(--border)] bg-[var(--surface)]">
      {/* Üst satır: tıklanabilir başlık */}
      <button
        onClick={() => onSelect(op)}
        className="w-full text-left hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base" title={OPERATION_TYPE_LABELS[op.type]}>{TYPE_ICONS[op.type]}</span>
            <span className="text-sm font-medium text-[var(--foreground)] truncate">{op.title}</span>
          </div>
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: typeColors[op.type] }}
            title={OPERATION_TYPE_LABELS[op.type]}
          />
        </div>
        <div className="flex items-center gap-2 mt-1">
          {op.requester && <p className="text-xs text-[var(--muted-foreground)]">{op.requester}</p>}
          {op.startDate && op.startDate !== op.endDate && op.endDate && (
            <span className="text-[10px] text-[var(--muted-foreground)] bg-[var(--surface-hover)] px-1.5 py-0.5 rounded">
              {new Date(op.startDate).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
              {" – "}
              {new Date(op.endDate).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
      </button>

      {/* Hızlı durum değiştirme butonları */}
      {onStatusChange && (
        <div className="flex gap-1 mt-2 pt-2 border-t border-[var(--border)]">
          {STATUS_FLOW.map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(op.id, s)}
              className={`flex-1 text-[10px] sm:text-[11px] py-1.5 rounded-md font-medium transition-all ${
                op.status === s
                  ? "ring-2 ring-offset-1 ring-offset-[var(--surface)]"
                  : "hover:opacity-80"
              }`}
              style={{
                backgroundColor: op.status === s ? statusColors[s] : statusBgColors[s],
                color: op.status === s ? "#fff" : statusColors[s],
                ...(op.status === s ? { "--tw-ring-color": statusColors[s] } as React.CSSProperties : {}),
              }}
            >
              {OPERATION_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function VehicleEventDetailCard({ event }: { event: VehicleEvent }) {
  return (
    <div
      className={`rounded-lg p-3 border border-[var(--border)] bg-[var(--surface)] ${event.isCompleted ? "opacity-60" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base">{VEHICLE_EVENT_TYPE_ICONS[event.eventType]}</span>
          <span className={`text-sm font-medium truncate ${event.isCompleted ? "line-through text-[var(--muted-foreground)]" : "text-[var(--foreground)]"}`}>
            {event.title}
          </span>
        </div>
        <span
          className="text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap font-medium"
          style={{ backgroundColor: "var(--status-planlama-bg)", color: "var(--status-planlama)" }}
        >
          {VEHICLE_EVENT_TYPE_LABELS[event.eventType]}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-1 text-xs text-[var(--muted-foreground)]">
        {event.equipmentName && <span>{event.equipmentName}</span>}
        {event.description && <span>· {event.description}</span>}
        {event.isCompleted && <span className="text-[var(--accent)]">Tamamlandı</span>}
      </div>
    </div>
  );
}
