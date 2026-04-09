"use client";

import React, { useMemo } from "react";
import type { Operation, OperationStatus } from "@/types/iha";
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
  const grouped = useMemo(() => COLUMNS.map((col) => ({
    col,
    ops: operations.filter((op) => col.statuses.includes(op.status)),
  })), [operations]);

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {grouped.map(({ col, ops }) => (
        <StatusColumn
          key={col.key}
          col={col}
          allColumns={COLUMNS}
          operations={ops}
          onSelect={onSelect}
          onStatusChange={onStatusChange}
          onDrop={(opId) => onStatusChange(opId, col.dropStatus)}
        />
      ))}
    </div>
  );
}

/* ─── Sütun ─── */
function StatusColumn({ col, allColumns, operations, onSelect, onStatusChange, onDrop }: {
  col: typeof COLUMNS[number];
  allColumns: typeof COLUMNS;
  operations: Operation[];
  onSelect: (op: Operation) => void;
  onStatusChange: (opId: string, status: OperationStatus) => void;
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

  // Mobil: bu sütun dışındaki hedefler
  const moveTargets = allColumns.filter((c) => c.key !== col.key);

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
          {col.icon} <span className="hidden sm:inline">{col.label}</span>
          <span className="sm:hidden">{col.label.slice(0, 3)}</span>
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
          <StatusItem
            key={op.id}
            op={op}
            onSelect={onSelect}
            moveTargets={moveTargets}
            onStatusChange={onStatusChange}
          />
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
function StatusItem({ op, onSelect, moveTargets, onStatusChange }: {
  op: Operation;
  onSelect: (op: Operation) => void;
  moveTargets: readonly { key: string; label: string; icon: string; dropStatus: OperationStatus }[];
  onStatusChange: (opId: string, status: OperationStatus) => void;
}) {
  const [showMenu, setShowMenu] = React.useState(false);
  const isIptal = op.status === "iptal";
  const isTeslim = op.status === "teslim";

  return (
    <div className="relative">
      <div className="flex items-center gap-0.5">
        <button
          draggable
          onDragStart={(e) => { e.dataTransfer.setData("text/plain", op.id); e.dataTransfer.effectAllowed = "move"; }}
          onClick={() => onSelect(op)}
          className={`flex-1 flex items-center gap-1.5 px-1.5 py-1 rounded-md text-left transition-colors cursor-grab active:cursor-grabbing hover:bg-[var(--surface-hover)] group min-w-0 ${
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

        {/* Mobil: hızlı taşıma butonu (touch cihazlar için) */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="sm:hidden shrink-0 w-5 h-5 flex items-center justify-center text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded transition-colors"
          title="Taşı"
        >
          ⋮
        </button>
      </div>

      {/* Mobil: hedef sütun menüsü */}
      {showMenu && (
        <div className="absolute right-0 top-full z-20 mt-0.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg py-1 min-w-[100px]">
          {moveTargets.map((target) => (
            <button
              key={target.key}
              onClick={() => { onStatusChange(op.id, target.dropStatus); setShowMenu(false); }}
              className="w-full text-left px-3 py-1.5 text-[11px] text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              {target.icon} {target.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
