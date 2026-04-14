"use client";

import { useMemo, useState, useEffect } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import type { Feature, Polygon } from "geojson";
import type { PathOptions } from "leaflet";
import { usePaftaData, type PaftaProperties, type PaftaData } from "./usePaftaData";

const MIN_ZOOM_FOR_PAFTALAR = 11;
const MIN_ZOOM_FOR_LABELS = 13;

/**
 * Bursa Paftaları katmanı (5000 ölçekli)
 * Saf altlık — operasyonlarla ilişkisi yok.
 * - Lazy load GeoJSON
 * - Viewport culling
 * - Zoom 13+ iken pafta adları sabit etiket
 */
interface PaftaLayerProps {
  satelliteMode?: boolean;
}

export function PaftaLayer({ satelliteMode = false }: PaftaLayerProps = {}) {
  const data = usePaftaData();
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  const [boundsVersion, setBoundsVersion] = useState(0);

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

  // VIEWPORT CULLING
  const visibleData = useMemo<PaftaData | null>(() => {
    if (!data || !isVisible) return null;
    const bounds = map.getBounds();
    const padding = 0.01;
    const minLat = bounds.getSouth() - padding;
    const maxLat = bounds.getNorth() + padding;
    const minLng = bounds.getWest() - padding;
    const maxLng = bounds.getEast() + padding;

    const filtered: Feature<Polygon, PaftaProperties>[] = [];
    for (const feature of data.features) {
      const ring = feature.geometry.coordinates[0];
      let fMinLat = Infinity, fMaxLat = -Infinity, fMinLng = Infinity, fMaxLng = -Infinity;
      for (const [lng, lat] of ring) {
        if (lat < fMinLat) fMinLat = lat;
        if (lat > fMaxLat) fMaxLat = lat;
        if (lng < fMinLng) fMinLng = lng;
        if (lng > fMaxLng) fMaxLng = lng;
      }
      if (fMaxLat < minLat || fMinLat > maxLat || fMaxLng < minLng || fMinLng > maxLng) continue;
      filtered.push(feature);
    }

    return { type: "FeatureCollection", features: filtered };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isVisible, map, boundsVersion]);

  // Nötr renk: uydu modunda sarı, diğerinde mavi
  const color = satelliteMode ? "#fbbf24" : "#3b82f6";

  const styleFn = (_feature?: Feature): PathOptions => ({
    color,
    weight: satelliteMode ? 1.5 : 1,
    fillColor: color,
    fillOpacity: 0.02,
    opacity: satelliteMode ? 0.7 : 0.4,
  });

  if (!visibleData) return null;

  return (
    <GeoJSON
      key={`${visibleData.features.length}-${showLabels ? "l" : "n"}`}
      data={visibleData}
      style={styleFn}
      onEachFeature={(feature: Feature<Polygon, PaftaProperties>, layer) => {
        const name = feature.properties?.paftaadi ?? "Pafta";
        if (showLabels) {
          layer.bindTooltip(name, {
            permanent: true,
            direction: "center",
            className: "pafta-label",
          });
        } else {
          layer.bindTooltip(name, { sticky: true, direction: "center" });
        }
      }}
    />
  );
}
