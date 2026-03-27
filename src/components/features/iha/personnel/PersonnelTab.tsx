"use client";

import { useState } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { PersonnelCard } from "./PersonnelCard";
import { PersonnelModal } from "./PersonnelModal";
import type { TeamMember } from "@/types/iha";

export function PersonnelTab() {
  const { team, operations, updateTeamMember } = useIhaStore();
  const [selectedMember, setSelectedMember] = useState<TeamMember | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getOperation = (opId?: string) =>
    opId ? operations.find((op) => op.id === opId) : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">
          Ekip ({team.length} kişi)
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((member) => (
          <PersonnelCard
            key={member.id}
            member={member}
            currentOperation={getOperation(member.currentOperationId)}
            onClick={() => {
              setSelectedMember(member);
              setIsModalOpen(true);
            }}
          />
        ))}
      </div>

      <PersonnelModal
        member={selectedMember}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={updateTeamMember}
      />
    </div>
  );
}
