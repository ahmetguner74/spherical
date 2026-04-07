"use client";

import { useState, useMemo } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { StatCard } from "./StatCard";
import { ActiveOperations } from "./ActiveOperations";
import { AlertsList } from "./AlertsList";
import { OperationCalendar } from "./OperationCalendar";
import { Modal } from "@/components/ui/Modal";
import { OperationForm } from "../operations/OperationForm";
import { OperationModal } from "../operations/OperationModal";
import { QuickFlightLog } from "./QuickFlightLog";
import { OPERATION_TYPE_LABELS } from "@/types/iha";
import type { Operation } from "@/types/iha";

export function IhaDashboard() {
  const {
    operations, equipment, software, storage, team,
    flightLogs, flightPermissions, addOperation, addFlightLog, setActiveTab,
  } = useIhaStore();

  const [showNewOp, setShowNewOp] = useState(false);
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [calendarOp, setCalendarOp] = useState<Operation | undefined>();
  const [isCalendarOpOpen, setIsCalendarOpOpen] = useState(false);

  const activeOps = operations.filter(
    (op) => op.status !== "teslim" && op.status !== "iptal"
  );
  const completedOps = operations.filter((op) => op.status === "teslim");

  const recentLog = useMemo(() => {
    if (flightLogs.length === 0) return null;
    return [...flightLogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  }, [flightLogs]);

  const fieldOps = activeOps.filter((op) => op.status === "saha");

  return (
    <div className="space-y-6">
      <AlertsList
        equipment={equipment}
        software={software}
        storage={storage}
        permissions={flightPermissions}
      />

      <button
        onClick={() => setShowQuickLog(true)}
        className="w-full rounded-lg border-2 border-dashed border-[var(--accent)]/40 bg-[var(--accent)]/5 p-3 text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
      >
        + Hızlı Uçuş Kaydı
      </button>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Aktif Operasyon"
          value={activeOps.length}
          subtitle={`${completedOps.length} tamamlanan`}
          accent
        />
        <StatCard
          title="Sahada"
          value={fieldOps.length}
          subtitle={fieldOps.length > 0 ? fieldOps[0].location.ilce : "operasyon yok"}
        />
        <StatCard
          title="Uçuş Kaydı"
          value={flightLogs.length}
          subtitle={recentLog ? `Son: ${recentLog.date}` : undefined}
        />
        <StatCard
          title="Ekipman"
          value={equipment.length}
          subtitle={`${equipment.filter((e) => e.status === "musait").length} müsait · ${equipment.filter((e) => e.status === "kullanımda").length} sahada`}
        />
      </div>

      {recentLog && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              Son Uçuş
            </h3>
            <button
              onClick={() => setActiveTab("operations")}
              className="text-xs text-[var(--accent)] hover:underline"
            >
              Tüm Kayıtlar
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                {recentLog.date} · {OPERATION_TYPE_LABELS[recentLog.type]}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {recentLog.location.ilce && `${recentLog.location.il}/${recentLog.location.ilce}`}
                {recentLog.pilotName && ` · ${recentLog.pilotName}`}
                {recentLog.equipmentName && ` · ${recentLog.equipmentName}`}
              </p>
            </div>
            {recentLog.photoCount && (
              <span className="text-xs text-[var(--muted-foreground)]">
                {recentLog.photoCount.toLocaleString()} fotoğraf
              </span>
            )}
          </div>
        </div>
      )}

      <OperationCalendar
        operations={operations}
        onSelect={(op) => { setCalendarOp(op); setIsCalendarOpOpen(true); }}
      />

      <ActiveOperations
        operations={operations}
        onViewAll={() => setActiveTab("operations")}
        onNewOperation={() => setShowNewOp(true)}
      />

      <OperationModal
        operation={calendarOp}
        equipment={equipment}
        team={team}
        isOpen={isCalendarOpOpen}
        onClose={() => setIsCalendarOpOpen(false)}
        onSave={() => {}}
        onDelete={() => {}}
      />

      <Modal open={showQuickLog} onClose={() => setShowQuickLog(false)}>
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
          Hızlı Uçuş Kaydı
        </h2>
        <QuickFlightLog
          operations={operations}
          equipment={equipment}
          team={team}
          onSave={(data) => {
            addFlightLog(data);
            setShowQuickLog(false);
          }}
          onCancel={() => setShowQuickLog(false)}
        />
      </Modal>

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
