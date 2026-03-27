"use client";

import { MapOperations } from "../map";
import { useIhaStore } from "../shared/ihaStore";
import type { Operation } from "@/types/iha";

interface OperationsMapViewProps {
  operations: Operation[];
  onSelect: (op: Operation) => void;
}

export function OperationsMap({ operations, onSelect }: OperationsMapViewProps) {
  const { flightPermissions } = useIhaStore();

  const opsWithLocation = operations.filter(
    (op) => op.location.lat && op.location.lng
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--muted-foreground)]">
          {opsWithLocation.length} / {operations.length} konumlu operasyon
        </span>
        {flightPermissions.filter((p) => p.status === "onaylandi").length > 0 && (
          <span className="text-xs text-green-500">
            Yeşil alan = aktif uçuş izin bölgesi
          </span>
        )}
      </div>

      <MapOperations
        operations={operations}
        permissions={flightPermissions}
        onSelectOperation={onSelect}
        className="h-[28rem] w-full rounded-lg"
      />

      {opsWithLocation.length === 0 && (
        <p className="text-xs text-[var(--muted-foreground)] text-center">
          Operasyonlara koordinat ekleyerek haritada görünmelerini sağlayın.
        </p>
      )}
    </div>
  );
}
