"use client";

import { useMemo, useState, useEffect } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import type { Feature, Polygon } from "geojson";
import type { PathOptions } from "leaflet";
import { usePaftaData, type PaftaProperties, type PaftaData } from "./usePaftaData";
import { useIhaStore } from "../shared/ihaStore";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { statusColors } from "@/config/tokens";
import { OPERATION_STATUS_LABELS, OPERATION_STATUS_VARIANTS } from "@/types/iha";
import type { Operation } from "@/types/iha";

const MIN_ZOOM_FOR_PAFTALAR = 11; // Bu zoom altında gizle (performans)
const MIN_ZOOM_FOR_LABELS = 13; // Bu zoom ve üstünde pafta adları sabit görünür

/**
 * Bursa Paftaları katmanı (5000 ölçekli)
 * - Lazy load GeoJSON
 * - Viewport culling: Sadece ekranda görünen paftalar render edilir (performans)
 * - Zoom 13+ iken pafta adları sabit etiket olarak yazılır
 * - Paftaya tıklayınca o paftadaki operasyonlar modal'da listelenir
 * - Operasyonu olan paftalar durum rengine göre boyanır
 */
interface PaftaLayerProps {
  satelliteMode?: boolean;
}

export function PaftaLayer({ satelliteMode = false }: PaftaLayerProps = {}) {
  const data = usePaftaData();
  const operations = useIhaStore((s) => s.operations);
  const [selectedPafta, setSelectedPafta] = useState<string | null>(null);
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  const [boundsVersion, setBoundsVersion] = useState(0);

  // Zoom + bounds değişikliklerini takip et (viewport culling için)
  useEffect(() => {
    const onChange = () => {
      setZoom(map.getZoom());
      setBoundsVersion((v) => v + 1);
    };
    map.on("zoomend", onChange);
    map.on("moveend", onChange);
    return () => {
      map.off("zoomend", onChange);
      map.off("moveend", onChange);
    };
  }, [map]);

  const isVisible = zoom >= MIN_ZOOM_FOR_PAFTALAR;
  const showLabels = zoom >= MIN_ZOOM_FOR_LABELS;

  // Pafta adı → operasyon listesi eşleşmesi
  const opsByPafta = useMemo(() => {
    const m = new Map<string, Operation[]>();
    for (const op of operations) {
      const opPaftalar = new Set<string>([
        ...(op.paftalar ?? []),
        ...(op.location?.pafta ? [op.location.pafta] : []),
      ]);
      for (const p of opPaftalar) {
        if (!m.has(p)) m.set(p, []);
        m.get(p)!.push(op);
      }
    }
    return m;
  }, [operations]);

  // VIEWPORT CULLING: Sadece bounds içindeki paftaları filtrele
  // Böylece 2301 yerine ~20-100 polygon render edilir
  const visibleData = useMemo<PaftaData | null>(() => {
    if (!data || !isVisible) return null;
    const bounds = map.getBounds();
    const padding = 0.01; // Kenarlarda biraz fazla göster (pan sırasında boşluk olmasın)
    const minLat = bounds.getSouth() - padding;
    const maxLat = bounds.getNorth() + padding;
    const minLng = bounds.getWest() - padding;
    const maxLng = bounds.getEast() + padding;

    const filtered: Feature<Polygon, PaftaProperties>[] = [];
    for (const feature of data.features) {
      // Bounding box kontrolü (hızlı ilk filtre)
      const ring = feature.geometry.coordinates[0];
      let fMinLat = Infinity, fMaxLat = -Infinity, fMinLng = Infinity, fMaxLng = -Infinity;
      for (const [lng, lat] of ring) {
        if (lat < fMinLat) fMinLat = lat;
        if (lat > fMaxLat) fMaxLat = lat;
        if (lng < fMinLng) fMinLng = lng;
        if (lng > fMaxLng) fMaxLng = lng;
      }
      // Overlap kontrolü
      if (fMaxLat < minLat || fMinLat > maxLat || fMaxLng < minLng || fMinLng > maxLng) continue;
      filtered.push(feature);
    }

    return {
      type: "FeatureCollection",
      features: filtered,
    };
    // boundsVersion'a bağımlılık ekle (bounds değişince yeniden hesaplansın)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isVisible, map, boundsVersion]);

  const selectedOps = selectedPafta ? (opsByPafta.get(selectedPafta) ?? []) : [];

  // Boş pafta rengi: uyduda sarı, diğer modlarda mavi
  const emptyColor = satelliteMode ? "#fbbf24" : "#3b82f6";

  // Style fonksiyonu (Leaflet StyleFunction tipi generic)
  const styleFn = (feature?: Feature): PathOptions => {
    const name = (feature?.properties as PaftaProperties | undefined)?.paftaadi;
    const ops = name ? opsByPafta.get(name) ?? [] : [];
    if (ops.length === 0) {
      return {
        color: emptyColor,
        weight: satelliteMode ? 1.5 : 1,
        fillColor: emptyColor,
        fillOpacity: 0.02,
        opacity: satelliteMode ? 0.7 : 0.4,
      };
    }
    const latestStatus = getLatestStatus(ops);
    const color = statusColors[latestStatus] as string;
    return {
      color,
      weight: 2,
      fillColor: color,
      fillOpacity: 0.2,
      opacity: 0.8,
    };
  };

  if (!visibleData) return null;

  return (
    <>
      <GeoJSON
        // key: görünür set değişince veya label moduna geçince re-render
        key={`${visibleData.features.length}-${showLabels ? "l" : "n"}-${operations.length}`}
        data={visibleData}
        style={styleFn}
        onEachFeature={(feature: Feature<Polygon, PaftaProperties>, layer) => {
          const name = feature.properties?.paftaadi ?? "Pafta";
          const ops = opsByPafta.get(name) ?? [];
          // Tooltip: yakın zoom → kalıcı etiket, uzak → hover
          if (showLabels) {
            layer.bindTooltip(name, {
              permanent: true,
              direction: "center",
              className: "pafta-label",
            });
          } else {
            const tooltipText = ops.length > 0
              ? `${name} · ${ops.length} operasyon`
              : name;
            layer.bindTooltip(tooltipText, { sticky: true, direction: "center" });
          }
          // Popup: basit bilgi + detay butonu
          const popupHtml = `
            <div style="min-width:160px;font-size:12px">
              <div style="font-weight:700;font-family:monospace;font-size:14px;margin-bottom:4px">${name}</div>
              <div style="color:#666;margin-bottom:8px">${ops.length} operasyon</div>
              ${ops.length > 0
                ? `<button data-pafta="${name}" class="pafta-detail-btn" style="width:100%;padding:8px 10px;background:#3b82f6;color:white;border:none;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;min-height:36px">Detayı Gör →</button>`
                : '<div style="color:#999;font-size:11px;font-style:italic">Henüz operasyon yok</div>'
              }
            </div>
          `;
          layer.bindPopup(popupHtml);
          layer.on("popupopen", (e) => {
            const popup = e.target.getPopup();
            const el = popup?.getElement()?.querySelector(".pafta-detail-btn") as HTMLButtonElement | null;
            if (el) {
              el.onclick = () => {
                setSelectedPafta(name);
                layer.closePopup();
              };
            }
          });
        }}
      />

      {/* Pafta Detay Modal */}
      <Modal open={!!selectedPafta} onClose={() => setSelectedPafta(null)}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-mono text-[var(--foreground)]">
              {selectedPafta}
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
                    {op.startDate && <span>{op.startDate}</span>}
                    {op.location.ilce && <span>· {op.location.ilce}</span>}
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

          <Button variant="ghost" className="w-full" onClick={() => setSelectedPafta(null)}>
            Kapat
          </Button>
        </div>
      </Modal>
    </>
  );
}

/** Operasyonlar içinden en son tarihli olanın durumunu döner */
function getLatestStatus(ops: Operation[]): Operation["status"] {
  const sorted = [...ops].sort((a, b) => {
    const da = a.startDate ? new Date(a.startDate).getTime() : 0;
    const db = b.startDate ? new Date(b.startDate).getTime() : 0;
    return db - da;
  });
  return sorted[0]?.status ?? "talep";
}
