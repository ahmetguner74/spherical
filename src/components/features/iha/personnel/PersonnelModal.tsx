"use client";

import { Modal } from "@/components/ui/Modal";
import { PersonnelForm } from "./PersonnelForm";
import type { TeamMember } from "@/types/iha";

interface PersonnelModalProps {
  member?: TeamMember;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<TeamMember>) => void;
}

export function PersonnelModal({
  member,
  isOpen,
  onClose,
  onSave,
}: PersonnelModalProps) {
  if (!member) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
        {member.name}
      </h2>
      <PersonnelForm
        member={member}
        onSave={(updates) => {
          onSave(member.id, updates);
          onClose();
        }}
        onCancel={onClose}
      />
    </Modal>
  );
}
