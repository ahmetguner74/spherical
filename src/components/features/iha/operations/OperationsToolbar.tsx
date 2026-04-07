"use client";

import { Button } from "@/components/ui/Button";
import type { OperationStatus, OperationType } from "@/types/iha";
import { OPERATION_STATUS_LABELS, OPERATION_TYPE_LABELS } from "@/types/iha";
import { inputClass } from "../shared/styles";

export type OperationsView = "kanban" | "table" | "calendar" | "map";

interface OperationsToolbarProps {
  view: OperationsView;
  onViewChange: (view: OperationsView) => void;
  statusFilter: OperationStatus | "all";
  onStatusChange: (status: OperationStatus | "all") => void;
  typeFilter: OperationType | "all";
  onTypeChange: (type: OperationType | "all") => void;
  onAdd: () => void;
}

const STATUSES: OperationStatus[] = ["talep", "planlama", "saha", "isleme", "kontrol", "teslim", "iptal"];
const TYPES: OperationType[] = ["lidar_el", "lidar_arac", "drone_fotogrametri", "oblik_cekim", "panorama_360"];

const VIEW_LABELS: Record<OperationsView, string> = {
  kanban: "Pano",
  table: "Tablo",
  calendar: "Takvim",
  map: "Harita",
};

const VIEWS: OperationsView[] = ["kanban", "table", "calendar", "map"];

export function OperationsToolbar({
  view,
  onViewChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  onAdd,
}: OperationsToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2 flex-wrap">
        {/* View toggle */}
        <div className="flex rounded-md border border-[var(--border)] overflow-hidden">
          {VIEWS.map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`px-2.5 py-1.5 text-xs ${
                view === v
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--surface)]"
              }`}
            >
              {VIEW_LABELS[v]}
            </button>
          ))}
        </div>

        <select value={statusFilter} onChange={(e) => onStatusChange(e.target.value as OperationStatus | "all")} className={inputClass}>
          <option value="all">Tüm Durumlar</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{OPERATION_STATUS_LABELS[s]}</option>
          ))}
        </select>

        <select value={typeFilter} onChange={(e) => onTypeChange(e.target.value as OperationType | "all")} className={inputClass}>
          <option value="all">Tüm Tipler</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>{OPERATION_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      <Button onClick={onAdd} size="sm">+ Yeni Operasyon</Button>
    </div>
  );
}
