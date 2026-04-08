"use client";

import { useState } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { StorageCard } from "../storage/StorageCard";
import { StorageForm } from "../storage/StorageForm";
import { StorageFolderList } from "../storage/StorageFolderList";
import { Modal } from "@/components/ui/Modal";
import { AuditLogList } from "./AuditLogList";
import type { StorageUnit } from "@/types/iha";

export function SettingsTab() {
  const { storage, updateStorage, addStorageFolder, removeStorageFolder } =
    useIhaStore();

  const [selectedStorage, setSelectedStorage] = useState<StorageUnit | undefined>();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFolderOpen, setIsFolderOpen] = useState(false);

  return (
    <div className="space-y-6">
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

      {/* İşlem Geçmişi — Supabase'de var, UI'da yoktu */}
      <AuditLogList />

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
