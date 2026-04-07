"use client";

import { useState } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { PersonnelCard } from "../personnel/PersonnelCard";
import { PersonnelModal } from "../personnel/PersonnelModal";
import { StorageCard } from "../storage/StorageCard";
import { StorageForm } from "../storage/StorageForm";
import { StorageFolderList } from "../storage/StorageFolderList";
import { Modal } from "@/components/ui/Modal";
import type { TeamMember, StorageUnit } from "@/types/iha";

type SettingsSection = "personnel" | "storage";

export function SettingsTab() {
  const {
    team, operations, storage,
    updateTeamMember, updateStorage, addStorageFolder, removeStorageFolder,
  } = useIhaStore();

  const [section, setSection] = useState<SettingsSection>("personnel");
  const [selectedMember, setSelectedMember] = useState<TeamMember | undefined>();
  const [isMemberOpen, setIsMemberOpen] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState<StorageUnit | undefined>();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFolderOpen, setIsFolderOpen] = useState(false);

  const getOperation = (opId?: string) =>
    opId ? operations.find((op) => op.id === opId) : undefined;

  const totalCapacity = storage.reduce((sum, s) => sum + s.totalCapacityTB, 0);
  const totalUsed = storage.reduce((sum, s) => sum + s.usedCapacityTB, 0);

  return (
    <div className="space-y-6">
      <div className="flex rounded-md border border-[var(--border)] overflow-hidden w-fit">
        <SectionBtn active={section === "personnel"} onClick={() => setSection("personnel")}>
          Personel ({team.length})
        </SectionBtn>
        <SectionBtn active={section === "storage"} onClick={() => setSection("storage")}>
          Depolama ({totalUsed}/{totalCapacity} TB)
        </SectionBtn>
      </div>

      {section === "personnel" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map((member) => (
            <PersonnelCard
              key={member.id}
              member={member}
              currentOperation={getOperation(member.currentOperationId)}
              onClick={() => { setSelectedMember(member); setIsMemberOpen(true); }}
            />
          ))}
        </div>
      )}

      {section === "storage" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {storage.map((s) => (
            <StorageCard
              key={s.id}
              storage={s}
              onEdit={() => { setSelectedStorage(s); setIsEditOpen(true); }}
              onViewFolders={() => { setSelectedStorage(s); setIsFolderOpen(true); }}
            />
          ))}
        </div>
      )}

      <PersonnelModal
        member={selectedMember}
        isOpen={isMemberOpen}
        onClose={() => setIsMemberOpen(false)}
        onSave={updateTeamMember}
      />

      {selectedStorage && (
        <>
          <Modal open={isEditOpen} onClose={() => setIsEditOpen(false)}>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
              {selectedStorage.name} Düzenle
            </h2>
            <StorageForm
              storage={selectedStorage}
              onSave={(updates) => { updateStorage(selectedStorage.id, updates); setIsEditOpen(false); }}
              onCancel={() => setIsEditOpen(false)}
            />
          </Modal>
          <Modal open={isFolderOpen} onClose={() => setIsFolderOpen(false)}>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
              {selectedStorage.name} — Klasörler
            </h2>
            <StorageFolderList
              storage={selectedStorage}
              onAddFolder={(folder) => addStorageFolder(selectedStorage.id, folder)}
              onRemoveFolder={(folderId) => removeStorageFolder(selectedStorage.id, folderId)}
            />
          </Modal>
        </>
      )}
    </div>
  );
}

function SectionBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm ${
        active
          ? "bg-[var(--accent)] text-white"
          : "bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--surface)]"
      }`}
    >
      {children}
    </button>
  );
}
