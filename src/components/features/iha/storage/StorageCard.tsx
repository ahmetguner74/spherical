"use client";

import type { StorageUnit } from "@/types/iha";
import { StorageBar } from "./StorageBar";

interface StorageCardProps {
  storage: StorageUnit;
  onEdit: () => void;
}

export function StorageCard({ storage, onEdit }: StorageCardProps) {
  const freeTB = storage.totalCapacityTB - storage.usedCapacityTB;

  return (
    <button
      onClick={onEdit}
      className="w-full text-left rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 hover:bg-[var(--surface-hover)] transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-[var(--foreground)]">
          {storage.name}
        </h3>
        <span className="text-2xl font-bold text-[var(--accent)]">
          {storage.totalCapacityTB} TB
        </span>
      </div>

      <StorageBar
        used={storage.usedCapacityTB}
        total={storage.totalCapacityTB}
      />

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <span className="text-xs text-[var(--muted-foreground)]">Kullanılan</span>
          <p className="text-sm font-medium text-[var(--foreground)]">
            {storage.usedCapacityTB} TB
          </p>
        </div>
        <div>
          <span className="text-xs text-[var(--muted-foreground)]">Boş</span>
          <p className="text-sm font-medium text-[var(--foreground)]">
            {freeTB} TB
          </p>
        </div>
      </div>

      {storage.notes && (
        <p className="text-xs text-[var(--muted-foreground)] mt-3">
          {storage.notes}
        </p>
      )}
    </button>
  );
}
