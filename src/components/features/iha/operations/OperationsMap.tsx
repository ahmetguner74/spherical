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
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
        <span>{opsWithLocation.length} / {operations.length} konumlu</span>
        {flightPermissions.filter((p) => p.status === "onaylandi").length > 0 && (
          <span className="text-green-500">Yeşil alan = izin bölgesi</span>
        )}
      </div>

      <MapOperations
        operations={operations}
        permissions={flightPermissions}
        onSelectOperation={onSelect}
        className="h-64 sm:h-80 md:h-96 w-full rounded-lg"
      />

      {opsWithLocation.length === 0 && (
        <p className="text-xs text-[var(--muted-foreground)] text-center">
          Operasyonlara koordinat ekleyerek haritada görünmelerini sağlayın.
        </p>
      )}
    </div>
  );
}
