"use client";

import { useIhaStore } from "../shared/ihaStore";
import { StatCard } from "./StatCard";
import { ActiveOperations } from "./ActiveOperations";
import { EquipmentStatusSummary } from "./EquipmentStatusSummary";
import { StorageSummary } from "./StorageSummary";
import { AlertsList } from "./AlertsList";

export function IhaDashboard() {
  const { operations, equipment, software, storage, team, setActiveTab } =
    useIhaStore();

  const activeOps = operations.filter(
    (op) => op.status !== "teslim" && op.status !== "iptal"
  );
  const availableEquipment = equipment.filter((eq) => eq.status === "musait");

  return (
    <div className="space-y-6">
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Aktif Operasyon"
          value={activeOps.length}
          subtitle={`${operations.length} toplam`}
          accent
        />
        <StatCard
          title="Ekipman"
          value={equipment.length}
          subtitle={`${availableEquipment.length} müsait`}
        />
        <StatCard
          title="Yazılım"
          value={software.length}
        />
        <StatCard
          title="Ekip"
          value={team.length}
          subtitle="kişi"
        />
      </div>

      {/* Detay Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ActiveOperations
          operations={operations}
          onViewAll={() => setActiveTab("operations")}
        />
        <EquipmentStatusSummary equipment={equipment} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StorageSummary storage={storage} />
        <AlertsList equipment={equipment} software={software} />
      </div>
    </div>
  );
}
