"use client";

import React, { useMemo } from "react";
import type { Operation, OperationStatus } from "@/types/iha";
import { statusColors, statusBgColors, typeColors } from "@/config/tokens";
import { OP_TYPE_ICONS, IconYapilacak, IconYapiliyor, IconYapildi, IconMoreVertical, IconCheck, IconXCircle } from "@/config/icons";
import type { LucideIcon } from "lucide-react";

const COLUMNS: readonly { key: string; label: string; Icon: LucideIcon; statuses: OperationStatus[]; dropStatus: OperationStatus }[] = [
  { key: "yapilacak", label: "Yapılacak", Icon: IconYapilacak, statuses: ["talep", "planlama"], dropStatus: "talep" },
  { key: "yapiliyor", label: "Yapılıyor", Icon: IconYapiliyor, statuses: ["saha", "isleme", "kontrol"], dropStatus: "saha" },
  { key: "yapildi", label: "Yapıldı", Icon: IconYapildi, statuses: ["teslim", "iptal"], dropStatus: "teslim" },
];

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
      <div className="flex items-center justify-between px-2.5 sm:px-3 py-2 border-b border-[var(--border)]">
        <span className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
          <col.Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">{col.label}</span>
          <span className="sm:hidden">{col.label.slice(0, 3)}</span>
        </span>
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: statusBgColors[accentStatus], color: statusColors[accentStatus] }}
        >
          {operations.length}
        </span>
      </div>

      <div className="px-1.5 sm:px-2 py-1.5 space-y-0.5">
        {visible.length === 0 && (
          <p className="text-[10px] text-[var(--muted-foreground)]/50 text-center py-2">—</p>
        )}
        {visible.map((op) => (
          <StatusItem key={op.id} op={op} onSelect={onSelect} moveTargets={moveTargets} onStatusChange={onStatusChange} />
        ))}
        {extra > 0 && (
          <p className="text-[10px] text-[var(--muted-foreground)] text-center pt-1">+{extra} daha...</p>
        )}
      </div>
    </div>
  );
}

/* ─── Operasyon Satırı ─── */
function StatusItem({ op, onSelect, moveTargets, onStatusChange }: {
  op: Operation;
  onSelect: (op: Operation) => void;
  moveTargets: typeof COLUMNS;
  onStatusChange: (opId: string, status: OperationStatus) => void;
}) {
  const [showMenu, setShowMenu] = React.useState(false);
  const isIptal = op.status === "iptal";
  const isTeslim = op.status === "teslim";
  const TypeIcon = OP_TYPE_ICONS[op.type];

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
          <TypeIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" style={{ color: typeColors[op.type] }} />
          <span
            className={`text-[11px] sm:text-xs truncate flex-1 group-hover:text-[var(--accent)] transition-colors ${
              isIptal ? "line-through text-[var(--muted-foreground)]" : "text-[var(--foreground)]"
            }`}
            style={{ borderLeft: `2px solid ${typeColors[op.type]}`, paddingLeft: "6px" }}
          >
            {op.title}
          </span>
          {isTeslim && <IconCheck className="w-3 h-3 shrink-0" style={{ color: "var(--status-teslim)" }} />}
          {isIptal && <IconXCircle className="w-3 h-3 shrink-0" style={{ color: "var(--status-iptal)" }} />}
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="sm:hidden shrink-0 w-5 h-5 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded transition-colors"
          title="Taşı"
        >
          <IconMoreVertical className="w-3 h-3" />
        </button>
      </div>

      {showMenu && (
        <div className="absolute right-0 top-full z-20 mt-0.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg py-1 min-w-[100px]">
          {moveTargets.map((target) => (
            <button
              key={target.key}
              onClick={() => { onStatusChange(op.id, target.dropStatus); setShowMenu(false); }}
              className="w-full flex items-center gap-1.5 text-left px-3 py-1.5 text-[11px] text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              <target.Icon className="w-3 h-3" /> {target.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
