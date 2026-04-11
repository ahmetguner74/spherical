/**
 * Nominatim (OpenStreetMap) reverse geocoding.
 *
 * Kullanım:
 *   const result = await reverseGeocode(40.1885, 29.0610);
 *   → { ilce: "Osmangazi", mahalle: "Demirtaş Mah.", sokak: "Atatürk Cad.", displayAddress: "..." }
 *
 * Kısıtlamalar:
 *   - Rate limit: 1 req/sec (Nominatim kullanım şartı)
 *   - Online gereklidir; ağ hatası → null döner (çağıran sessizce devam eder)
 *   - User-Agent zorunlu (OSM politikası)
 */

import { logger } from "./logger";

export interface GeocodeResult {
  ilce?: string;
  mahalle?: string;
  sokak?: string;
  displayAddress?: string;
}

// Rate limit: son istek zamanı
let lastRequestTs = 0;
const MIN_INTERVAL_MS = 1100; // 1.1sn — Nominatim politikasına uyum

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
  // Rate limit gözet
  const now = Date.now();
  const elapsed = now - lastRequestTs;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed));
  }
  lastRequestTs = Date.now();

  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=tr&zoom=18`;
  try {
    const res = await fetch(url, {
      headers: {
        // Browser fetch User-Agent'ı override edemez ama Accept-Language ile TR tercih belirt
        "Accept-Language": "tr,en",
      },
    });
    if (!res.ok) {
      logger.warn("Nominatim HTTP hatası", res.status);
      return null;
    }
    const data = await res.json();
    return parseNominatim(data);
  } catch (err) {
    logger.warn("Nominatim fetch başarısız (offline olabilir)", err);
    return null;
  }
}

interface NominatimResponse {
  display_name?: string;
  address?: {
    road?: string;
    pedestrian?: string;
    neighbourhood?: string;
    suburb?: string;
    quarter?: string;
    village?: string;
    town?: string;
    city_district?: string;
    county?: string;
    city?: string;
  };
}

function parseNominatim(data: NominatimResponse): GeocodeResult {
  const addr = data.address ?? {};
  // Türkiye'de Nominatim yapısı:
  //   - county genelde ilçe (Osmangazi, Nilüfer)
  //   - suburb / neighbourhood / quarter → mahalle
  //   - road / pedestrian → sokak
  const ilce = addr.county ?? addr.city_district ?? addr.town ?? undefined;
  const mahalle = addr.neighbourhood ?? addr.suburb ?? addr.quarter ?? undefined;
  const sokak = addr.road ?? addr.pedestrian ?? undefined;
  return {
    ilce,
    mahalle,
    sokak,
    displayAddress: data.display_name,
  };
}
