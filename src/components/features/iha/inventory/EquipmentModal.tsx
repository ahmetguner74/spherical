"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EquipmentForm } from "./EquipmentForm";
import type { Equipment } from "@/types/iha";
import { EQUIPMENT_CATEGORY_LABELS, EQUIPMENT_STATUS_LABELS } from "@/types/iha";

interface EquipmentModalProps {
  equipment?: Equipment;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Equipment, "id">) => void;
  onDelete?: (id: string) => void;
}

export function EquipmentModal({
  equipment,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EquipmentModalProps) {
  const [isEditing, setIsEditing] = useState(!equipment);

  return (
    <Modal open={isOpen} onClose={onClose}>
      <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
        {equipment ? equipment.name : "Yeni Ekipman"}
      </h2>
      {isEditing ? (
        <EquipmentForm
          equipment={equipment}
          onSave={(data) => {
            onSave(data);
            setIsEditing(false);
            if (!equipment) onClose();
          }}
          onCancel={() => {
            if (equipment) setIsEditing(false);
            else onClose();
          }}
        />
      ) : equipment ? (
        <EquipmentDetailView
          equipment={equipment}
          onEdit={() => setIsEditing(true)}
          onDelete={onDelete}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  );
}

function EquipmentDetailView({
  equipment,
  onEdit,
  onDelete,
  onClose,
}: {
  equipment: Equipment;
  onEdit: () => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}) {
  const isDrone = equipment.category === "drone";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge>{EQUIPMENT_CATEGORY_LABELS[equipment.category]}</Badge>
        <Badge
          variant={
            equipment.status === "musait"
              ? "success"
              : equipment.status === "ariza"
                ? "danger"
                : "warning"
          }
        >
          {EQUIPMENT_STATUS_LABELS[equipment.status]}
        </Badge>
        {equipment.ownership === "odunc" && <Badge variant="info">Ödünç</Badge>}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <InfoField label="Model" value={equipment.model} />
        <InfoField label="Seri No" value={equipment.serialNumber} />
        <InfoField label="Elinde Olan" value={equipment.currentHolder} />
        <InfoField label="Sigorta Bitiş" value={equipment.insuranceExpiry} />
        {isDrone && (
          <>
            <InfoField label="Uçuş Saati" value={equipment.flightHours?.toString()} />
            <InfoField label="Batarya" value={equipment.batteryCount?.toString()} />
          </>
        )}
      </div>

      {equipment.accessories && equipment.accessories.length > 0 && (
        <div>
          <span className="text-xs text-[var(--muted-foreground)]">Aksesuarlar</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {equipment.accessories.map((acc) => (
              <Badge key={acc}>{acc}</Badge>
            ))}
          </div>
        </div>
      )}

      {equipment.notes && (
        <div>
          <span className="text-xs text-[var(--muted-foreground)]">Notlar</span>
          <p className="text-sm text-[var(--foreground)] mt-0.5">{equipment.notes}</p>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button onClick={onEdit}>Düzenle</Button>
        {onDelete && (
          <Button
            variant="danger"
            onClick={() => {
              onDelete(equipment.id);
              onClose();
            }}
          >
            Sil
          </Button>
        )}
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
      <p className="text-[var(--foreground)]">{value}</p>
    </div>
  );
}
