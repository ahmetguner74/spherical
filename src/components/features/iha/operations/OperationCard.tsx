"use client";

import type { Operation, OperationStatus } from "@/types/iha";
import {
  OPERATION_PRIORITY_LABELS, OPERATION_TYPE_LABELS,
  OPERATION_STATUS_LABELS, OPERATION_STATUS_VARIANTS,
} from "@/types/iha";
import { Badge } from "@/components/ui/Badge";
import { statusColors } from "@/config/tokens";

const STATUS_FLOW: OperationStatus[] = ["talep", "planlama", "saha", "isleme", "kontrol", "teslim"];

interface OperationCardProps {
  operation: Operation;
  onSelect: (op: Operation) => void;
  onStatusChange: (id: string, status: OperationStatus) => void;
}

export function OperationCard({ operation, onSelect, onStatusChange }: OperationCardProps) {
  const currentIdx = STATUS_FLOW.indexOf(operation.status);
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1
    ? STATUS_FLOW[currentIdx + 1]
    : undefined;

  return (
    <div
      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3 active:bg-[var(--surface-hover)] transition-colors"
      onClick={() => onSelect(operation)}
    >
      <div className="flex items-start justify-between gap-2">
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
        <span>{OPERATION_TYPE_LABELS[operation.type]}</span>
        {operation.location.ilce && (
          <>
            <span className="text-[var(--border)]">·</span>
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

      {/* Alt bilgiler + hızlı aksiyon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          {operation.startDate && (
            <span className="text-[var(--muted-foreground)]">{operation.startDate}</span>
          )}
          <span className={`${operation.priority === "acil" ? "text-red-500 font-medium" : operation.priority === "yuksek" ? "text-yellow-500" : "text-[var(--muted-foreground)]"}`}>
            {OPERATION_PRIORITY_LABELS[operation.priority]}
          </span>
        </div>

        {nextStatus && (
          <button
            onClick={(e) => { e.stopPropagation(); onStatusChange(operation.id, nextStatus); }}
            className="px-2.5 py-1.5 text-xs rounded-md font-medium transition-colors"
            style={{
              backgroundColor: `${statusColors[nextStatus]}20`,
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
