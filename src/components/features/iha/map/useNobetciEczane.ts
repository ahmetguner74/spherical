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
// NosyAPI: https://www.nosyapi.com/apiv2/pharmacy?city=bursa
// Auth: Authorization: Bearer APIKEY
// Response: { data: [{ EczaneAdi, Adresi, Telefon, Latitude, Longitude, ... }] }

const API_KEY = process.env.NEXT_PUBLIC_ECZANE_API_KEY ?? "";

interface NosyApiItem {
  EczaneAdi?: string;
  Adresi?: string;
  YolTarifi?: string;
  Telefon?: string;
  Latitude?: string;
  Longitude?: string;
  Semt?: string;
  Ilce?: string;
}

function normalizeApiData(items: NosyApiItem[]): NobetciEczane[] {
  return items
    .map((item, i) => {
      const lat = parseFloat(item.Latitude ?? "0");
      const lng = parseFloat(item.Longitude ?? "0");
      return {
        id: `eczane-${i}`,
        name: item.EczaneAdi ?? "",
        district: item.Semt ?? item.Ilce ?? "",
        address: item.Adresi ?? "",
        phone: item.Telefon ?? "",
        lat,
        lng,
      };
    })
    .filter((e) => e.lat !== 0 && e.lng !== 0 && e.name.length > 0);
}

// Modül düzeyinde dedup — aynı anda birden fazla fetch engellenir
let fetchPromise: Promise<NobetciEczane[]> | null = null;

async function fetchEczaneler(): Promise<NobetciEczane[]> {
  if (!API_KEY) {
    throw new Error("NEXT_PUBLIC_ECZANE_API_KEY tanımlı değil");
  }

  const res = await fetch(
    "https://www.nosyapi.com/apiv2/pharmacy?city=bursa",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  );

  if (!res.ok) throw new Error(`API hatası: ${res.status}`);

  const json = await res.json();

  if (Array.isArray(json?.data)) {
    return normalizeApiData(json.data);
  }

  throw new Error("Bilinmeyen API yanıt formatı");
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
