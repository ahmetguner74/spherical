"use client";

import { useState, lazy, Suspense } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { OperationsToolbar } from "./OperationsToolbar";
import type { OperationsView } from "./OperationsToolbar";
import { OperationsTable } from "./OperationsTable";
import { OperationsKanban } from "./OperationsKanban";
import { OperationsCalendar } from "./OperationsCalendar";
import { OperationsMap } from "./OperationsMap";
import { OperationModal } from "./OperationModal";
import { PermissionsPanel } from "../permissions/PermissionsPanel";
import type { Operation, OperationStatus, OperationType } from "@/types/iha";

type SubTab = "operations" | "permissions";

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

  const [subTab, setSubTab] = useState<SubTab>("operations");
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
      {/* Sub-tab toggle */}
      <div className="flex gap-1 border-b border-[var(--border)]">
        <button
          onClick={() => setSubTab("operations")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            subTab === "operations"
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Operasyonlar ({operations.length})
        </button>
        <button
          onClick={() => setSubTab("permissions")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            subTab === "permissions"
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Uçuş İzinleri
        </button>
      </div>

      {subTab === "operations" ? (
        <>
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
        </>
      ) : (
        <PermissionsPanel />
      )}
    </div>
  );
}
