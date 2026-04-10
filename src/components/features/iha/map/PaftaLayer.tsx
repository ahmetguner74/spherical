"use client";

import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";
import type { FeatureCollection, Feature, Polygon } from "geojson";

interface PaftaProperties {
  paftaadi: string;
}

/**
 * Bursa Paftaları katmanı (5000 ölçekli)
 * GeoJSON dosyası lazy-load edilir — sadece katman açılınca çekilir
 * 2301 pafta, ~668 KB (gzipli ~44 KB)
 */
export function PaftaLayer() {
  const [data, setData] = useState<FeatureCollection<Polygon, PaftaProperties> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (data || loading) return;
    setLoading(true);
    fetch((process.env.NEXT_PUBLIC_BASE_PATH ?? "") + "/vector/pafta_index/bursa-paftalar.geojson")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [data, loading]);

  if (error || !data) return null;

  return (
    <GeoJSON
      data={data}
      style={() => ({
        color: "#3b82f6",
        weight: 1,
        fillColor: "#3b82f6",
        fillOpacity: 0.02,
        opacity: 0.5,
      })}
      onEachFeature={(feature: Feature<Polygon, PaftaProperties>, layer) => {
        const name = feature.properties?.paftaadi ?? "Pafta";
        layer.bindTooltip(name, { sticky: true, direction: "center" });
      }}
    />
  );
}
