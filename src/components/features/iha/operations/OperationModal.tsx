"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { OperationForm } from "./OperationForm";
import { OperationTimeline } from "./OperationTimeline";
import { OperationDeliverables } from "./OperationDeliverables";
import { PermissionForm } from "../permissions/PermissionForm";
import { FlightLogForm } from "../flight-log/FlightLogForm";
import { useIhaStore } from "../shared/ihaStore";
import type { Operation, Equipment, TeamMember, FlightLog, FlightPermission, Deliverable, OperationStatus } from "@/types/iha";
import { statusColors } from "@/config/tokens";
import {
  OPERATION_PRIORITY_LABELS, OPERATION_TYPE_LABELS,
  OPERATION_STATUS_LABELS, OPERATION_STATUS_VARIANTS,
  PERMISSION_STATUS_LABELS,
} from "@/types/iha";
import { useState } from "react";

interface OperationModalProps {
  operation?: Operation;
  equipment: Equipment[];
  team: TeamMember[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Operation, "id" | "createdAt" | "updatedAt" | "deliverables" | "flightLogIds" | "completionPercent">) => void;
  onDelete?: (id: string) => void;
}

type ModalView = "detail" | "editOp" | "addPermission" | "editPermission" | "addFlightLog";

export function OperationModal({ operation, equipment, team, isOpen, onClose, onSave, onDelete }: OperationModalProps) {
  const [view, setView] = useState<ModalView>(operation ? "detail" : "editOp");
  const {
    operations, flightLogs, flightPermissions,
    addDeliverable, removeDeliverable,
    addFlightPermission, updateFlightPermission, deleteFlightPermission,
    addFlightLog, updateOperation,
  } = useIhaStore();

  const getTeamNames = (ids: string[]) => ids.map((id) => team.find((t) => t.id === id)?.name).filter(Boolean).join(", ");
  const getEquipmentNames = (ids: string[]) => ids.map((id) => equipment.find((e) => e.id === id)?.name).filter(Boolean).join(", ");

  const operationFlights = operation ? flightLogs.filter((fl) => fl.operationId === operation.id) : [];
  const operationPermission = operation?.permissionId
    ? flightPermissions.find((p) => p.id === operation.permissionId)
    : flightPermissions.find((p) => p.operationId === operation?.id);

  const modalTitle = () => {
    if (view === "editOp") return operation ? "Operasyonu Düzenle" : "Yeni Operasyon";
    if (view === "addPermission") return "Uçuş İzni Ekle";
    if (view === "editPermission") return "Uçuş İzni Düzenle";
    if (view === "addFlightLog") return "Uçuş Kaydı Ekle";
    return operation?.title ?? "";
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">{modalTitle()}</h2>

      {view === "editOp" && (
        <OperationForm
          operation={operation}
          equipment={equipment}
          team={team}
          onSave={(data) => { onSave(data); setView("detail"); }}
          onCancel={() => { if (operation) setView("detail"); else onClose(); }}
        />
      )}

      {view === "addPermission" && operation && (
        <PermissionForm
          operations={operations}
          onSave={(data) => { addFlightPermission({ ...data, operationId: operation.id }); setView("detail"); }}
          onCancel={() => setView("detail")}
        />
      )}

      {view === "editPermission" && operationPermission && (
        <PermissionForm
          permission={operationPermission}
          operations={operations}
          onSave={(data) => { updateFlightPermission(operationPermission.id, data); setView("detail"); }}
          onCancel={() => setView("detail")}
        />
      )}

      {view === "addFlightLog" && operation && (
        <FlightLogForm
          operations={operations}
          equipment={equipment}
          team={team}
          onSave={(data) => { addFlightLog({ ...data, operationId: operation.id }); setView("detail"); }}
          onCancel={() => setView("detail")}
        />
      )}

      {view === "detail" && operation && (
        <OperationDetail
          operation={operation}
          operationFlights={operationFlights}
          operationPermission={operationPermission}
          getTeamNames={getTeamNames}
          getEquipmentNames={getEquipmentNames}
          onEdit={() => setView("editOp")}
          onAddPermission={() => setView("addPermission")}
          onEditPermission={() => setView("editPermission")}
          onDeletePermission={() => { if (operationPermission) deleteFlightPermission(operationPermission.id); }}
          onAddFlightLog={() => setView("addFlightLog")}
          onAddDeliverable={(del) => addDeliverable(operation.id, del)}
          onRemoveDeliverable={(delId) => removeDeliverable(operation.id, delId)}
          onStatusChange={(status) => updateOperation(operation.id, { status })}
          onDelete={onDelete ? () => { onDelete(operation.id); onClose(); } : undefined}
        />
      )}
    </Modal>
  );
}

interface OperationDetailProps {
  operation: Operation;
  operationFlights: FlightLog[];
  operationPermission: FlightPermission | undefined;
  getTeamNames: (ids: string[]) => string;
  getEquipmentNames: (ids: string[]) => string;
  onEdit: () => void;
  onAddPermission: () => void;
  onEditPermission: () => void;
  onDeletePermission: () => void;
  onAddFlightLog: () => void;
  onAddDeliverable: (del: Omit<Deliverable, "id">) => void;
  onRemoveDeliverable: (id: string) => void;
  onStatusChange: (status: OperationStatus) => void;
  onDelete?: () => void;
}

