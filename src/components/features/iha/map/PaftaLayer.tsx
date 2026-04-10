"use client";

import { useMemo, useState } from "react";
import { FeatureGroup, GeoJSON } from "react-leaflet";
import type { Feature, Polygon } from "geojson";
import { usePaftaData, type PaftaProperties } from "./usePaftaData";
import { useIhaStore } from "../shared/ihaStore";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { statusColors } from "@/config/tokens";
import { OPERATION_STATUS_LABELS, OPERATION_STATUS_VARIANTS } from "@/types/iha";
import type { Operation } from "@/types/iha";

/**
 * Bursa Paftaları katmanı (5000 ölçekli)
 * - Lazy load GeoJSON
 * - Paftaya tıklayınca o paftadaki operasyonlar listelenir
 * - Operasyonu olan paftalar yeşil (durum renklerine göre)
 */
export function PaftaLayer() {
  const data = usePaftaData();
  const operations = useIhaStore((s) => s.operations);
  const [selectedPafta, setSelectedPafta] = useState<string | null>(null);

  // Pafta adı → operasyon listesi eşleşmesi
  const opsByPafta = useMemo(() => {
    const map = new Map<string, Operation[]>();
    for (const op of operations) {
      const opPaftalar = new Set<string>([
        ...(op.paftalar ?? []),
        ...(op.location?.pafta ? [op.location.pafta] : []),
      ]);
      for (const p of opPaftalar) {
        if (!map.has(p)) map.set(p, []);
        map.get(p)!.push(op);
      }
    }
    return map;
  }, [operations]);

  const selectedOps = selectedPafta ? (opsByPafta.get(selectedPafta) ?? []) : [];

  return (
    <>
      <FeatureGroup>
        {data && (
          <GeoJSON
            key={operations.length} // Operasyon değişince yeniden render
            data={data}
            style={(feature) => {
              const name = (feature?.properties as PaftaProperties | undefined)?.paftaadi;
              const ops = name ? opsByPafta.get(name) ?? [] : [];
              if (ops.length === 0) {
                return {
                  color: "#3b82f6",
                  weight: 1,
                  fillColor: "#3b82f6",
                  fillOpacity: 0.02,
                  opacity: 0.4,
                };
              }
              // Dominant durum rengi
              const dominantStatus = getDominantStatus(ops);
              const color = statusColors[dominantStatus] as string;
              return {
                color,
                weight: 2,
                fillColor: color,
                fillOpacity: 0.2,
                opacity: 0.8,
              };
            }}
            onEachFeature={(feature: Feature<Polygon, PaftaProperties>, layer) => {
              const name = feature.properties?.paftaadi ?? "Pafta";
              layer.bindTooltip(name, { sticky: true, direction: "center" });
              layer.on("click", () => setSelectedPafta(name));
            }}
          />
        )}
      </FeatureGroup>

      {/* Pafta Detay Modal */}
      <Modal open={!!selectedPafta} onClose={() => setSelectedPafta(null)}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-mono text-[var(--foreground)]">
              📐 {selectedPafta}
            </h2>
            <span className="text-xs text-[var(--muted-foreground)]">
              {selectedOps.length} operasyon
            </span>
          </div>

          {selectedOps.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)] text-center py-6">
              Bu paftada henüz operasyon yok.
            </p>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {selectedOps.map((op) => (
                <div
                  key={op.id}
                  className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm text-[var(--foreground)]">{op.title}</p>
                    <Badge variant={OPERATION_STATUS_VARIANTS[op.status]}>
                      {OPERATION_STATUS_LABELS[op.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    {op.startDate && <span>📅 {op.startDate}</span>}
                    {op.location.ilce && <span>📍 {op.location.ilce}</span>}
                  </div>
                  {op.requester && (
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      Talep: {op.requester}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setSelectedPafta(null)}
            className="w-full py-2.5 rounded-lg border border-[var(--border)] text-sm text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            Kapat
          </button>
        </div>
      </Modal>
    </>
  );
}

/** Operasyonlar içinde en çok tekrar eden durumu döner */
function getDominantStatus(ops: Operation[]): Operation["status"] {
  const counts: Record<string, number> = {};
  for (const op of ops) {
    counts[op.status] = (counts[op.status] ?? 0) + 1;
  }
  let max = 0;
  let dominant: Operation["status"] = "talep";
  for (const [status, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      dominant = status as Operation["status"];
    }
  }
  return dominant;
}
