"use client";

import { useState } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { StatCard } from "./StatCard";
import { OperationCalendar } from "./OperationCalendar";
import { Modal } from "@/components/ui/Modal";
import { QuickCreateForm } from "../operations/QuickCreateForm";
import { OperationModal } from "../operations/OperationModal";
import type { Operation } from "@/types/iha";

export function IhaDashboard() {
  const {
    operations, equipment, team, vehicleEvents,
    addOperation, updateOperation,
  } = useIhaStore();

  const [showNewOp, setShowNewOp] = useState(false);
  const [newOpDate, setNewOpDate] = useState<string | undefined>();
  const [calendarOp, setCalendarOp] = useState<Operation | undefined>();
  const [isCalendarOpOpen, setIsCalendarOpOpen] = useState(false);

  const activeOps = operations.filter(
    (op) => op.status !== "teslim" && op.status !== "iptal"
  );
  const completedOps = operations.filter((op) => op.status === "teslim");
  const fieldOps = activeOps.filter((op) => op.status === "saha");

  return (
    <div className="space-y-6">
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
          title="Tamamlanan"
          value={completedOps.length}
          subtitle="operasyon"
        />
        <StatCard
          title="Ekipman"
          value={equipment.length}
          subtitle={`${equipment.filter((e) => e.status === "musait").length} müsait · ${equipment.filter((e) => e.status === "kullanımda").length} sahada`}
        />
      </div>

      <OperationCalendar
        operations={operations}
        vehicleEvents={vehicleEvents}
        onSelect={(op) => { setCalendarOp(op); setIsCalendarOpOpen(true); }}
        onStatusChange={(opId, status) => updateOperation(opId, { status })}
        onDateChange={(opId, newDate) => updateOperation(opId, { startDate: newDate, endDate: newDate })}
        onNewOperation={(date) => { setNewOpDate(date); setShowNewOp(true); }}
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

      <Modal open={showNewOp} onClose={() => setShowNewOp(false)}>
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
          Yeni Operasyon
        </h2>
        <QuickCreateForm
          team={team}
          defaultDate={newOpDate}
          onSave={(data) => { addOperation(data); setShowNewOp(false); setNewOpDate(undefined); }}
          onCancel={() => { setShowNewOp(false); setNewOpDate(undefined); }}
        />
      </Modal>
    </div>
  );
}
