import type { LocationCoordinate } from "@/types/iha";

/**
 * Shoelace formülü ile poligon alanını m² cinsinden hesaplar.
 * Yaklaşım: lat/lng'yi yerel düzlemde metreye çevirir (ekvator yarıçapı + cos(lat)).
 */
export function polygonAreaM2(coords: LocationCoordinate[]): number {
  if (coords.length < 3) return 0;

  // Ortalama enlem → cos düzeltmesi
  const avgLat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
  const latRad = (avgLat * Math.PI) / 180;
  const mPerDegLat = 111_320; // yaklaşık
  const mPerDegLng = 111_320 * Math.cos(latRad);

  // Metreye çevir
  const pts = coords.map((c) => ({
    x: c.lng * mPerDegLng,
    y: c.lat * mPerDegLat,
  }));

  // Shoelace
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    sum += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return Math.abs(sum) / 2;
}

/**
 * Alan birimi otomatik seç: < 10 000 m² → m², < 1 km² → hektar, > 1 km² → km²
 */
export function chooseAreaUnit(m2: number): { value: number; unit: "m2" | "km2" | "hektar" } {
  if (m2 < 10_000) return { value: m2, unit: "m2" };
  if (m2 < 1_000_000) return { value: m2 / 10_000, unit: "hektar" };
  return { value: m2 / 1_000_000, unit: "km2" };
}

/**
 * Poligon centroid'ini döner (ağırlık merkezi).
 */
export function polygonCentroid(coords: LocationCoordinate[]): LocationCoordinate | null {
  if (coords.length === 0) return null;
  const sum = coords.reduce(
    (acc, c) => ({ lat: acc.lat + c.lat, lng: acc.lng + c.lng }),
    { lat: 0, lng: 0 },
  );
  return { lat: sum.lat / coords.length, lng: sum.lng / coords.length };
}

/**
 * Poligon çevreleyen kutu (bounds) — [[latMin, lngMin], [latMax, lngMax]]
 */
export function polygonBounds(coords: LocationCoordinate[]): [[number, number], [number, number]] | null {
  if (coords.length === 0) return null;
  let latMin = coords[0].lat, latMax = coords[0].lat;
  let lngMin = coords[0].lng, lngMax = coords[0].lng;
  for (const c of coords) {
    if (c.lat < latMin) latMin = c.lat;
    if (c.lat > latMax) latMax = c.lat;
    if (c.lng < lngMin) lngMin = c.lng;
    if (c.lng > lngMax) lngMax = c.lng;
  }
  return [[latMin, lngMin], [latMax, lngMax]];
}

/**
 * Alan + birim → Türkçe etiket ("3.4 km²", "850 hektar", "425 m²")
 */
export function formatArea(value: number, unit: "m2" | "km2" | "hektar"): string {
  const label = unit === "m2" ? "m²" : unit === "km2" ? "km²" : "hektar";
  const rounded = value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded.toLocaleString("tr-TR")} ${label}`;
}
