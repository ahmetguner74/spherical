"use client";

import { useState } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { OperationsTable } from "./OperationsTable";
import { OperationModal } from "./OperationModal";
import { SelectFilter } from "../shared/ViewToolbar";
import { Button } from "@/components/ui/Button";
import type { Operation, OperationStatus, OperationType } from "@/types/iha";
import { OPERATION_STATUS_LABELS, OPERATION_TYPE_LABELS } from "@/types/iha";

const STATUSES: OperationStatus[] = ["talep", "planlama", "saha", "isleme", "kontrol", "teslim", "iptal"];
const TYPES: OperationType[] = ["lidar_el", "lidar_arac", "drone_fotogrametri", "oblik_cekim", "panorama_360"];

export function OperationsTab() {
  const {
    operations, equipment, team, filters, setFilter,
    addOperation, updateOperation, deleteOperation,
  } = useIhaStore();

  const [selectedOp, setSelectedOp] = useState<Operation | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = operations.filter((op) => {
    if (filters.operationStatus !== "all" && op.status !== filters.operationStatus) return false;
    if (filters.operationType !== "all" && op.type !== filters.operationType) return false;
    if (filters.searchText) {
      const q = filters.searchText.toLowerCase();
      const searchable = [op.title, op.description, op.requester, op.location?.il, op.location?.ilce].filter(Boolean).join(" ").toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });

  const handleAdd = () => { setSelectedOp(undefined); setIsModalOpen(true); };
  const handleSelect = (op: Operation) => { setSelectedOp(op); setIsModalOpen(true); };

  const handleSave = (data: Omit<Operation, "id" | "createdAt" | "updatedAt" | "deliverables" | "flightLogIds" | "completionPercent">) => {
    if (selectedOp) updateOperation(selectedOp.id, data);
    else addOperation(data);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <SelectFilter
            value={filters.operationStatus}
            onChange={(v) => setFilter("operationStatus", v as OperationStatus | "all")}
            options={STATUSES.map((s) => ({ value: s, label: OPERATION_STATUS_LABELS[s] }))}
            allLabel="Tüm Durumlar"
          />
          <SelectFilter
            value={filters.operationType}
            onChange={(v) => setFilter("operationType", v as OperationType | "all")}
            options={TYPES.map((t) => ({ value: t, label: OPERATION_TYPE_LABELS[t] }))}
            allLabel="Tüm Tipler"
          />
        </div>
        <Button size="sm" onClick={handleAdd}>+ Yeni Operasyon</Button>
      </div>

      <OperationsTable operations={filtered} onSelect={handleSelect} />

      <OperationModal
        operation={selectedOp}
        equipment={equipment}
        team={team}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onDelete={deleteOperation}
      />
    </div>
  );
}
