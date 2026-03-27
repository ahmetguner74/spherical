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

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        <LegendDot color="#6b7280" label="Talep" />
        <LegendDot color="#eab308" label="Planlama" />
        <LegendDot color="#22c55e" label="Saha" />
        <LegendDot color="#f97316" label="İşleme" />
        <LegendDot color="#3b82f6" label="Kontrol" />
        <LegendDot color="#10b981" label="Teslim" />
      </div>

      {opsWithLocation.length === 0 && (
        <p className="text-xs text-[var(--muted-foreground)] text-center">
          Operasyonlara koordinat ekleyerek haritada görünmelerini sağlayın.
        </p>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-3 h-3 rounded-full border-2 border-white"
        style={{ backgroundColor: color, boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
      />
      <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
    </div>
  );
}
