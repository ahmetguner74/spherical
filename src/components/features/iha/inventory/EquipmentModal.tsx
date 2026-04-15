"use client";

import { useState } from "react";
import { usePermission } from "@/hooks/usePermission";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EquipmentForm } from "./EquipmentForm";
import { EquipmentCheckout } from "./EquipmentCheckout";
import { MaintenanceList } from "./MaintenanceList";
import { AttachmentList } from "./AttachmentList";
import type { Equipment, CheckoutEntry, TeamMember } from "@/types/iha";

interface EquipmentModalProps {
  equipment?: Equipment;
  team: TeamMember[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Equipment, "id">) => void;
  onDelete?: (id: string) => void;
  onCheckout: (equipmentId: string, entry: Omit<CheckoutEntry, "id">) => void;
  onReturn: (equipmentId: string, entryId: string) => void;
}

export function EquipmentModal({
  equipment, team, isOpen, onClose, onSave, onDelete, onCheckout, onReturn,
}: EquipmentModalProps) {
  const can = usePermission();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Modal open={isOpen} onClose={onClose}>
      <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
        {equipment ? equipment.name : "Yeni Ekipman"}
      </h2>
      <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-6">
        <EquipmentForm
          equipment={equipment}
          onSave={(data) => { onSave(data); if (!equipment) onClose(); }}
          onCancel={onClose}
        />

        {equipment && (
          <>
            <EquipmentCheckout
              equipment={equipment}
              team={team}
              onCheckout={onCheckout}
              onReturn={onReturn}
            />
            <MaintenanceList equipmentId={equipment.id} equipmentName={equipment.name} />
            <AttachmentList parentTable="equipment" parentId={equipment.id} label={`Dosya Ekleri — ${equipment.name}`} />

            {can("inventory.delete") && onDelete && (
              <div className="pt-2 border-t border-[var(--border)]">
                <Button variant="danger" onClick={() => setConfirmOpen(true)} className="mt-3">Sil</Button>
              </div>
            )}
          </>
        )}
      </div>

      {onDelete && equipment && (
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => { onDelete(equipment.id); onClose(); }}
          title="Ekipmanı Sil"
          description={`"${equipment.name}" kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
        />
      )}
    </Modal>
  );
}
