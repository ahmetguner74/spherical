"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EquipmentForm } from "./EquipmentForm";
import { EquipmentCheckout } from "./EquipmentCheckout";
import { MaintenanceList } from "./MaintenanceList";
import { AttachmentList } from "./AttachmentList";
import type { Equipment, CheckoutEntry, TeamMember } from "@/types/iha";
import { EQUIPMENT_CATEGORY_LABELS, EQUIPMENT_STATUS_LABELS } from "@/types/iha";

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
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(!equipment);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Modal open={isOpen} onClose={onClose}>
      <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
        {equipment ? equipment.name : "Yeni Ekipman"}
      </h2>
      {isEditing ? (
        <EquipmentForm
          equipment={equipment}
          onSave={(data) => { onSave(data); setIsEditing(false); if (!equipment) onClose(); }}
          onCancel={() => { if (equipment) setIsEditing(false); else onClose(); }}
        />
      ) : equipment ? (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge>{EQUIPMENT_CATEGORY_LABELS[equipment.category]}</Badge>
            <Badge variant={equipment.status === "musait" ? "success" : equipment.status === "ariza" ? "danger" : "warning"}>
              {EQUIPMENT_STATUS_LABELS[equipment.status]}
            </Badge>
            {equipment.ownership === "odunc" && <Badge variant="info">Ödünç</Badge>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <InfoField label="Model" value={equipment.model} />
            <InfoField label="Seri No" value={equipment.serialNumber} />
            <InfoField label="Sigorta Bitiş" value={equipment.insuranceExpiry} />
            <InfoField label="Durum" value={equipment.condition ? ({ mukemmel: "Mükemmel", iyi: "İyi", orta: "Orta", kotu: "Kötü" })[equipment.condition] : undefined} />
            {equipment.category === "drone" && (
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
                {equipment.accessories.map((acc) => <Badge key={acc}>{acc}</Badge>)}
              </div>
            </div>
          )}

          {equipment.notes && (
            <div>
              <span className="text-xs text-[var(--muted-foreground)]">Notlar</span>
              <p className="text-sm text-[var(--foreground)] mt-0.5">{equipment.notes}</p>
            </div>
          )}

          {/* Zimmet Bölümü */}
          <EquipmentCheckout
            equipment={equipment}
            team={team}
            onCheckout={onCheckout}
            onReturn={onReturn}
          />

          {/* Bakım Kayıtları — Supabase'de var, UI'da yoktu */}
          <MaintenanceList equipmentId={equipment.id} equipmentName={equipment.name} />

          {/* Dosya Ekleri — Supabase'de var, UI'da yoktu */}
          <AttachmentList parentTable="equipment" parentId={equipment.id} label={`Dosya Ekleri — ${equipment.name}`} />

          <div className="flex gap-2 pt-2">
            <Button onClick={() => setIsEditing(true)}>Düzenle</Button>
            {isAdmin && onDelete && (
              <Button variant="danger" onClick={() => setConfirmOpen(true)}>Sil</Button>
            )}
          </div>
          {onDelete && (
            <ConfirmDialog
              open={confirmOpen}
              onClose={() => setConfirmOpen(false)}
              onConfirm={() => { onDelete(equipment.id); onClose(); }}
              title="Ekipmanı Sil"
              description={`"${equipment.name}" kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
            />
          )}
        </div>
      ) : null}
    </Modal>
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
