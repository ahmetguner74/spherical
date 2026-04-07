"use client";

import { useState } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { StatCard } from "./StatCard";
import { ActiveOperations } from "./ActiveOperations";
import { AlertsList } from "./AlertsList";
import { Modal } from "@/components/ui/Modal";
import { OperationForm } from "../operations/OperationForm";

export function IhaDashboard() {
  const {
    operations,
    equipment,
    software,
    storage,
    team,
    flightLogs,
    flightPermissions,
    addOperation,
    setActiveTab,
  } = useIhaStore();

  const [showNewOp, setShowNewOp] = useState(false);

  const activeOps = operations.filter(
    (op) => op.status !== "teslim" && op.status !== "iptal"
  );
  const completedOps = operations.filter((op) => op.status === "teslim");
  const activePerms = flightPermissions.filter((p) => p.status === "onaylandi");

  return (
    <div className="space-y-6">
      <AlertsList
        equipment={equipment}
        software={software}
        storage={storage}
        permissions={flightPermissions}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Aktif Operasyon"
          value={activeOps.length}
          subtitle={`${completedOps.length} tamamlanan`}
          accent
        />
        <StatCard
          title="Ekipman"
          value={equipment.length}
          subtitle={`${equipment.filter((e) => e.status === "musait").length} müsait`}
        />
        <StatCard
          title="Uçuş Kaydı"
          value={flightLogs.length}
        />
        <StatCard
          title="Uçuş İzni"
          value={activePerms.length}
          subtitle={`${flightPermissions.length} toplam`}
        />
      </div>

      <ActiveOperations
        operations={operations}
        onViewAll={() => setActiveTab("operations")}
        onNewOperation={() => setShowNewOp(true)}
      />

      <Modal open={showNewOp} onClose={() => setShowNewOp(false)}>
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
          Yeni Operasyon
        </h2>
        <OperationForm
          equipment={equipment}
          team={team}
          onSave={(data) => {
            addOperation(data);
            setShowNewOp(false);
          }}
          onCancel={() => setShowNewOp(false)}
        />
      </Modal>
    </div>
  );
}
