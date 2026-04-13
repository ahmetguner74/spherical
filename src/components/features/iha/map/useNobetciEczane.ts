"use client";

import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";

// ─── Tipler ───

export interface NobetciEczane {
  id: string;
  name: string;
  district: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
}

// ─── Günlük cache (localStorage) ───

const CACHE_KEY = "nobetci_eczane_cache";

interface CacheEntry {
  date: string; // "YYYY-MM-DD"
  data: NobetciEczane[];
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function readCache(): NobetciEczane[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (entry.date !== todayStr()) return null;
    return entry.data;
  } catch {
    return null;
  }
}

function writeCache(data: NobetciEczane[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ date: todayStr(), data }));
  } catch {
    // localStorage dolu olabilir
  }
}

// ─── API Fetch ───
// NosyAPI v2: https://www.nosyapi.com/apiv2/service/pharmacies-on-duty
// Auth: Authorization: Bearer APIKEY
// Param: city=bursa
// Kredi: sonuç sayısı kadar (günlük cache ile günde 1 çağrı)

const API_KEY = process.env.NEXT_PUBLIC_ECZANE_API_KEY ?? "";
const API_BASE = "https://www.nosyapi.com/apiv2/service";

// API'den gelen ham kayıt — alan adları bilinmiyor, esnek tutulur
interface RawPharmacy {
  [key: string]: unknown;
}

/** API yanıtını normalize et — farklı alan adı kalıplarını destekler */
function normalizeItem(item: RawPharmacy, i: number): NobetciEczane | null {
  const str = (keys: string[]): string => {
    for (const k of keys) {
      const v = item[k];
      if (typeof v === "string" && v.length > 0) return v;
    }
    return "";
  };
  const num = (keys: string[]): number => {
    for (const k of keys) {
      const v = item[k];
      if (typeof v === "number") return v;
      if (typeof v === "string") { const n = parseFloat(v); if (!isNaN(n)) return n; }
    }
    return 0;
  };

  const name = str(["pharmacyName", "EczaneAdi", "eczaneAdi", "name"]);
  const lat = num(["latitude", "Latitude", "lat"]);
  const lng = num(["longitude", "Longitude", "lng", "lon"]);

  if (!name || lat === 0 || lng === 0) return null;

  return {
    id: `eczane-${i}`,
    name,
    district: str(["districtName", "district", "dist", "Semt", "Ilce", "semt", "ilce"]),
    address: str(["address", "Adresi", "adresi"]),
    phone: str(["phone", "Telefon", "telefon", "phone1"]),
    lat,
    lng,
  };
}

function normalizeApiData(items: RawPharmacy[]): NobetciEczane[] {
  const result: NobetciEczane[] = [];
  for (let i = 0; i < items.length; i++) {
    const e = normalizeItem(items[i], i);
    if (e) result.push(e);
  }
  return result;
}

// Modül düzeyinde dedup — aynı anda birden fazla fetch engellenir
let fetchPromise: Promise<NobetciEczane[]> | null = null;

async function fetchEczaneler(): Promise<NobetciEczane[]> {
  if (!API_KEY) {
    throw new Error("NEXT_PUBLIC_ECZANE_API_KEY tanımlı değil");
  }

  const url = `${API_BASE}/pharmacies-on-duty?city=bursa`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  if (!res.ok) throw new Error(`API hatası: ${res.status}`);

  const json = await res.json();

  // NosyAPI yanıt yapısı: { data: [...] } veya { data: { pharmacyName, ... }[] }
  const items = Array.isArray(json?.data)
    ? json.data
    : Array.isArray(json) ? json : null;

  if (!items) throw new Error("Bilinmeyen API yanıt formatı");

  return normalizeApiData(items);
}

// ─── Hook ───

export function useNobetciEczane() {
  const [data, setData] = useState<NobetciEczane[]>(() => readCache() ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cache varsa ve bugüne aitse kullan
    const cached = readCache();
    if (cached && cached.length > 0) {
      setData(cached);
      return;
    }

    if (!API_KEY) {
      setError("API anahtarı tanımlı değil — .env dosyasına NEXT_PUBLIC_ECZANE_API_KEY ekleyin");
      logger.warn("Nöbetçi eczane API anahtarı yok");
      return;
    }

    setIsLoading(true);

    if (!fetchPromise) {
      fetchPromise = fetchEczaneler()
        .then((result) => {
          writeCache(result);
          return result;
        })
        .catch((err) => {
          fetchPromise = null;
          throw err;
        });
    }

    fetchPromise
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Veri alınamadı";
        setError(msg);
        logger.error("Nöbetçi eczane verisi alınamadı", err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { eczaneler: data, isLoading, error };
}
