"use client";

import { useState } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { OperationsToolbar } from "./OperationsToolbar";
import { OperationsTable } from "./OperationsTable";
import { OperationModal } from "./OperationModal";
import type { Operation, OperationStatus } from "@/types/iha";

export function OperationsTab() {
  const {
    operations,
    equipment,
    team,
    filters,
    setFilter,
    addOperation,
    updateOperation,
    deleteOperation,
  } = useIhaStore();

  const [selectedOp, setSelectedOp] = useState<Operation | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered =
    filters.operationStatus === "all"
      ? operations
      : operations.filter((op) => op.status === filters.operationStatus);

  const handleAdd = () => {
    setSelectedOp(undefined);
    setIsModalOpen(true);
  };

  const handleSelect = (op: Operation) => {
    setSelectedOp(op);
    setIsModalOpen(true);
  };

  const handleSave = (
    data: Omit<Operation, "id" | "createdAt" | "updatedAt">
  ) => {
    if (selectedOp) {
      updateOperation(selectedOp.id, data);
    } else {
      addOperation(data);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <OperationsToolbar
        statusFilter={filters.operationStatus}
        onStatusChange={(s) => setFilter("operationStatus", s as OperationStatus | "all")}
        onAdd={handleAdd}
      />

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
