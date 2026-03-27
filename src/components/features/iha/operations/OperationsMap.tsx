"use client";

import type { Operation } from "@/types/iha";
import { OPERATION_STATUS_LABELS, OPERATION_TYPE_LABELS } from "@/types/iha";

interface OperationsMapProps {
  operations: Operation[];
  onSelect: (op: Operation) => void;
}

export function OperationsMap({ operations, onSelect }: OperationsMapProps) {
  const opsWithLocation = operations.filter((op) => op.location.lat && op.location.lng);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          Harita Görünümü
        </h3>
        <span className="text-xs text-[var(--muted-foreground)]">
          {opsWithLocation.length} / {operations.length} konumlu
        </span>
      </div>

      {opsWithLocation.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <p className="text-sm">Koordinatı olan operasyon yok.</p>
          <p className="text-xs mt-1">Operasyon oluştururken enlem/boylam girin.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-center py-8 text-xs text-[var(--muted-foreground)] border border-dashed border-[var(--border)] rounded-lg">
            Leaflet harita entegrasyonu ileride eklenecek.
            <br />
            Şimdilik konum listesi:
          </div>
          <div className="space-y-2 mt-4">
            {opsWithLocation.map((op) => (
              <button
                key={op.id}
                onClick={() => onSelect(op)}
                className="w-full text-left flex items-center justify-between p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{op.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {op.location.il}/{op.location.ilce} · {op.location.lat?.toFixed(4)}, {op.location.lng?.toFixed(4)}
                  </p>
                </div>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {OPERATION_TYPE_LABELS[op.type]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
