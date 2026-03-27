"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { OperationForm } from "./OperationForm";
import { OperationTimeline } from "./OperationTimeline";
import { OperationStatusBadge } from "./OperationStatusBadge";
import { OperationDeliverables } from "./OperationDeliverables";
import { useIhaStore } from "../shared/ihaStore";
import type { Operation, Equipment, TeamMember, Deliverable } from "@/types/iha";
import { OPERATION_PRIORITY_LABELS, OPERATION_TYPE_LABELS, PERMISSION_STATUS_LABELS } from "@/types/iha";
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

export function OperationModal({ operation, equipment, team, isOpen, onClose, onSave, onDelete }: OperationModalProps) {
  const [isEditing, setIsEditing] = useState(!operation);
  const { flightLogs, flightPermissions, addDeliverable, removeDeliverable } = useIhaStore();

  const getTeamNames = (ids: string[]) => ids.map((id) => team.find((t) => t.id === id)?.name).filter(Boolean).join(", ");
  const getEquipmentNames = (ids: string[]) => ids.map((id) => equipment.find((e) => e.id === id)?.name).filter(Boolean).join(", ");

  // Related data
  const operationFlights = operation
    ? flightLogs.filter((fl) => fl.operationId === operation.id)
    : [];
  const operationPermission = operation?.permissionId
    ? flightPermissions.find((p) => p.id === operation.permissionId)
    : flightPermissions.find((p) => p.operationId === operation?.id);

  return (
    <Modal open={isOpen} onClose={onClose}>
      <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
        {operation ? operation.title : "Yeni Operasyon"}
      </h2>
      {isEditing ? (
        <OperationForm
          operation={operation}
          equipment={equipment}
          team={team}
          onSave={(data) => { onSave(data); setIsEditing(false); }}
          onCancel={() => { if (operation) setIsEditing(false); else onClose(); }}
        />
      ) : operation ? (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <OperationTimeline currentStatus={operation.status} />

          <div className="flex items-center gap-2 flex-wrap">
            <OperationStatusBadge status={operation.status} />
            <Badge>{OPERATION_TYPE_LABELS[operation.type]}</Badge>
            <span className="text-xs text-[var(--muted-foreground)]">
              {OPERATION_PRIORITY_LABELS[operation.priority]} Öncelik
            </span>
          </div>

          {operation.description && (
            <p className="text-sm text-[var(--foreground)]">{operation.description}</p>
          )}

          {/* İzin Durumu */}
          {operationPermission && (
            <div className={`rounded-md p-3 border ${
              operationPermission.status === "onaylandi" ? "border-green-500/30 bg-green-500/5" :
              operationPermission.status === "reddedildi" ? "border-red-500/30 bg-red-500/5" :
              "border-yellow-500/30 bg-yellow-500/5"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted-foreground)] font-semibold">Uçuş İzni</span>
                <Badge variant={operationPermission.status === "onaylandi" ? "success" : operationPermission.status === "reddedildi" ? "danger" : "warning"}>
                  {PERMISSION_STATUS_LABELS[operationPermission.status]}
                </Badge>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                {operationPermission.hsdNumber ?? "HSD"} · {operationPermission.startDate} — {operationPermission.endDate}
              </p>
            </div>
          )}

          {/* Konum */}
          {operation.location.il && (
            <div className="rounded-md bg-[var(--background)] p-3">
              <span className="text-xs text-[var(--muted-foreground)] font-semibold">Konum</span>
              <p className="text-sm text-[var(--foreground)] mt-1">
                {[operation.location.il, operation.location.ilce, operation.location.mahalle].filter(Boolean).join(" / ")}
              </p>
              {(operation.location.pafta || operation.location.ada) && (
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  {[
                    operation.location.pafta && `Pafta: ${operation.location.pafta}`,
                    operation.location.ada && `Ada: ${operation.location.ada}`,
                    operation.location.parsel && `Parsel: ${operation.location.parsel}`,
                  ].filter(Boolean).join(" · ")}
                </p>
              )}
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
          {operation.dataStoragePath && <InfoField label="Veri Yolu" value={operation.dataStoragePath} mono />}
          {operation.notes && <InfoField label="Notlar" value={operation.notes} />}

          {/* Uçuş Kayıtları */}
          {operationFlights.length > 0 && (
            <div className="pt-3 border-t border-[var(--border)]">
              <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
                Uçuş Kayıtları ({operationFlights.length})
              </h4>
              <div className="space-y-1.5">
                {operationFlights.map((fl) => (
                  <div key={fl.id} className="text-xs flex justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                    <div>
                      <span className="text-[var(--foreground)]">{fl.date}</span>
                      <span className="text-[var(--muted-foreground)] ml-2">{fl.pilotName ?? ""}</span>
                    </div>
                    <span className="text-[var(--muted-foreground)]">{fl.equipmentName ?? ""}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Çıktılar / Teslimat */}
          <OperationDeliverables
            deliverables={operation.deliverables}
            onAdd={(del) => addDeliverable(operation.id, del)}
            onRemove={(delId) => removeDeliverable(operation.id, delId)}
          />

          <div className="flex gap-2 pt-2">
            <Button onClick={() => setIsEditing(true)}>Düzenle</Button>
            {onDelete && (
              <Button variant="danger" onClick={() => { onDelete(operation.id); onClose(); }}>Sil</Button>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
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
