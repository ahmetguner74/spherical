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

/**
 * Polyline toplam uzunluğu (metre) — Haversine formülü ile.
 */
export function polylineLengthM(coords: LocationCoordinate[]): number {
  if (coords.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversineDistance(coords[i - 1], coords[i]);
  }
  return total;
}

/** İki lat/lng arası büyük daire mesafesi (metre) */
function haversineDistance(a: LocationCoordinate, b: LocationCoordinate): number {
  const R = 6_371_000; // Dünya yarıçapı (metre)
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
  const x = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

/**
 * Mesafe (metre) → Türkçe etiket ("1.2 km", "850 m")
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toLocaleString("tr-TR", { maximumFractionDigits: 2 })} km`;
  }
  return `${Math.round(meters).toLocaleString("tr-TR")} m`;
}

/**
 * Poligon örnekleme: centroid + bounds extremes (N, S, E, W).
 * Reverse geocoding için çoklu ilçe tespitinde kullanılır. En fazla 5 nokta.
 */
export function samplePolygonForGeocoding(coords: LocationCoordinate[]): LocationCoordinate[] {
  if (coords.length === 0) return [];
  const centroid = polygonCentroid(coords);
  if (!centroid) return [];

  // N/S/E/W extremes
  let north = coords[0], south = coords[0], east = coords[0], west = coords[0];
  for (const c of coords) {
    if (c.lat > north.lat) north = c;
    if (c.lat < south.lat) south = c;
    if (c.lng > east.lng) east = c;
    if (c.lng < west.lng) west = c;
  }

  // Poligon küçükse (hepsi aynı noktanın yakınında) sadece centroid yeterli
  const latSpread = north.lat - south.lat;
  const lngSpread = east.lng - west.lng;
  // ~500m eşik (yaklaşık 0.005 derece)
  if (latSpread < 0.005 && lngSpread < 0.005) {
    return [centroid];
  }

  // Centroid + 4 extreme = 5 nokta (dedup gerekirse geocoding tarafı halleder)
  return [centroid, north, south, east, west];
}

/**
 * Çizgi örnekleme: başlangıç + orta + bitiş (en fazla 3 nokta).
 */
export function sampleLineForGeocoding(coords: LocationCoordinate[]): LocationCoordinate[] {
  if (coords.length === 0) return [];
  if (coords.length === 1) return [coords[0]];
  if (coords.length === 2) return [coords[0], coords[1]];
  const mid = coords[Math.floor(coords.length / 2)];
  return [mid, coords[0], coords[coords.length - 1]]; // orta = primary
}
