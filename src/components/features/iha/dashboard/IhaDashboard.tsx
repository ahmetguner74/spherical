"use client";

import { useState } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { StatCard } from "./StatCard";
import { ActiveOperations } from "./ActiveOperations";
import { EquipmentStatusSummary } from "./EquipmentStatusSummary";
import { StorageSummary } from "./StorageSummary";
import { AlertsList } from "./AlertsList";
import { Modal } from "@/components/ui/Modal";
import { OperationForm } from "../operations/OperationForm";
import { PermissionForm } from "../permissions/PermissionForm";
import { FlightLogForm } from "../flight-log/FlightLogForm";
import { OPERATION_TYPE_LABELS } from "@/types/iha";

type DashboardModal = "none" | "operation" | "permission" | "flightLog";

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
    addFlightPermission,
    addFlightLog,
    setActiveTab,
  } = useIhaStore();

  const [modal, setModal] = useState<DashboardModal>("none");

  const activeOps = operations.filter(
    (op) => op.status !== "teslim" && op.status !== "iptal"
  );
  const completedOps = operations.filter((op) => op.status === "teslim");
  const availableEquipment = equipment.filter((eq) => eq.status === "musait");
  const activePerms = flightPermissions.filter((p) => p.status === "onaylandi");

  const recentLogs = [...flightLogs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Aktif Operasyon" value={activeOps.length} subtitle={`${completedOps.length} tamamlanan`} accent />
        <StatCard title="Ekipman" value={equipment.length} subtitle={`${availableEquipment.length} müsait`} />
        <StatCard title="Uçuş / Tarama" value={flightLogs.length} subtitle="kayıt" />
        <StatCard title="Aktif İzin" value={activePerms.length} subtitle={`${flightPermissions.length} toplam`} />
      </div>

      {/* Hızlı Eylemler — modal açar, tab değiştirmez */}
      <div className="flex gap-2 flex-wrap">
        <QuickAction label="+ Operasyon" onClick={() => setModal("operation")} />
        <QuickAction label="+ Uçuş İzni" onClick={() => setModal("permission")} />
        <QuickAction label="+ Uçuş Kaydı" onClick={() => setModal("flightLog")} />
        <QuickAction label="Harita" onClick={() => setActiveTab("map")} accent />
        <QuickAction label="Raporlar" onClick={() => setActiveTab("reports")} />
      </div>

      {/* Ana Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ActiveOperations operations={operations} onViewAll={() => setActiveTab("operations")} />
        <EquipmentStatusSummary equipment={equipment} />
      </div>

      {/* İzin Özeti */}
      {flightPermissions.length > 0 && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Uçuş İzinleri</h3>
            <button onClick={() => setActiveTab("permissions")} className="text-xs text-[var(--accent)] hover:underline">Tümü</button>
          </div>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-xs text-[var(--muted-foreground)]">Aktif</span>
              <p className="text-lg font-bold text-green-500">{activePerms.length}</p>
            </div>
            <div>
              <span className="text-xs text-[var(--muted-foreground)]">Beklemede</span>
              <p className="text-lg font-bold text-yellow-500">{flightPermissions.filter((p) => p.status === "beklemede").length}</p>
            </div>
            <div>
              <span className="text-xs text-[var(--muted-foreground)]">Toplam</span>
              <p className="text-lg font-bold text-[var(--foreground)]">{flightPermissions.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Son Uçuş Kayıtları */}
      {recentLogs.length > 0 && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Son Uçuş / Tarama Kayıtları</h3>
            <button onClick={() => setActiveTab("flightLog")} className="text-xs text-[var(--accent)] hover:underline">Tümü</button>
          </div>
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <div>
                  <p className="text-sm text-[var(--foreground)]">{log.date}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {OPERATION_TYPE_LABELS[log.type]}
                    {log.location.ilce && ` · ${log.location.il}/${log.location.ilce}`}
                  </p>
                </div>
                <span className="text-xs text-[var(--muted-foreground)]">{log.pilotName ?? "-"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StorageSummary storage={storage} />
        <AlertsList equipment={equipment} software={software} storage={storage} permissions={flightPermissions} />
      </div>

      {/* Modallar — tab değiştirmeden yerinde açılır */}
      <Modal open={modal === "operation"} onClose={() => setModal("none")}>
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">Yeni Operasyon</h2>
        <OperationForm
          equipment={equipment}
          team={team}
          onSave={(data) => { addOperation(data); setModal("none"); }}
          onCancel={() => setModal("none")}
        />
      </Modal>

      <Modal open={modal === "permission"} onClose={() => setModal("none")}>
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">Yeni Uçuş İzni</h2>
        <PermissionForm
          operations={operations}
          onSave={(data) => { addFlightPermission(data); setModal("none"); }}
          onCancel={() => setModal("none")}
        />
      </Modal>

      <Modal open={modal === "flightLog"} onClose={() => setModal("none")}>
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">Yeni Uçuş / Tarama Kaydı</h2>
        <FlightLogForm
          operations={operations}
          equipment={equipment}
          team={team}
          onSave={(data) => { addFlightLog(data); setModal("none"); }}
          onCancel={() => setModal("none")}
        />
      </Modal>
    </div>
  );
}

function QuickAction({ label, onClick, accent }: { label: string; onClick: () => void; accent?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
        accent
          ? "border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)]/10"
          : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]"
      }`}
    >
      {label}
    </button>
  );
}
