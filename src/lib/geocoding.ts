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

export interface MultiGeocodeResult extends GeocodeResult {
  /** Poligon sınırında birden fazla ilçe geçiyorsa tümü — ilk eleman ana ilçe */
  allIlces?: string[];
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

/**
 * Sadece sokak adını çeken hafif reverse-geocode.
 *
 * v0.8.92'den itibaren ilçe + mahalle lokal GeoJSON lookup'tan geldiği için
 * Nominatim yalnızca sokak bilgisi için çağrılır. Ağ/offline hatasında `null`
 * döner (çağıran sessizce devam eder, ilçe/mahalle yine lokal çalışır).
 *
 * **Yeni geliştirmelerde `reverseGeocode` yerine bunu kullanın.**
 */
export async function fetchStreetName(lat: number, lng: number): Promise<string | null> {
  const res = await reverseGeocode(lat, lng);
  return res?.sokak ?? null;
}

/**
 * Çoklu nokta örneklemesi — poligon veya çizgi için.
 * İlk nokta primary (adres, sokak, mahalle oradan gelir).
 * Diğer noktalar sadece ilçe bilgisi için sorgulanır; unique ilçeler toplanır.
 *
 * Not: Her sorgu 1.1sn rate limit → 5 nokta = ~5-6 saniye. Çağıran debounce etmeli.
 *
 * **Yeni geliştirmelerde `fetchStreetName` tercih edilmeli** — bu fonksiyon
 * legacy kullanımlar için bırakıldı (ilçe/mahalle lokal lookup'tan gelir,
 * çoklu örnekleme artık gereksiz).
 */
export async function reverseGeocodeMulti(samples: { lat: number; lng: number }[]): Promise<MultiGeocodeResult | null> {
  if (samples.length === 0) return null;
  // Primary: ilk örnek (genelde centroid)
  const primary = await reverseGeocode(samples[0].lat, samples[0].lng);
  if (!primary) return null;

  const allIlces: string[] = primary.ilce ? [primary.ilce] : [];
  // Diğer örnekleri de sorgula
  for (let i = 1; i < samples.length; i++) {
    const res = await reverseGeocode(samples[i].lat, samples[i].lng);
    if (res?.ilce && !allIlces.includes(res.ilce)) {
      allIlces.push(res.ilce);
    }
  }

  return {
    ...primary,
    allIlces: allIlces.length > 0 ? allIlces : undefined,
  };
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
  // Türkiye (Bursa) için Nominatim yapısı esnek — birden fazla alan olabilir.
  //
  // İlçe öncelik sırası (güvenilirden-aza):
  //   1. city_district → Büyükşehir ilçesi (Osmangazi, Nilüfer, Yıldırım) — en güvenilir
  //   2. county        → Bazen ilçe bazen il (dikkat)
  //   3. municipality  → "Osmangazi Belediyesi" gibi, ek temizlenmeli
  //   4. town          → Küçük yerleşim fallback
  //
  // Mahalle öncelik sırası (spesifikten-genele):
  //   1. neighbourhood → En spesifik, gerçek mahalle
  //   2. quarter       → Çeyrek/semt — mahalle olabilir
  //   3. suburb        → Bazen ilçe adı içeriyor, SON çare
  //
  // Sokak: road ?? pedestrian
  const rawIlce = addr.city_district ?? addr.county ?? addr.municipality ?? addr.town ?? undefined;
  const ilce = rawIlce ? normalizeIlce(rawIlce) : undefined;

  let mahalle = addr.neighbourhood ?? addr.quarter ?? addr.suburb ?? undefined;
  // Temizlik 1: mahalle ilçe adıyla birebir eşleşiyorsa (Nominatim duplicate etmiş) — sil
  if (mahalle && ilce && mahalle.trim() === ilce.trim()) {
    mahalle = undefined;
  }
  // Temizlik 2: mahalle alanında ilçe adı varsa (örn. suburb → "Osmangazi") — sil
  if (mahalle && isIlceName(mahalle)) {
    mahalle = undefined;
  }

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
 * Ek temizlik: "Osmangazi Belediyesi", "Osmangazi/Bursa", "Osmangazi İlçesi" gibi ekler.
 * Eşleşme yoksa temizlenmiş adı döner (kullanıcı elle düzeltebilir).
 */
function normalizeIlce(raw: string): string {
  const cleaned = raw
    .replace(/\s*\/.*$/, "")           // "Osmangazi/Bursa" → "Osmangazi"
    .replace(/\s+Belediyesi$/i, "")    // "Osmangazi Belediyesi" → "Osmangazi"
    .replace(/\s+İlçesi$/i, "")        // "Osmangazi İlçesi" → "Osmangazi"
    .replace(/\s+Metropolitan$/i, "")  // "Bursa Metropolitan" → "Bursa"
    .trim();
  const normalized = turkishFold(cleaned.toLocaleLowerCase("tr"));
  for (const bursa of BURSA_ILCELER) {
    if (turkishFold(bursa.toLocaleLowerCase("tr")) === normalized) {
      return bursa;
    }
  }
  return cleaned;
}

/**
 * Verilen string Bursa ilçelerinden biri mi?
 * parseNominatim'de mahalle alanına yanlışlıkla ilçe adı yazılmış mı kontrolü için.
 */
function isIlceName(name: string): boolean {
  const folded = turkishFold(name.trim().toLocaleLowerCase("tr"));
  return BURSA_ILCELER.some(
    (il) => turkishFold(il.toLocaleLowerCase("tr")) === folded,
  );
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

