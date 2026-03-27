"use client";

import { Button } from "@/components/ui/Button";
import type { OperationStatus } from "@/types/iha";
import { OPERATION_STATUS_LABELS } from "@/types/iha";

interface OperationsToolbarProps {
  statusFilter: OperationStatus | "all";
  onStatusChange: (status: OperationStatus | "all") => void;
  onAdd: () => void;
}

const STATUSES: (OperationStatus | "all")[] = [
  "all", "talep", "planlama", "saha", "isleme", "kontrol", "teslim", "iptal",
];

export function OperationsToolbar({
  statusFilter,
  onStatusChange,
  onAdd,
}: OperationsToolbarProps) {
  const inputClass =
    "rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as OperationStatus | "all")}
        className={inputClass}
      >
        <option value="all">Tüm Durumlar</option>
        {STATUSES.filter((s) => s !== "all").map((s) => (
          <option key={s} value={s}>
            {OPERATION_STATUS_LABELS[s as OperationStatus]}
          </option>
        ))}
      </select>

      <Button onClick={onAdd} size="sm">
        + Yeni Operasyon
      </Button>
    </div>
  );
}
