"use client";

import React from "react";
import type { Operation, OperationStatus } from "@/types/iha";
import { OPERATION_TYPE_LABELS } from "@/types/iha";
import { statusColors, statusBgColors, typeColors } from "@/config/tokens";
import { TYPE_ICONS } from "./calendarConstants";

const COLUMNS = [
  { key: "yapilacak", label: "Yapılacak", icon: "📋", statuses: ["talep", "planlama"] as OperationStatus[], dropStatus: "talep" as OperationStatus },
  { key: "yapiliyor", label: "Yapılıyor", icon: "🔄", statuses: ["saha", "isleme", "kontrol"] as OperationStatus[], dropStatus: "saha" as OperationStatus },
  { key: "yapildi", label: "Yapıldı", icon: "✅", statuses: ["teslim", "iptal"] as OperationStatus[], dropStatus: "teslim" as OperationStatus },
] as const;

const DONE_LIMIT = 5;

interface StatusBoardProps {
  operations: Operation[];
  onSelect: (op: Operation) => void;
  onStatusChange: (opId: string, status: OperationStatus) => void;
}

export function StatusBoard({ operations, onSelect, onStatusChange }: StatusBoardProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {COLUMNS.map((col) => {
        const ops = operations.filter((op) => col.statuses.includes(op.status));
        return (
          <StatusColumn
            key={col.key}
            col={col}
            operations={ops}
            onSelect={onSelect}
            onDrop={(opId) => onStatusChange(opId, col.dropStatus)}
          />
        );
      })}
    </div>
  );
}

/* ─── Sütun ─── */
function StatusColumn({ col, operations, onSelect, onDrop }: {
  col: typeof COLUMNS[number];
  operations: Operation[];
  onSelect: (op: Operation) => void;
  onDrop: (opId: string) => void;
}) {
  const [dragOver, setDragOver] = React.useState(false);
  const isDone = col.key === "yapildi";
  const visible = isDone ? operations.slice(0, DONE_LIMIT) : operations;
  const extra = isDone ? operations.length - DONE_LIMIT : 0;

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const opId = e.dataTransfer.getData("text/plain");
    if (opId) onDrop(opId);
  };

  const accentStatus = col.statuses[0];

  return (
    <div
      className={`rounded-lg border bg-[var(--surface)] transition-colors ${
        dragOver ? "border-[var(--accent)]/50 bg-[var(--accent)]/5" : "border-[var(--border)]"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Başlık */}
      <div className="flex items-center justify-between px-2.5 sm:px-3 py-2 border-b border-[var(--border)]">
        <span className="text-[10px] sm:text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
          {col.icon} {col.label}
        </span>
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: statusBgColors[accentStatus], color: statusColors[accentStatus] }}
        >
          {operations.length}
        </span>
      </div>

      {/* Liste */}
      <div className="px-1.5 sm:px-2 py-1.5 space-y-0.5">
        {visible.length === 0 && (
          <p className="text-[10px] text-[var(--muted-foreground)]/50 text-center py-2">—</p>
        )}
        {visible.map((op) => (
          <StatusItem key={op.id} op={op} onSelect={onSelect} />
        ))}
        {extra > 0 && (
          <p className="text-[10px] text-[var(--muted-foreground)] text-center pt-1">
            +{extra} daha...
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Operasyon Satırı ─── */
function StatusItem({ op, onSelect }: { op: Operation; onSelect: (op: Operation) => void }) {
  const isIptal = op.status === "iptal";
  const isTeslim = op.status === "teslim";

  return (
    <button
      draggable
      onDragStart={(e) => { e.dataTransfer.setData("text/plain", op.id); e.dataTransfer.effectAllowed = "move"; }}
      onClick={() => onSelect(op)}
      className={`w-full flex items-center gap-1.5 px-1.5 py-1 rounded-md text-left transition-colors cursor-grab active:cursor-grabbing hover:bg-[var(--surface-hover)] group ${
        isIptal ? "opacity-45" : ""
      }`}
    >
      <span className="text-[10px] sm:text-xs shrink-0">{TYPE_ICONS[op.type]}</span>
      <span
        className={`text-[11px] sm:text-xs truncate flex-1 group-hover:text-[var(--accent)] transition-colors ${
          isIptal ? "line-through text-[var(--muted-foreground)]" : "text-[var(--foreground)]"
        }`}
        style={{ borderLeft: `2px solid ${typeColors[op.type]}`, paddingLeft: "6px" }}
      >
        {op.title}
      </span>
      {isTeslim && <span className="text-[9px] text-[var(--status-teslim)] shrink-0">✓</span>}
      {isIptal && <span className="text-[9px] text-[var(--status-iptal)] shrink-0">✕</span>}
    </button>
  );
}
