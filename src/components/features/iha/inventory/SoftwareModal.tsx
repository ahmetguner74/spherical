"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SoftwareForm } from "./SoftwareForm";
import type { Software } from "@/types/iha";

interface SoftwareModalProps {
  software?: Software;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Software, "id">) => void;
  onDelete?: (id: string) => void;
}

const LICENSE_LABELS: Record<string, string> = {
  perpetual: "Kalıcı",
  subscription: "Abonelik",
  free: "Ücretsiz",
};

export function SoftwareModal({
  software,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: SoftwareModalProps) {
  const [isEditing, setIsEditing] = useState(!software);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Modal open={isOpen} onClose={onClose}>
      <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
        {software ? software.name : "Yeni Yazılım"}
      </h2>
      {isEditing ? (
        <SoftwareForm
          software={software}
          onSave={(data) => {
            onSave(data);
            setIsEditing(false);
            if (!software) onClose();
          }}
          onCancel={() => {
            if (software) setIsEditing(false);
            else onClose();
          }}
        />
      ) : software ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                software.licenseType === "free"
                  ? "success"
                  : software.licenseType === "subscription"
                    ? "warning"
                    : "default"
              }
            >
              {LICENSE_LABELS[software.licenseType]}
            </Badge>
            {software.version && (
              <span className="text-xs text-[var(--muted-foreground)]">
                v{software.version}
              </span>
            )}
          </div>

          {software.licenseExpiry && (
            <div>
              <span className="text-xs text-[var(--muted-foreground)]">
                Lisans Bitiş
              </span>
              <p className="text-sm text-[var(--foreground)]">
                {software.licenseExpiry}
              </p>
            </div>
          )}

          {software.notes && (
            <div>
              <span className="text-xs text-[var(--muted-foreground)]">Notlar</span>
              <p className="text-sm text-[var(--foreground)]">{software.notes}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button onClick={() => setIsEditing(true)}>Düzenle</Button>
            {onDelete && (
              <Button variant="danger" onClick={() => setConfirmOpen(true)}>Sil</Button>
            )}
          </div>
          {onDelete && (
            <ConfirmDialog
              open={confirmOpen}
              onClose={() => setConfirmOpen(false)}
              onConfirm={() => { onDelete(software.id); onClose(); }}
              title="Yazılımı Sil"
              description={`"${software.name}" kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
            />
          )}
        </div>
      ) : null}
    </Modal>
  );
}
