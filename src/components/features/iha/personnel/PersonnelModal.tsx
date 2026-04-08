"use client";

import { Modal } from "@/components/ui/Modal";
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
      {member && onDelete && (
        <button
          onClick={() => {
            if (confirm(`${member.name} silinsin mi?`)) {
              onDelete(member.id);
              onClose();
            }
          }}
          className="mt-4 w-full py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          Personeli Sil
        </button>
      )}
    </Modal>
  );
}
