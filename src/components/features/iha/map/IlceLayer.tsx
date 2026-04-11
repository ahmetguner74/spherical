"use client";

import { useMemo, useState, useEffect } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import type { Feature, MultiPolygon } from "geojson";
import type { PathOptions } from "leaflet";
import { useIlceData, type IlceProperties, type IlceData } from "./useIlceData";
import { titleCaseTr } from "@/lib/turkish";

const MIN_ZOOM_FOR_ILCELER = 8; // Zoom < 8 → gizle
const MIN_ZOOM_FOR_LABELS = 10; // Zoom ≥ 10 → kalıcı etiket

/**
 * Bursa İlçe Sınırları katmanı (17 ilçe, MultiPolygon, WGS84).
 * - Lazy load GeoJSON
 * - Viewport culling (MultiPolygon bbox hesabı)
 * - Zoom 10+ iken ilçe adları kalıcı tooltip
 * - Operasyon renklendirme YOK — sadece idari sınır referansı
 */
interface IlceLayerProps {
  satelliteMode?: boolean;
}

export function IlceLayer({ satelliteMode = false }: IlceLayerProps = {}) {
  const data = useIlceData();
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

  const isVisible = zoom >= MIN_ZOOM_FOR_ILCELER;
  const showLabels = zoom >= MIN_ZOOM_FOR_LABELS;

  // VIEWPORT CULLING: MultiPolygon bbox ile filtrele
  const visibleData = useMemo<IlceData | null>(() => {
    if (!data || !isVisible) return null;
    const bounds = map.getBounds();
    const padding = 0.02;
    const minLat = bounds.getSouth() - padding;
    const maxLat = bounds.getNorth() + padding;
    const minLng = bounds.getWest() - padding;
    const maxLng = bounds.getEast() + padding;

    const filtered: Feature<MultiPolygon, IlceProperties>[] = [];
    for (const feature of data.features) {
      // MultiPolygon'un tüm halkalarını birleştiren bbox
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

  // Satellite modu için daha görünür renk
  const color = satelliteMode ? "#ffffff" : "#6366f1"; // indigo accent

  const styleFn = (): PathOptions => ({
    color,
    weight: satelliteMode ? 2.5 : 2,
    fillColor: color,
    fillOpacity: 0,
    opacity: satelliteMode ? 0.9 : 0.7,
  });

  if (!visibleData) return null;

  return (
    <GeoJSON
      key={`ilceler-${visibleData.features.length}-${showLabels ? "l" : "n"}`}
      data={visibleData}
      style={styleFn}
      onEachFeature={(feature: Feature<MultiPolygon, IlceProperties>, layer) => {
        const name = titleCaseTr(feature.properties?.AD ?? "İlçe");
        if (showLabels) {
          layer.bindTooltip(name, {
            permanent: true,
            direction: "center",
            className: "ilce-label",
          });
        } else {
          layer.bindTooltip(name, { sticky: true, direction: "center" });
        }
      }}
    />
  );
}
