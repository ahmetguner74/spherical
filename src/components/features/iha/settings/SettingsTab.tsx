"use client";

import { useMemo, useState } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { usePermission } from "@/hooks/usePermission";
import { StorageCard } from "../storage/StorageCard";
import { StorageForm } from "../storage/StorageForm";
import { StorageFolderList } from "../storage/StorageFolderList";
import { UserManagement } from "./UserManagement";
import { Modal } from "@/components/ui/Modal";
import type { StorageUnit } from "@/types/iha";

// ─── Alt sekme tipleri ───

type SettingsSubTab = "depolama" | "kullanicilar";

const ALL_SUB_TABS: { key: SettingsSubTab; label: string; permission?: "settings.users" }[] = [
  { key: "depolama", label: "Depolama" },
  { key: "kullanicilar", label: "Kullanıcı Yönetimi", permission: "settings.users" },
];

// ─── Component ───

export function SettingsTab() {
  const can = usePermission();
  const subTabs = useMemo(
    () => ALL_SUB_TABS.filter((t) => !t.permission || can(t.permission)),
    [can]
  );
  const [subTab, setSubTab] = useState<SettingsSubTab>("depolama");

  return (
    <div className="space-y-4">
      {/* Alt sekme navigasyonu */}
      <div className="flex gap-1 border-b border-[var(--border)]">
        {subTabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setSubTab(t.key)}
            className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              subTab === t.key
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* İçerik */}
      {subTab === "depolama" && <StorageContent />}
      {subTab === "kullanicilar" && can("settings.users") && <UserManagement />}
    </div>
  );
}

// ─── Depolama İçeriği (eski SettingsTab içeriği) ───

function StorageContent() {
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
