"use client";

import type { Operation } from "@/types/iha";
import { OPERATION_STATUS_LABELS, OPERATION_PRIORITY_LABELS } from "@/types/iha";
import { Badge } from "@/components/ui/Badge";

interface ActiveOperationsProps {
  operations: Operation[];
  onViewAll: () => void;
  onNewOperation: () => void;
}

const STATUS_COLORS: Record<string, "default" | "success" | "warning" | "danger"> = {
  talep: "default",
  planlama: "warning",
  saha: "success",
  isleme: "warning",
  kontrol: "default",
  teslim: "success",
  iptal: "danger",
};

export function ActiveOperations({ operations, onViewAll, onNewOperation }: ActiveOperationsProps) {
  const active = operations.filter((op) => op.status !== "teslim" && op.status !== "iptal");
  const display = active.slice(0, 5);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          Aktif Operasyonlar
        </h3>
        <div className="flex items-center gap-2">
          {active.length > 0 && (
            <button
              onClick={onViewAll}
              className="text-xs text-[var(--accent)] hover:underline"
            >
              Tümünü Gör
            </button>
          )}
          <button
            onClick={onNewOperation}
            className="px-3 py-1 text-xs rounded-md bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
          >
            + Yeni
          </button>
        </div>
      </div>

      {display.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)] py-6 text-center">
          Aktif operasyon yok
        </p>
      ) : (
        <div className="space-y-1">
          {display.map((op) => (
            <div
              key={op.id}
              className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">
                  {op.title}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {op.requester} · {OPERATION_PRIORITY_LABELS[op.priority]}
                </p>
              </div>
              <Badge variant={STATUS_COLORS[op.status] ?? "default"}>
                {OPERATION_STATUS_LABELS[op.status]}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