function OperationDetail({
  operation, operationFlights, operationPermission,
  getTeamNames, getEquipmentNames,
  onEdit, onAddPermission, onEditPermission, onDeletePermission,
  onAddFlightLog, onAddDeliverable, onRemoveDeliverable, onStatusChange, onDelete,
}: OperationDetailProps) {
  const perm = operationPermission;
  const flights = operationFlights;

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <OperationTimeline currentStatus={operation.status} />

      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={OPERATION_STATUS_VARIANTS[operation.status]}>{OPERATION_STATUS_LABELS[operation.status]}</Badge>
        <Badge>{OPERATION_TYPE_LABELS[operation.type]}</Badge>
        <span className="text-xs text-[var(--muted-foreground)]">
          {OPERATION_PRIORITY_LABELS[operation.priority]} Öncelik
        </span>
      </div>

      {/* Hızlı Durum Değiştirme */}
      <QuickStatusBar currentStatus={operation.status} onStatusChange={onStatusChange} />

      {operation.description && <p className="text-sm text-[var(--foreground)]">{operation.description}</p>}

      {/* Uçuş İzni */}
      <div className="pt-3 border-t border-[var(--border)]">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Uçuş İzni</h4>
          {!perm && <button onClick={onAddPermission} className="text-xs text-[var(--accent)] hover:underline">+ İzin Ekle</button>}
        </div>
        {perm ? (
          <div className={`rounded-md p-3 border ${
            perm.status === "onaylandi" ? "border-green-500/30 bg-green-500/5" :
            perm.status === "reddedildi" ? "border-red-500/30 bg-red-500/5" :
            "border-yellow-500/30 bg-yellow-500/5"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <Badge variant={perm.status === "onaylandi" ? "success" : perm.status === "reddedildi" ? "danger" : "warning"}>
                  {PERMISSION_STATUS_LABELS[perm.status]}
                </Badge>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  {perm.hsdNumber ?? "HSD"} · {perm.startDate} — {perm.endDate}
                </p>
              </div>
              <div className="flex gap-1">
                <button onClick={onEditPermission} className="text-xs text-[var(--accent)] hover:underline">Düzenle</button>
                <button onClick={onDeletePermission} className="text-xs text-red-500 hover:underline ml-2">Sil</button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[var(--muted-foreground)]">Henüz izin eklenmemiş</p>
        )}
      </div>

      {/* Konum */}
      {operation.location.il && (
        <div className="rounded-md bg-[var(--background)] p-3">
          <span className="text-xs text-[var(--muted-foreground)] font-semibold">Konum</span>
          <p className="text-sm text-[var(--foreground)] mt-1">
            {[operation.location.il, operation.location.ilce, operation.location.mahalle].filter(Boolean).join(" / ")}
          </p>
          {operation.location.alan && (
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Alan: {operation.location.alan.toLocaleString()} {operation.location.alanBirimi ?? "m²"}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-sm">
        {operation.requester && <InfoField label="Talep Eden" value={operation.requester} />}
        {operation.startDate && <InfoField label="Başlangıç" value={operation.startDate} />}
      </div>

      {operation.assignedTeam.length > 0 && <InfoField label="Ekip" value={getTeamNames(operation.assignedTeam)} />}
      {operation.assignedEquipment.length > 0 && <InfoField label="Ekipman" value={getEquipmentNames(operation.assignedEquipment)} />}
      {operation.notes && <InfoField label="Notlar" value={operation.notes} />}

      {/* Uçuş Kayıtları */}
      <div className="pt-3 border-t border-[var(--border)]">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
            Uçuş Kayıtları ({flights.length})
          </h4>
          <button onClick={onAddFlightLog} className="text-xs text-[var(--accent)] hover:underline">+ Kayıt Ekle</button>
        </div>
        {flights.length > 0 ? (
          <div className="space-y-1.5">
            {flights.map((fl) => (
              <div key={fl.id} className="text-xs flex justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                <div>
                  <span className="text-[var(--foreground)]">{fl.date}</span>
                  <span className="text-[var(--muted-foreground)] ml-2">{fl.pilotName ?? ""}</span>
                </div>
                <span className="text-[var(--muted-foreground)]">{fl.equipmentName ?? ""}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--muted-foreground)]">Henüz kayıt yok</p>
        )}
      </div>

      <OperationDeliverables
        deliverables={operation.deliverables}
        onAdd={onAddDeliverable}
        onRemove={onRemoveDeliverable}
      />

      <div className="flex gap-2 pt-2">
        <Button onClick={onEdit}>Düzenle</Button>
        {onDelete && <Button variant="danger" onClick={onDelete}>Sil</Button>}
      </div>
    </div>
  );
}

function InfoField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
      <p className={`text-sm text-[var(--foreground)] ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

const STATUS_FLOW: OperationStatus[] = ["talep", "planlama", "saha", "isleme", "kontrol", "teslim"];

function QuickStatusBar({ currentStatus, onStatusChange }: { currentStatus: OperationStatus; onStatusChange: (s: OperationStatus) => void }) {
  if (currentStatus === "iptal" || currentStatus === "teslim") return null;
  const currentIdx = STATUS_FLOW.indexOf(currentStatus);

  return (
    <div className="flex gap-1.5 flex-wrap">
      {STATUS_FLOW.map((s, i) => {
        const isCurrent = s === currentStatus;
        const isPast = i < currentIdx;
        return (
          <button
            key={s}
            onClick={() => { if (!isCurrent) onStatusChange(s); }}
            disabled={isCurrent}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
              isCurrent
                ? "ring-2 ring-offset-1 ring-offset-[var(--background)]"
                : isPast
                  ? "opacity-50 hover:opacity-80"
                  : "hover:opacity-80"
            }`}
            style={{
              backgroundColor: isCurrent ? statusColors[s] : `${statusColors[s]}20`,
              color: isCurrent ? "white" : statusColors[s],
              ...(isCurrent ? { "--tw-ring-color": statusColors[s] } as React.CSSProperties : {}),
            }}
          >
            {OPERATION_STATUS_LABELS[s]}
          </button>
        );
      })}
    </div>
  );
}
