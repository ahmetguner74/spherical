"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PersonnelForm } from "./PersonnelForm";
import type { TeamMember } from "@/types/iha";

interface PersonnelModalProps {
  member?: TeamMember;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<TeamMember>) => void;
  onDelete?: (id: string) => void;
}

export function PersonnelModal({
  member,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: PersonnelModalProps) {
  const { isAdmin } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Modal open={isOpen} onClose={onClose}>
      <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
        {member ? member.name : "Yeni Personel"}
      </h2>
      <PersonnelForm
        member={member}
        onSave={(updates) => {
          onSave(member?.id ?? "", updates);
          onClose();
        }}
        onCancel={onClose}
      />
      {isAdmin && member && onDelete && (
        <>
          <button
            onClick={() => setConfirmOpen(true)}
            className="mt-4 w-full py-2 text-sm text-[var(--feedback-error)] hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            Personeli Sil
          </button>
          <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={() => { onDelete(member.id); onClose(); }}
            title="Personeli Sil"
            description={`"${member.name}" kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
          />
        </>
      )}
    </Modal>
  );
}
