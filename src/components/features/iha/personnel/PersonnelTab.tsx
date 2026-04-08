"use client";

import { useState } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { PersonnelCard } from "./PersonnelCard";
import { PersonnelModal } from "./PersonnelModal";
import type { TeamMember } from "@/types/iha";

export function PersonnelTab() {
  const { team, operations, addTeamMember, updateTeamMember, deleteTeamMember } =
    useIhaStore();

  const [selectedMember, setSelectedMember] = useState<
    TeamMember | undefined
  >();
  const [isMemberOpen, setIsMemberOpen] = useState(false);

  const getOperation = (opId?: string) =>
    opId ? operations.find((op) => op.id === opId) : undefined;

  const handleAdd = () => {
    setSelectedMember(undefined);
    setIsMemberOpen(true);
  };

  const handleSave = (id: string, updates: Partial<TeamMember>) => {
    if (selectedMember) {
      updateTeamMember(id, updates);
    } else {
      addTeamMember(updates as Omit<TeamMember, "id">);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleAdd}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          + Yeni Personel
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((member) => (
          <PersonnelCard
            key={member.id}
            member={member}
            currentOperation={getOperation(member.currentOperationId)}
            onClick={() => {
              setSelectedMember(member);
              setIsMemberOpen(true);
            }}
          />
        ))}
      </div>

      <PersonnelModal
        member={selectedMember}
        isOpen={isMemberOpen}
        onClose={() => setIsMemberOpen(false)}
        onSave={handleSave}
        onDelete={deleteTeamMember}
      />
    </div>
  );
}
