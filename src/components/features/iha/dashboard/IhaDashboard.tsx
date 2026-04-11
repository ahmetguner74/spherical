"use client";

import { useState } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { StatusBoard } from "./StatusBoard";
import { OperationCalendar } from "./OperationCalendar";
import { Modal } from "@/components/ui/Modal";
import { QuickCreateForm } from "../operations/QuickCreateForm";
import { OperationModal } from "../operations/OperationModal";
import type { Operation } from "@/types/iha";

interface IhaDashboardProps {
  /** YAPILDI sütunundaki "Tümünü gör" tıklandığında çağrılır — Operasyonlar sekmesine geçiş için */
  onViewAllDone?: () => void;
}

export function IhaDashboard({ onViewAllDone }: IhaDashboardProps = {}) {
  const {
    operations, equipment, team, vehicleEvents,
    addOperation, updateOperation, deleteOperation,
  } = useIhaStore();

  const [showNewOp, setShowNewOp] = useState(false);
  const [newOpDate, setNewOpDate] = useState<string | undefined>();
  const [calendarOpId, setCalendarOpId] = useState<string | undefined>();
  const [isCalendarOpOpen, setIsCalendarOpOpen] = useState(false);

  // Store'dan güncel operasyonu oku (state yerine)
  const calendarOp = calendarOpId ? operations.find((o) => o.id === calendarOpId) : undefined;

  const handleSelect = (op: Operation) => { setCalendarOpId(op.id); setIsCalendarOpOpen(true); };

  return (
    <div className="space-y-4">
      <StatusBoard
        operations={operations}
        onSelect={handleSelect}
        onStatusChange={(opId, status) => updateOperation(opId, { status })}
        onViewAllDone={onViewAllDone}
      />

      <OperationCalendar
        operations={operations}
        vehicleEvents={vehicleEvents}
        onSelect={handleSelect}
        onDateChange={(opId, newDate, startTime, endTime) => updateOperation(opId, { startDate: newDate, endDate: newDate, ...(startTime ? { startTime, endTime } : {}) })}
        onNewOperation={(date) => { setNewOpDate(date); setShowNewOp(true); }}
      />

      <OperationModal
        operation={calendarOp}
        equipment={equipment}
        team={team}
        isOpen={isCalendarOpOpen}
        onClose={() => setIsCalendarOpOpen(false)}
        onSave={(data) => { if (calendarOp) { updateOperation(calendarOp.id, data); } }}
        onDelete={(id) => { deleteOperation(id); setIsCalendarOpOpen(false); }}
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
