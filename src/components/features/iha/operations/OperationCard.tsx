"use client";

import type { Operation, OperationStatus, FlightPermission } from "@/types/iha";
import {
  formatOperationType,
  OPERATION_STATUS_LABELS, OPERATION_STATUS_VARIANTS,
} from "@/types/iha";
import { Badge } from "@/components/ui/Badge";
import { statusColors, statusBgColors } from "@/config/tokens";
import { PermissionBadge } from "../shared/PermissionBadge";

const STATUS_FLOW: OperationStatus[] = ["talep", "planlama", "saha", "isleme", "kontrol", "teslim"];

const MONTHS_SHORT = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
function formatDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[(m ?? 1) - 1]} ${y}`;
}

interface OperationCardProps {
  operation: Operation;
  permissions?: FlightPermission[];
  onSelect: (op: Operation) => void;
  onStatusChange: (id: string, status: OperationStatus) => void;
  /** Toplu seçim modu */
  selectMode?: boolean;
  selected?: boolean;
  onToggle?: () => void;
}

export function OperationCard({ operation, permissions = [], onSelect, onStatusChange, selectMode, selected, onToggle }: OperationCardProps) {
  const currentIdx = STATUS_FLOW.indexOf(operation.status);
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1
    ? STATUS_FLOW[currentIdx + 1]
    : undefined;

  return (
    <div
      className={`rounded-lg border bg-[var(--surface)] p-4 space-y-3 active:bg-[var(--surface-hover)] transition-colors ${
        selected ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--border)]"
      }`}
      onClick={() => selectMode && onToggle ? onToggle() : onSelect(operation)}
    >
      <div className="flex items-start justify-between gap-2">
        {selectMode && (
          <input
            type="checkbox"
            checked={!!selected}
            onChange={() => onToggle?.()}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 mt-0.5 rounded accent-[var(--accent)] cursor-pointer shrink-0"
          />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[var(--foreground)] truncate">
            {operation.title}
          </h3>
          {operation.requester && (
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{operation.requester}</p>
          )}
        </div>
        <Badge variant={OPERATION_STATUS_VARIANTS[operation.status]}>
          {OPERATION_STATUS_LABELS[operation.status]}
        </Badge>
      </div>

      <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
        {formatOperationType(operation) !== operation.title && (
          <span>{formatOperationType(operation)}</span>
        )}
        {operation.location.ilce && (
          <>
            {formatOperationType(operation) !== operation.title && <span className="text-[var(--border)]">·</span>}
            <span>{operation.location.il}/{operation.location.ilce}</span>
          </>
        )}
      </div>

      {/* Tamamlanma çubuğu */}
      <div className="space-y-1">
        <div className="flex gap-0.5">
          {STATUS_FLOW.map((s, i) => (
            <div
              key={s}
              className="h-1 flex-1 rounded-full"
              style={{
                backgroundColor: i <= currentIdx ? statusColors[s] : "var(--border)",
              }}
            />
          ))}
        </div>
        {operation.completionPercent > 0 && (
          <span className="text-[10px] text-[var(--muted-foreground)]">%{operation.completionPercent}</span>
        )}
      </div>

      {/* İzin rozeti (İHA alt tipi içeren operasyonlar) */}
      {(operation.type === "iha" || operation.subTypes?.some((s) => ["ortofoto", "oblik", "panorama_360"].includes(s))) && (
        <div>
          <PermissionBadge op={operation} permissions={permissions} compact />
        </div>
      )}

      {/* Alt bilgiler + hızlı aksiyon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          {operation.startDate && (
            <span className="text-[var(--muted-foreground)]">{formatDateShort(operation.startDate)}</span>
          )}
        </div>

        {nextStatus && (
          <button
            onClick={(e) => { e.stopPropagation(); onStatusChange(operation.id, nextStatus); }}
            className="px-2.5 py-1.5 text-xs rounded-md font-medium transition-colors"
            style={{
              backgroundColor: statusBgColors[nextStatus],
              color: statusColors[nextStatus],
            }}
          >
            → {OPERATION_STATUS_LABELS[nextStatus]}
          </button>
        )}
      </div>
    </div>
  );
}
