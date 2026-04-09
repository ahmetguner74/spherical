"use client";

import type { OperationStatus, OperationType } from "@/types/iha";
import { OPERATION_STATUS_LABELS, OPERATION_TYPE_LABELS } from "@/types/iha";
import { ViewToolbar, SelectFilter } from "../shared/ViewToolbar";

export type OperationsView = "kanban" | "table" | "map";

interface OperationsToolbarProps {
  view: OperationsView;
  onViewChange: (view: OperationsView) => void;
  statusFilter: OperationStatus | "all";
  onStatusChange: (status: OperationStatus | "all") => void;
  typeFilter: OperationType | "all";
  onTypeChange: (type: OperationType | "all") => void;
  onAdd: () => void;
}

const VIEWS = [
  { key: "kanban", label: "Pano" },
  { key: "table", label: "Tablo" },
  { key: "map", label: "Harita" },
];

const STATUSES: OperationStatus[] = ["talep", "planlama", "saha", "isleme", "kontrol", "teslim", "iptal"];
const TYPES: OperationType[] = ["iha", "lidar", "lidar_el", "lidar_arac", "drone_fotogrametri", "oblik_cekim", "panorama_360"];

export function OperationsToolbar({
  view, onViewChange, statusFilter, onStatusChange, typeFilter, onTypeChange, onAdd,
}: OperationsToolbarProps) {
  return (
    <ViewToolbar
      views={VIEWS}
      activeView={view}
      onViewChange={(v) => onViewChange(v as OperationsView)}
      addLabel="Yeni Operasyon"
      onAdd={onAdd}
      filters={
        <>
          <SelectFilter
            value={statusFilter}
            onChange={(v) => onStatusChange(v as OperationStatus | "all")}
            options={STATUSES.map((s) => ({ value: s, label: OPERATION_STATUS_LABELS[s] }))}
            allLabel="Tüm Durumlar"
          />
          <SelectFilter
            value={typeFilter}
            onChange={(v) => onTypeChange(v as OperationType | "all")}
            options={TYPES.map((t) => ({ value: t, label: OPERATION_TYPE_LABELS[t] }))}
            allLabel="Tüm Tipler"
          />
        </>
      }
    />
  );
}
