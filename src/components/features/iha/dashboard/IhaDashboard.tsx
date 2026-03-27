"use client";

import { useState } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { MapOperations } from "../map";
import { OPERATION_TYPE_LABELS, OPERATION_STATUS_LABELS } from "@/types/iha";
import type { Operation, FlightPermission, Equipment, Software, StorageUnit } from "@/types/iha";

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

  const [panelOpen, setPanelOpen] = useState(true);

  const activeOps = operations.filter(
    (op) => op.status !== "teslim" && op.status !== "iptal"
  );
  const completedOps = operations.filter((op) => op.status === "teslim");
  const availableEquipment = equipment.filter((eq) => eq.status === "musait");
  const activePerms = flightPermissions.filter((p) => p.status === "onaylandi");

  const recentLogs = [...flightLogs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Tam ekran harita */}
      <div className="h-[calc(100vh-12rem)]">
        <MapOperations
          operations={operations}
          permissions={flightPermissions}
          onSelectOperation={() => setActiveTab("operations")}
          className="h-full w-full"
        />
      </div>

      {/* Overlay: Sol üst — KPI kartları */}
      <div className="absolute top-3 left-3 flex flex-col gap-2 z-[5]">
        <OverlayKpi label="Aktif" value={activeOps.length} accent />
        <OverlayKpi label="Ekipman" value={`${availableEquipment.length}/${equipment.length}`} />
        <OverlayKpi label="Uçuş" value={flightLogs.length} />
        {activePerms.length > 0 && (
          <OverlayKpi label="İzin" value={activePerms.length} green />
        )}
      </div>

      {/* Overlay: Sağ üst — Hızlı eylemler */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-[5]">
        <OverlayButton label="+ Operasyon" onClick={() => setActiveTab("operations")} />
        <OverlayButton label="+ Uçuş İzni" onClick={() => setActiveTab("permissions")} />
        <OverlayButton label="+ Uçuş Kaydı" onClick={() => setActiveTab("flightLog")} />
      </div>

      {/* Overlay: Alt — Bilgi paneli (aç/kapa) */}
      <div className="absolute bottom-3 left-3 right-3 z-[5]">
        {/* Panel toggle */}
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="mb-2 px-3 py-1.5 rounded-lg bg-[var(--surface)]/90 backdrop-blur border border-[var(--border)] text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          {panelOpen ? "Paneli Gizle ▼" : "Paneli Göster ▲"}
        </button>

        {panelOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {/* Aktif Operasyonlar */}
            <OverlayCard
              title="Aktif Operasyonlar"
              action={{ label: "Tümü", onClick: () => setActiveTab("operations") }}
            >
              {activeOps.length === 0 ? (
                <p className="text-xs text-[var(--muted-foreground)]">Yok</p>
              ) : (
                <div className="space-y-1">
                  {activeOps.slice(0, 3).map((op) => (
                    <div key={op.id} className="text-xs">
                      <span className="text-[var(--foreground)]">{op.title}</span>
                      <span className="text-[var(--muted-foreground)] ml-1">
                        · {OPERATION_STATUS_LABELS[op.status]}
                      </span>
                    </div>
                  ))}
                  {activeOps.length > 3 && (
                    <span className="text-xs text-[var(--muted-foreground)]">+{activeOps.length - 3} daha</span>
                  )}
                </div>
              )}
            </OverlayCard>

            {/* Son Uçuşlar */}
            <OverlayCard
              title="Son Kayıtlar"
              action={{ label: "Tümü", onClick: () => setActiveTab("flightLog") }}
            >
              {recentLogs.length === 0 ? (
                <p className="text-xs text-[var(--muted-foreground)]">Kayıt yok</p>
              ) : (
                <div className="space-y-1">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="text-xs">
                      <span className="text-[var(--foreground)]">{log.date}</span>
                      <span className="text-[var(--muted-foreground)] ml-1">
                        · {OPERATION_TYPE_LABELS[log.type]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </OverlayCard>

            {/* Depolama */}
            <OverlayCard
              title="Depolama"
              action={{ label: "Detay", onClick: () => setActiveTab("storage") }}
            >
              <div className="space-y-1.5">
                {storage.map((s) => {
                  const pct = s.totalCapacityTB > 0
                    ? Math.round((s.usedCapacityTB / s.totalCapacityTB) * 100)
                    : 0;
                  return (
                    <div key={s.id}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-[var(--foreground)]">{s.name}</span>
                        <span className="text-[var(--muted-foreground)]">%{pct}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--background)] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-500" : "bg-[var(--accent)]"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </OverlayCard>

            {/* Uyarılar */}
            <OverlayCard title="Uyarılar">
              <AlertsCompact
                equipment={equipment}
                software={software}
                storage={storage}
                permissions={flightPermissions}
              />
            </OverlayCard>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Overlay Components ---

function OverlayKpi({
  label,
  value,
  accent,
  green,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  green?: boolean;
}) {
  return (
    <div className="px-3 py-2 rounded-lg bg-[var(--surface)]/90 backdrop-blur border border-[var(--border)] min-w-[5rem]">
      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      <p className={`text-lg font-bold ${accent ? "text-[var(--accent)]" : green ? "text-green-500" : "text-[var(--foreground)]"}`}>
        {value}
      </p>
    </div>
  );
}

function OverlayButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-2 rounded-lg bg-[var(--surface)]/90 backdrop-blur border border-[var(--border)] text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors text-left"
    >
      {label}
    </button>
  );
}

function OverlayCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: { label: string; onClick: () => void };
  children: React.ReactNode;
}) {
  return (
    <div className="p-3 rounded-lg bg-[var(--surface)]/90 backdrop-blur border border-[var(--border)]">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-[var(--foreground)]">{title}</h4>
        {action && (
          <button onClick={action.onClick} className="text-xs text-[var(--accent)] hover:underline">
            {action.label}
          </button>
        )}
      </div>
      {children}
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
          className="w-2.5 h-2.5 rounded-full border border-white"
          style={{ backgroundColor: color, boxShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
        />
      )}
      <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
    </div>
  );
}

function AlertsCompact({
  equipment,
  software,
  storage,
  permissions,
}: {
  equipment: Equipment[];
  software: Software[];
  storage: StorageUnit[];
  permissions: FlightPermission[];
}) {
  const alerts: { type: "danger" | "warning"; msg: string }[] = [];
  const now = new Date();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  for (const eq of equipment) {
    if (eq.status === "ariza") alerts.push({ type: "danger", msg: `${eq.name} arızalı` });
    if (eq.insuranceExpiry) {
      const diff = new Date(eq.insuranceExpiry).getTime() - now.getTime();
      if (diff < 0) alerts.push({ type: "danger", msg: `${eq.name} sigorta dolmuş` });
      else if (diff < thirtyDays) alerts.push({ type: "warning", msg: `${eq.name} sigorta ${Math.ceil(diff / 86400000)}g` });
    }
  }
  for (const s of storage) {
    const pct = s.totalCapacityTB > 0 ? (s.usedCapacityTB / s.totalCapacityTB) * 100 : 0;
    if (pct >= 90) alerts.push({ type: "danger", msg: `${s.name} %${Math.round(pct)} dolu` });
    else if (pct >= 70) alerts.push({ type: "warning", msg: `${s.name} %${Math.round(pct)} dolu` });
  }
  for (const p of permissions) {
    if (p.status === "onaylandi" && p.endDate) {
      const diff = new Date(p.endDate).getTime() - now.getTime();
      if (diff < 0) alerts.push({ type: "danger", msg: `İzin ${p.hsdNumber ?? ""} dolmuş` });
      else if (diff < 3 * 86400000) alerts.push({ type: "warning", msg: `İzin ${Math.ceil(diff / 86400000)}g kaldı` });
    }
  }

  if (alerts.length === 0) return <p className="text-xs text-green-500">Uyarı yok</p>;

  return (
    <div className="space-y-1">
      {alerts.slice(0, 4).map((a, i) => (
        <p key={i} className={`text-xs ${a.type === "danger" ? "text-red-500" : "text-yellow-500"}`}>
          {a.msg}
        </p>
      ))}
      {alerts.length > 4 && <p className="text-xs text-[var(--muted-foreground)]">+{alerts.length - 4} daha</p>}
    </div>
  );
}
