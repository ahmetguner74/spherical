"use client";

import { useState } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { StorageCard } from "./StorageCard";
import { StorageForm } from "./StorageForm";
import { Modal } from "@/components/ui/Modal";
import type { StorageUnit } from "@/types/iha";

export function StorageTab() {
  const { storage, updateStorage } = useIhaStore();
  const [selectedStorage, setSelectedStorage] = useState<StorageUnit | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
              setIsModalOpen(true);
            }}
          />
        ))}
      </div>

      {selectedStorage && (
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
            {selectedStorage.name} Düzenle
          </h2>
          <StorageForm
            storage={selectedStorage}
            onSave={(updates) => {
              updateStorage(selectedStorage.id, updates);
              setIsModalOpen(false);
            }}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
