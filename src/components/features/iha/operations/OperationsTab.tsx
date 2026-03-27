"use client";

import { useState } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { OperationsToolbar } from "./OperationsToolbar";
import type { OperationsView } from "./OperationsToolbar";
import { OperationsTable } from "./OperationsTable";
import { OperationsKanban } from "./OperationsKanban";
import { OperationsCalendar } from "./OperationsCalendar";
import { OperationsMap } from "./OperationsMap";
import { OperationModal } from "./OperationModal";
import type { Operation, OperationStatus, OperationType } from "@/types/iha";

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

  const [view, setView] = useState<OperationsView>("kanban");
  const [selectedOp, setSelectedOp] = useState<Operation | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = operations.filter((op) => {
    if (filters.operationStatus !== "all" && op.status !== filters.operationStatus) return false;
    if (filters.operationType !== "all" && op.type !== filters.operationType) return false;
    return true;
  });

  const handleAdd = () => {
    setSelectedOp(undefined);
    setIsModalOpen(true);
  };

  const handleSelect = (op: Operation) => {
    setSelectedOp(op);
    setIsModalOpen(true);
  };

  const handleSave = (data: Omit<Operation, "id" | "createdAt" | "updatedAt" | "deliverables" | "flightLogIds" | "completionPercent">) => {
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
        view={view}
        onViewChange={setView}
        statusFilter={filters.operationStatus}
        onStatusChange={(s) => setFilter("operationStatus", s as OperationStatus | "all")}
        typeFilter={filters.operationType}
        onTypeChange={(t) => setFilter("operationType", t as OperationType | "all")}
        onAdd={handleAdd}
      />

      {view === "kanban" && <OperationsKanban operations={filtered} onSelect={handleSelect} />}
      {view === "table" && <OperationsTable operations={filtered} onSelect={handleSelect} />}
      {view === "calendar" && <OperationsCalendar operations={filtered} onSelect={handleSelect} />}
      {view === "map" && <OperationsMap operations={filtered} onSelect={handleSelect} />}

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
