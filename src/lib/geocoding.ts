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
import { BURSA_ILCELER } from "@/config/iha";

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
    municipality?: string;
  };
}

function parseNominatim(data: NominatimResponse): GeocodeResult {
  const addr = data.address ?? {};
  // Türkiye'de Nominatim yapısı esnek — birden fazla alan olabilir:
  //   - county/city_district/municipality/town → ilçe
  //   - suburb/neighbourhood/quarter → mahalle
  //   - road/pedestrian → sokak
  const rawIlce = addr.county ?? addr.city_district ?? addr.municipality ?? addr.town ?? undefined;
  const ilce = rawIlce ? normalizeIlce(rawIlce) : undefined;
  const mahalle = addr.neighbourhood ?? addr.suburb ?? addr.quarter ?? undefined;
  const sokak = addr.road ?? addr.pedestrian ?? undefined;
  return {
    ilce,
    mahalle,
    sokak,
    displayAddress: data.display_name,
  };
}

/**
 * Nominatim'den gelen ilçe adını BURSA_ILCELER listesine eşleştirir.
 * Türkçe karakter normalleştirme + case-insensitive eşleşme.
 * Eşleşme yoksa orijinal adı döner (kullanıcı elle düzeltebilir).
 */
function normalizeIlce(raw: string): string {
  const cleaned = raw.replace(/\s*\/.*$/, "").trim(); // "Osmangazi/Bursa" → "Osmangazi"
  const normalized = turkishFold(cleaned.toLocaleLowerCase("tr"));
  for (const bursa of BURSA_ILCELER) {
    if (turkishFold(bursa.toLocaleLowerCase("tr")) === normalized) {
      return bursa;
    }
  }
  return cleaned;
}

/** Türkçe karakterleri ASCII'ye indirger (karşılaştırma için) */
function turkishFold(s: string): string {
  return s
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

