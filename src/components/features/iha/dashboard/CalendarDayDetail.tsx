"use client";

import type { Operation } from "@/types/iha";
import { OPERATION_STATUS_LABELS, OPERATION_TYPE_LABELS } from "@/types/iha";
import { statusColors, statusBgColors } from "@/config/tokens";
import { TYPE_ICONS } from "./calendarConstants";

interface CalendarDayDetailProps {
  selectedDate: string;
  operations: Operation[];
  onSelect: (op: Operation) => void;
  onNewOperation?: (date?: string) => void;
}

export function CalendarDayDetail({
  selectedDate,
  operations,
  onSelect,
  onNewOperation,
}: CalendarDayDetailProps) {
  const dateLabel = new Date(selectedDate + "T00:00").toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    weekday: "long",
  });

  return (
    <div className="border-t border-[var(--border)] p-3 space-y-2 bg-[var(--background)]">
      <DetailHeader label={dateLabel} count={operations.length} date={selectedDate} onNew={onNewOperation} />
      {operations.length === 0 ? (
        <DetailEmpty date={selectedDate} onNew={onNewOperation} />
      ) : (
        operations.map((op) => <DetailCard key={op.id} op={op} onSelect={onSelect} />)
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

function DetailCard({ op, onSelect }: { op: Operation; onSelect: (op: Operation) => void }) {
  return (
    <button
      onClick={() => onSelect(op)}
      className="w-full text-left rounded-lg p-3 border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-hover)] transition-colors"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base" title={OPERATION_TYPE_LABELS[op.type]}>{TYPE_ICONS[op.type]}</span>
          <span className="text-sm font-medium text-[var(--foreground)] truncate">{op.title}</span>
        </div>
        <span
          className="text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap font-medium"
          style={{ backgroundColor: statusBgColors[op.status], color: statusColors[op.status] }}
        >
          {OPERATION_STATUS_LABELS[op.status]}
        </span>
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
  );
}
