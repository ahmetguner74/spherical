"use client";

import { useState, useEffect, useCallback } from "react";
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

// ─── Cache (localStorage — süresiz, tarih bilgisi ile) ───

const CACHE_KEY = "nobetci_eczane_cache";

interface CacheEntry {
  date: string; // "YYYY-MM-DD"
  data: NobetciEczane[];
}

function readCache(): CacheEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (!entry.date || !Array.isArray(entry.data)) return null;
    return entry;
  } catch {
    return null;
  }
}

function writeCache(data: NobetciEczane[]): string {
  const date = new Date().toISOString().slice(0, 10);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ date, data }));
    } catch {
      // localStorage dolu olabilir
    }
  }
  return date;
}

// ─── API Fetch ───
// NosyAPI v2: /apiv2/service/pharmacies-on-duty?city=bursa
// Kredi: sonuç sayısı kadar — manuel tetikleme ile kredi tasarrufu

const API_KEY = process.env.NEXT_PUBLIC_ECZANE_API_KEY ?? "";
const API_BASE = "https://www.nosyapi.com/apiv2/service";

interface RawPharmacy {
  [key: string]: unknown;
}

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

// ─── Hook ───

export function useNobetciEczane() {
  const [data, setData] = useState<NobetciEczane[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mount'ta cache'den yükle (otomatik API çağrısı YOK)
  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setData(cached.data);
      setLastUpdate(cached.date);
    }
  }, []);

  // Manuel veri çekme
  const refresh = useCallback(async () => {
    if (!API_KEY) {
      setError("API anahtarı tanımlı değil");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = `${API_BASE}/pharmacies-on-duty?city=bursa`;
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
      });

      if (!res.ok) throw new Error(`API hatası: ${res.status}`);

      const json = await res.json();
      const items = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json) ? json : null;

      if (!items) throw new Error("Bilinmeyen API yanıt formatı");

      const normalized = normalizeApiData(items);
      const date = writeCache(normalized);
      setData(normalized);
      setLastUpdate(date);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Veri alınamadı";
      setError(msg);
      logger.error("Nöbetçi eczane verisi alınamadı", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { eczaneler: data, lastUpdate, isLoading, error, refresh };
}
