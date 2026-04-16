"use client";

import { useState } from "react";
import { usePermission } from "@/hooks/usePermission";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
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

export function SoftwareModal({
  software,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: SoftwareModalProps) {
  const can = usePermission();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Modal open={isOpen} onClose={onClose}>
      <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
        {software ? software.name : "Yeni Yazılım"}
      </h2>
      <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-6">
        <SoftwareForm
          software={software}
          onSave={(data) => { onSave(data); if (!software) onClose(); }}
          onCancel={onClose}
        />

        {software && can("inventory.delete") && onDelete && (
          <div className="pt-2 border-t border-[var(--border)]">
            <Button variant="danger" onClick={() => setConfirmOpen(true)} className="mt-3">Sil</Button>
          </div>
        )}
      </div>

      {onDelete && software && (
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => { onDelete(software.id); onClose(); }}
          title="Yazılımı Sil"
          description={`"${software.name}" kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
        />
      )}
    </Modal>
  );
}
