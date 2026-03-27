"use client";

import { useState } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { StatCard } from "./StatCard";
import { ActiveOperations } from "./ActiveOperations";
import { EquipmentStatusSummary } from "./EquipmentStatusSummary";
import { StorageSummary } from "./StorageSummary";
import { AlertsList } from "./AlertsList";
import { MapOperations } from "../map";
import { OPERATION_TYPE_LABELS, OPERATION_STATUS_LABELS } from "@/types/iha";
import type { Operation, FlightPermission } from "@/types/iha";

export function IhaDashboard() {
  const {
    operations,
    equipment,
    software,
    storage,
    team,
    flightLogs,
    flightPermissions,
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
        <QuickAction label="+ Uçuş İzni" onClick={() => setActiveTab("permissions")} />
        <QuickAction label="+ Uçuş Kaydı" onClick={() => setActiveTab("flightLog")} />
        <QuickAction label="Raporlar" onClick={() => setActiveTab("reports")} />
      </div>

      {/* Ana Harita */}
      <DashboardMap
        operations={operations}
        flightPermissions={flightPermissions}
        onSelectOperation={() => setActiveTab("operations")}
      />

      {/* Ana Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ActiveOperations
          operations={operations}
          onViewAll={() => setActiveTab("operations")}
        />
        <EquipmentStatusSummary equipment={equipment} />
      </div>

      {/* Aktif İzinler */}
      {flightPermissions.length > 0 && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              Uçuş İzinleri
            </h3>
            <button
              onClick={() => setActiveTab("permissions")}
              className="text-xs text-[var(--accent)] hover:underline"
            >
              Tümü
            </button>
          </div>
          <div className="flex gap-3 text-sm">
            <div>
              <span className="text-xs text-[var(--muted-foreground)]">Aktif</span>
              <p className="text-lg font-bold text-green-500">
                {flightPermissions.filter((p) => p.status === "onaylandi").length}
              </p>
            </div>
            <div>
              <span className="text-xs text-[var(--muted-foreground)]">Beklemede</span>
              <p className="text-lg font-bold text-yellow-500">
                {flightPermissions.filter((p) => p.status === "beklemede").length}
              </p>
            </div>
            <div>
              <span className="text-xs text-[var(--muted-foreground)]">Toplam</span>
              <p className="text-lg font-bold text-[var(--foreground)]">
                {flightPermissions.length}
              </p>
            </div>
          </div>
        </div>
      )}

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

function DashboardMap({
  operations,
  flightPermissions,
  onSelectOperation,
}: {
  operations: Operation[];
  flightPermissions: FlightPermission[];
  onSelectOperation: () => void;
}) {
  const opsWithLocation = operations.filter(
    (op) => op.location.lat && op.location.lng
  );
  const activePerms = flightPermissions.filter(
    (p) => p.status === "onaylandi" && p.polygonCoordinates.length >= 3
  );

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          Operasyon Haritası
        </h3>
        <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
          <span>{opsWithLocation.length} konumlu operasyon</span>
          {activePerms.length > 0 && (
            <span className="text-green-500">
              {activePerms.length} izin bölgesi
            </span>
          )}
        </div>
      </div>

      <MapOperations
        operations={operations}
        permissions={flightPermissions}
        onSelectOperation={onSelectOperation}
        className="h-72 md:h-96 w-full rounded-lg"
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3">
        <LegendItem color="#6b7280" label="Talep" />
        <LegendItem color="#eab308" label="Planlama" />
        <LegendItem color="#22c55e" label="Saha" />
        <LegendItem color="#f97316" label="İşleme" />
        <LegendItem color="#3b82f6" label="Kontrol" />
        <LegendItem color="#10b981" label="Teslim" />
        {activePerms.length > 0 && (
          <LegendItem color="#22c55e" label="İzin Bölgesi" dashed />
        )}
      </div>
    </div>
  );
}

function LegendItem({
  color,
  label,
  dashed,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {dashed ? (
        <div
          className="w-4 h-3 rounded-sm border-2"
          style={{ borderColor: color, borderStyle: "dashed", opacity: 0.6 }}
        />
      ) : (
        <div
          className="w-3 h-3 rounded-full border-2 border-white"
          style={{ backgroundColor: color, boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
        />
      )}
      <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
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
