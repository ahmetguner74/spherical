"use client";

import { useMemo, useState, useEffect } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import type { Feature, MultiPolygon } from "geojson";
import type { PathOptions } from "leaflet";
import { useMahalleData, type MahalleProperties, type MahalleData } from "./useMahalleData";
import { titleCaseTr } from "@/lib/turkish";

const MIN_ZOOM_FOR_MAHALLELER = 13; // Zoom < 13 → gizle (1074 poligon, çok yoğun)
const MIN_ZOOM_FOR_LABELS = 15; // Zoom ≥ 15 → kalıcı etiket (viewport içinde ~20-40 mahalle)

/**
 * Bursa Mahalle Sınırları katmanı (1074 mahalle, MultiPolygon, WGS84).
 * - Lazy load GeoJSON (~7.8 MB raw, ~2 MB gzipli)
 * - Viewport culling ZORUNLU — bbox ile %95+ filtre
 * - Zoom 15+ iken mahalle adları kalıcı tooltip
 * - Operasyon renklendirme YOK — sadece idari sınır referansı
 */
interface MahalleLayerProps {
  satelliteMode?: boolean;
}

export function MahalleLayer({ satelliteMode = false }: MahalleLayerProps = {}) {
  const data = useMahalleData();
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  const [boundsVersion, setBoundsVersion] = useState(0);

  // Zoom + bounds değişikliklerini takip et
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

  const isVisible = zoom >= MIN_ZOOM_FOR_MAHALLELER;
  const showLabels = zoom >= MIN_ZOOM_FOR_LABELS;

  // VIEWPORT CULLING: MultiPolygon bbox ile filtrele (1074 → ~20-50)
  const visibleData = useMemo<MahalleData | null>(() => {
    if (!data || !isVisible) return null;
    const bounds = map.getBounds();
    const padding = 0.005;
    const minLat = bounds.getSouth() - padding;
    const maxLat = bounds.getNorth() + padding;
    const minLng = bounds.getWest() - padding;
    const maxLng = bounds.getEast() + padding;

    const filtered: Feature<MultiPolygon, MahalleProperties>[] = [];
    for (const feature of data.features) {
      let fMinLat = Infinity, fMaxLat = -Infinity, fMinLng = Infinity, fMaxLng = -Infinity;
      for (const polygon of feature.geometry.coordinates) {
        for (const [lng, lat] of polygon[0]) {
          if (lat < fMinLat) fMinLat = lat;
          if (lat > fMaxLat) fMaxLat = lat;
          if (lng < fMinLng) fMinLng = lng;
          if (lng > fMaxLng) fMaxLng = lng;
        }
      }
      if (fMaxLat < minLat || fMinLat > maxLat || fMaxLng < minLng || fMinLng > maxLng) continue;
      filtered.push(feature);
    }

    return { type: "FeatureCollection", features: filtered };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isVisible, map, boundsVersion]);

  // Satellite modu: daha koyu zemin üzerinde belirgin renk
  const color = satelliteMode ? "#fcd34d" : "#9ca3af"; // amber / gray-400

  const styleFn = (): PathOptions => ({
    color,
    weight: 1,
    fillColor: color,
    fillOpacity: 0,
    opacity: satelliteMode ? 0.8 : 0.6,
  });

  if (!visibleData) return null;

  return (
    <GeoJSON
      key={`mahalleler-${visibleData.features.length}-${showLabels ? "l" : "n"}`}
      data={visibleData}
      style={styleFn}
      onEachFeature={(feature: Feature<MultiPolygon, MahalleProperties>, layer) => {
        const name = titleCaseTr(feature.properties?.AD ?? "Mahalle");
        if (showLabels) {
          layer.bindTooltip(name, {
            permanent: true,
            direction: "center",
            className: "mahalle-label",
          });
        } else {
          layer.bindTooltip(name, { sticky: true, direction: "center" });
        }
      }}
    />
  );
}
