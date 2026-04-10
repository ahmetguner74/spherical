"use client";

import { useEffect, useState } from "react";
import { FeatureGroup, GeoJSON } from "react-leaflet";
import type { FeatureCollection, Feature, Polygon } from "geojson";

interface PaftaProperties {
  paftaadi: string;
}

/**
 * Bursa Paftaları katmanı (5000 ölçekli)
 * GeoJSON dosyası lazy-load edilir — sadece katman açılınca çekilir
 * 2301 pafta, ~668 KB (gzipli ~44 KB)
 *
 * NOT: FeatureGroup ile sarılmış — yükleme sırasında da overlay
 * LayersControl'de görünsün diye. Aksi halde Leaflet kontrol menüsünde
 * checkbox bile gösterilmez.
 */
export function PaftaLayer() {
  const [data, setData] = useState<FeatureCollection<Polygon, PaftaProperties> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data || loading) return;
    setLoading(true);
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    fetch(`${basePath}/vector/pafta_index/bursa-paftalar.geojson`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => setData(d))
      .catch((err) => {
        console.error("Pafta katmanı yüklenemedi:", err);
      })
      .finally(() => setLoading(false));
  }, [data, loading]);

  return (
    <FeatureGroup>
      {data && (
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
      )}
    </FeatureGroup>
  );
}
