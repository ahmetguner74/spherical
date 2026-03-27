"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { OperationForm } from "./OperationForm";
import { OperationTimeline } from "./OperationTimeline";
import { OperationStatusBadge } from "./OperationStatusBadge";
import type { Operation, Equipment, TeamMember } from "@/types/iha";
import { OPERATION_PRIORITY_LABELS } from "@/types/iha";
import { useState } from "react";

interface OperationModalProps {
  operation?: Operation;
  equipment: Equipment[];
  team: TeamMember[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Operation, "id" | "createdAt" | "updatedAt">) => void;
  onDelete?: (id: string) => void;
}

export function OperationModal({
  operation,
  equipment,
  team,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: OperationModalProps) {
  const [isEditing, setIsEditing] = useState(!operation);

  const getTeamNames = (ids: string[]) =>
    ids
      .map((id) => team.find((t) => t.id === id)?.name)
      .filter(Boolean)
      .join(", ");

  const getEquipmentNames = (ids: string[]) =>
    ids
      .map((id) => equipment.find((e) => e.id === id)?.name)
      .filter(Boolean)
      .join(", ");

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
          onSave={(data) => {
            onSave(data);
            setIsEditing(false);
          }}
          onCancel={() => {
            if (operation) setIsEditing(false);
            else onClose();
          }}
        />
      ) : operation ? (
        <div className="space-y-4">
          <OperationTimeline currentStatus={operation.status} />

          <div className="flex items-center gap-2">
            <OperationStatusBadge status={operation.status} />
            <span className="text-xs text-[var(--muted-foreground)]">
              {OPERATION_PRIORITY_LABELS[operation.priority]} Öncelik
            </span>
          </div>

          {operation.description && (
            <p className="text-sm text-[var(--foreground)]">
              {operation.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            {operation.requester && (
              <div>
                <span className="text-xs text-[var(--muted-foreground)]">
                  Talep Eden
                </span>
                <p className="text-[var(--foreground)]">{operation.requester}</p>
              </div>
            )}
            {operation.startDate && (
              <div>
                <span className="text-xs text-[var(--muted-foreground)]">
                  Başlangıç
                </span>
                <p className="text-[var(--foreground)]">{operation.startDate}</p>
              </div>
            )}
          </div>

          {operation.assignedTeam.length > 0 && (
            <div>
              <span className="text-xs text-[var(--muted-foreground)]">Ekip</span>
              <p className="text-sm text-[var(--foreground)]">
                {getTeamNames(operation.assignedTeam)}
              </p>
            </div>
          )}

          {operation.assignedEquipment.length > 0 && (
            <div>
              <span className="text-xs text-[var(--muted-foreground)]">
                Ekipman
              </span>
              <p className="text-sm text-[var(--foreground)]">
                {getEquipmentNames(operation.assignedEquipment)}
              </p>
            </div>
          )}

          {operation.dataStoragePath && (
            <div>
              <span className="text-xs text-[var(--muted-foreground)]">
                Veri Yolu
              </span>
              <p className="text-sm text-[var(--foreground)] font-mono">
                {operation.dataStoragePath}
              </p>
            </div>
          )}

          {operation.outputDescription && (
            <div>
              <span className="text-xs text-[var(--muted-foreground)]">Çıktı</span>
              <p className="text-sm text-[var(--foreground)]">
                {operation.outputDescription}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button onClick={() => setIsEditing(true)}>Düzenle</Button>
            {onDelete && (
              <Button
                variant="danger"
                onClick={() => {
                  onDelete(operation.id);
                  onClose();
                }}
              >
                Sil
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
