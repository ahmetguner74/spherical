"use client";

import { useIhaStore } from "../shared/ihaStore";
import { StatCard } from "./StatCard";
import { ActiveOperations } from "./ActiveOperations";
import { EquipmentStatusSummary } from "./EquipmentStatusSummary";
import { StorageSummary } from "./StorageSummary";
import { AlertsList } from "./AlertsList";
import { OPERATION_TYPE_LABELS } from "@/types/iha";

export function IhaDashboard() {
  const {
    operations,
    equipment,
    software,
    storage,
    team,
    flightLogs,
    setActiveTab,
  } = useIhaStore();

  const activeOps = operations.filter(
    (op) => op.status !== "teslim" && op.status !== "iptal"
  );
  const completedOps = operations.filter((op) => op.status === "teslim");
  const availableEquipment = equipment.filter((eq) => eq.status === "musait");
  const totalFlights = flightLogs.length;
  const totalArea = operations.reduce((sum, op) => sum + (op.location?.alan ?? 0), 0);

  // Recent flight logs
  const recentLogs = [...flightLogs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Aktif Operasyon"
          value={activeOps.length}
          subtitle={`${completedOps.length} tamamlanan`}
          accent
        />
        <StatCard
          title="Ekipman"
          value={equipment.length}
          subtitle={`${availableEquipment.length} müsait`}
        />
        <StatCard
          title="Uçuş / Tarama"
          value={totalFlights}
          subtitle="kayıt"
        />
        <StatCard
          title="Ekip"
          value={team.length}
          subtitle="kişi"
        />
      </div>

      {/* Hızlı Eylemler */}
      <div className="flex gap-2 flex-wrap">
        <QuickAction label="+ Operasyon" onClick={() => setActiveTab("operations")} />
        <QuickAction label="+ Uçuş Kaydı" onClick={() => setActiveTab("flightLog")} />
        <QuickAction label="Raporlar" onClick={() => setActiveTab("reports")} />
      </div>

      {/* Ana Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ActiveOperations
          operations={operations}
          onViewAll={() => setActiveTab("operations")}
        />
        <EquipmentStatusSummary equipment={equipment} />
      </div>

      {/* Son Uçuş Kayıtları */}
      {recentLogs.length > 0 && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              Son Uçuş / Tarama Kayıtları
            </h3>
            <button
              onClick={() => setActiveTab("flightLog")}
              className="text-xs text-[var(--accent)] hover:underline"
            >
              Tümü
            </button>
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
                <span className="text-xs text-[var(--muted-foreground)]">
                  {log.pilotName ?? "-"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StorageSummary storage={storage} />
        <AlertsList equipment={equipment} software={software} />
      </div>
    </div>
  );
}

function QuickAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
    >
      {label}
    </button>
  );
}
