"use client";

import type { StorageUnit } from "@/types/iha";
import { STORAGE_TYPE_LABELS } from "@/types/iha";
import { StorageBar } from "./StorageBar";
import { Badge } from "@/components/ui/Badge";

interface StorageCardProps {
  storage: StorageUnit;
  onEdit: () => void;
  onViewFolders: () => void;
}

export function StorageCard({ storage, onEdit, onViewFolders }: StorageCardProps) {
  const freeTB = storage.totalCapacityTB - storage.usedCapacityTB;
  const folderCount = storage.folders?.length ?? 0;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-[var(--foreground)]">{storage.name}</h3>
          <Badge>{STORAGE_TYPE_LABELS[storage.type]}</Badge>
        </div>
        <span className="text-2xl font-bold text-[var(--accent)]">
          {storage.totalCapacityTB} TB
        </span>
      </div>

      <StorageBar used={storage.usedCapacityTB} total={storage.totalCapacityTB} />

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div>
          <span className="text-xs text-[var(--muted-foreground)]">Kullanılan</span>
          <p className="text-sm font-medium text-[var(--foreground)]">{storage.usedCapacityTB} TB</p>
        </div>
        <div>
          <span className="text-xs text-[var(--muted-foreground)]">Boş</span>
          <p className="text-sm font-medium text-[var(--foreground)]">{freeTB} TB</p>
        </div>
        <div>
          <span className="text-xs text-[var(--muted-foreground)]">Klasör</span>
          <p className="text-sm font-medium text-[var(--foreground)]">{folderCount}</p>
        </div>
      </div>

      {storage.notes && (
        <p className="text-xs text-[var(--muted-foreground)] mt-3">{storage.notes}</p>
      )}

      <div className="flex gap-2 mt-4">
        <button
          onClick={onEdit}
          className="text-xs px-3 py-1.5 rounded-md border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)] transition-colors"
        >
          Düzenle
        </button>
        <button
          onClick={onViewFolders}
          className="text-xs px-3 py-1.5 rounded-md border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
        >
          Klasörler ({folderCount})
        </button>
      </div>
    </div>
  );
}
