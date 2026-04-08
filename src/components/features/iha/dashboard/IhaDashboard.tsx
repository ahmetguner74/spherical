"use client";

import { useState } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { StatusBoard } from "./StatusBoard";
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

  const handleSelect = (op: Operation) => { setCalendarOp(op); setIsCalendarOpOpen(true); };

  return (
    <div className="space-y-4">
      <StatusBoard
        operations={operations}
        onSelect={handleSelect}
        onStatusChange={(opId, status) => updateOperation(opId, { status })}
      />

      <OperationCalendar
        operations={operations}
        vehicleEvents={vehicleEvents}
        onSelect={handleSelect}
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
