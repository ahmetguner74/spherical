"use client";

import type { Operation, OperationStatus } from "@/types/iha";
import { OPERATION_STATUS_LABELS, OPERATION_TYPE_LABELS, OPERATION_PRIORITY_LABELS } from "@/types/iha";
import { Badge } from "@/components/ui/Badge";

interface OperationsKanbanProps {
  operations: Operation[];
  onSelect: (op: Operation) => void;
}

const COLUMNS: OperationStatus[] = ["talep", "planlama", "saha", "isleme", "kontrol", "teslim"];

const PRIORITY_BORDER: Record<string, string> = {
  acil: "border-l-red-500",
  yuksek: "border-l-yellow-500",
  normal: "border-l-[var(--accent)]",
  dusuk: "border-l-[var(--border)]",
};

export function OperationsKanban({ operations, onSelect }: OperationsKanbanProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {COLUMNS.map((status) => {
        const columnOps = operations.filter((op) => op.status === status);
        return (
          <div key={status} className="flex-shrink-0 w-56 min-w-[14rem]">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                {OPERATION_STATUS_LABELS[status]}
              </h3>
              <span className="text-xs text-[var(--muted-foreground)] bg-[var(--background)] px-1.5 py-0.5 rounded">
                {columnOps.length}
              </span>
            </div>
            <div className="space-y-2">
              {columnOps.map((op) => (
                <button
                  key={op.id}
                  onClick={() => onSelect(op)}
                  className={`w-full text-left p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors border-l-4 ${PRIORITY_BORDER[op.priority]}`}
                >
                  <p className="text-sm font-medium text-[var(--foreground)] line-clamp-2">
                    {op.title}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    {OPERATION_TYPE_LABELS[op.type]}
                  </p>
                  {op.location.ilce && (
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {op.location.il}/{op.location.ilce}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant={op.priority === "acil" ? "danger" : op.priority === "yuksek" ? "warning" : "default"}>
                      {OPERATION_PRIORITY_LABELS[op.priority]}
                    </Badge>
                    {op.assignedTeam.length > 0 && (
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {op.assignedTeam.length} kişi
                      </span>
                    )}
                  </div>
                </button>
              ))}
              {columnOps.length === 0 && (
                <div className="text-center py-8 text-xs text-[var(--muted-foreground)] border border-dashed border-[var(--border)] rounded-lg">
                  Boş
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
