"use client";

import React, { useMemo } from "react";
import type { Operation, OperationStatus } from "@/types/iha";
import { typeColors } from "@/config/tokens";
import { OP_TYPE_ICONS, IconYapilacak, IconYapiliyor, IconYapildi, IconMoreVertical, IconCheck, IconXCircle } from "@/config/icons";
import type { LucideIcon } from "lucide-react";

const COLUMNS: readonly { key: string; label: string; Icon: LucideIcon; statuses: OperationStatus[]; dropStatus: OperationStatus; color: string; bg: string }[] = [
  { key: "yapilacak", label: "Yapılacak", Icon: IconYapilacak, statuses: ["talep", "planlama"], dropStatus: "talep", color: "#f97316", bg: "rgba(249, 115, 22, 0.12)" },
  { key: "yapiliyor", label: "Yapılıyor", Icon: IconYapiliyor, statuses: ["saha", "isleme", "kontrol"], dropStatus: "saha", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.12)" },
  { key: "yapildi", label: "Yapıldı", Icon: IconYapildi, statuses: ["teslim", "iptal"], dropStatus: "teslim", color: "#22c55e", bg: "rgba(34, 197, 94, 0.12)" },
];

const COLUMN_LIMIT = 5;

interface StatusBoardProps {
  operations: Operation[];
  onSelect: (op: Operation) => void;
  onStatusChange: (opId: string, status: OperationStatus) => void;
  /** Herhangi bir sütundaki "Tümünü gör" tıklandığında çağrılır (Operasyonlar sekmesine geçiş için) */
  onViewAll?: () => void;
}

export function StatusBoard({ operations, onSelect, onStatusChange, onViewAll }: StatusBoardProps) {
  // Mobil: aktif sütun seçimi (segmented control ile)
  const [activeCol, setActiveCol] = React.useState<string>("yapilacak");

  const grouped = useMemo(() => COLUMNS.map((col) => {
    let ops = operations.filter((op) => col.statuses.includes(op.status));
    // Yapıldı sütunu: son tamamlananlar üstte (updatedAt desc)
    if (col.key === "yapildi") {
      ops = [...ops].sort((a, b) => {
        const da = new Date(a.updatedAt).getTime();
        const db = new Date(b.updatedAt).getTime();
        return db - da;
      });
    }
    return { col, ops };
  }), [operations]);

  return (
    <div className="space-y-2">
      {/* Mobil: segmented control (üç durumu tab olarak) */}
      <div className="md:hidden flex gap-1.5">
        {grouped.map(({ col, ops }) => {
          const active = activeCol === col.key;
          return (
            <button
              key={col.key}
              type="button"
              onClick={() => setActiveCol(col.key)}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-colors border min-h-[44px]"
              style={{
                borderColor: active ? col.color : "var(--border)",
                backgroundColor: active ? col.bg : "var(--surface)",
                color: active ? col.color : "var(--muted-foreground)",
              }}
            >
              <col.Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{col.label}</span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                style={{
                  backgroundColor: active ? col.color : "var(--muted-foreground)",
                  color: "white",
                  opacity: active ? 1 : 0.6,
                }}
              >
                {ops.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid: mobilde tek sütun (aktif olan), masaüstünde 3 sütun */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
        {grouped.map(({ col, ops }) => (
          <div
            key={col.key}
            className={activeCol === col.key ? "" : "hidden md:block"}
          >
            <StatusColumn
              col={col}
              allColumns={COLUMNS}
              operations={ops}
              onSelect={onSelect}
              onStatusChange={onStatusChange}
              onDrop={(opId) => onStatusChange(opId, col.dropStatus)}
              onViewAll={onViewAll}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Sütun ─── */
function StatusColumn({ col, allColumns, operations, onSelect, onStatusChange, onDrop, onViewAll }: {
  col: typeof COLUMNS[number];
  allColumns: typeof COLUMNS;
  operations: Operation[];
  onSelect: (op: Operation) => void;
  onStatusChange: (opId: string, status: OperationStatus) => void;
  onDrop: (opId: string) => void;
  onViewAll?: () => void;
}) {
  const [dragOver, setDragOver] = React.useState(false);
  // Tüm sütunlarda max 5 kart — fazlası için "Tümünü gör (N)" butonu
  const visible = operations.slice(0, COLUMN_LIMIT);
  const extra = operations.length - COLUMN_LIMIT;

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const opId = e.dataTransfer.getData("text/plain");
    if (opId) onDrop(opId);
  };

  const moveTargets = allColumns.filter((c) => c.key !== col.key);

  return (
    <div
      className="rounded-lg border transition-colors"
      style={{
        borderColor: dragOver ? col.color : "var(--border)",
        backgroundColor: dragOver ? col.bg : "var(--surface)",
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className="hidden md:flex items-center justify-between px-2.5 sm:px-3 py-2 border-b"
        style={{ borderColor: "var(--border)", backgroundColor: col.bg }}
      >
        <span
          className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate"
          style={{ color: col.color }}
        >
          <col.Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span className="truncate">{col.label}</span>
        </span>
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
          style={{ backgroundColor: col.color, color: "white" }}
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
          onViewAll ? (
            <button
              type="button"
              onClick={onViewAll}
              className="w-full text-[11px] font-medium text-[var(--accent)] hover:underline text-center pt-1.5 pb-0.5 transition-colors"
            >
              Tümünü gör ({operations.length})
            </button>
          ) : (
            <p className="text-[10px] text-[var(--muted-foreground)] text-center pt-1">+{extra} daha...</p>
          )
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
          type="button"
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="sm:hidden shrink-0 w-5 h-5 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded transition-colors"
          title="Taşı"
          aria-label="Durumu değiştir"
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
