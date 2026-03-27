"use client";

import { useState } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { StorageCard } from "./StorageCard";
import { StorageForm } from "./StorageForm";
import { StorageFolderList } from "./StorageFolderList";
import { Modal } from "@/components/ui/Modal";
import type { StorageUnit } from "@/types/iha";

export function StorageTab() {
  const { storage, updateStorage, addStorageFolder, removeStorageFolder } = useIhaStore();
  const [selectedStorage, setSelectedStorage] = useState<StorageUnit | undefined>();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFolderOpen, setIsFolderOpen] = useState(false);

  const totalCapacity = storage.reduce((sum, s) => sum + s.totalCapacityTB, 0);
  const totalUsed = storage.reduce((sum, s) => sum + s.usedCapacityTB, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">
          Depolama Birimleri
        </h2>
        <span className="text-xs text-[var(--muted-foreground)]">
          Toplam: {totalUsed} / {totalCapacity} TB
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {storage.map((s) => (
          <StorageCard
            key={s.id}
            storage={s}
            onEdit={() => {
              setSelectedStorage(s);
              setIsEditOpen(true);
            }}
            onViewFolders={() => {
              setSelectedStorage(s);
              setIsFolderOpen(true);
            }}
          />
        ))}
      </div>

      {/* Edit Modal */}
      {selectedStorage && (
        <Modal open={isEditOpen} onClose={() => setIsEditOpen(false)}>
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
            {selectedStorage.name} Düzenle
          </h2>
          <StorageForm
            storage={selectedStorage}
            onSave={(updates) => {
              updateStorage(selectedStorage.id, updates);
              setIsEditOpen(false);
            }}
            onCancel={() => setIsEditOpen(false)}
          />
        </Modal>
      )}

      {/* Folder Modal */}
      {selectedStorage && (
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
      )}
    </div>
  );
}
