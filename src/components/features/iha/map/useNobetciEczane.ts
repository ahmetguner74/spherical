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

// ─── Nöbet periyodu ───
// Nöbetçi eczaneler akşam ~18:00'da başlar, ertesi gün sabaha kadar hizmet verir.
// Periyot 18:00'da değişir: gündüz (00:00-17:59) ve gece (18:00-23:59)
// Böylece akşam yeni liste çekilebilir, gece boyunca kilitli kalır.

function localDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function nobetPeriodId(): string {
  const now = new Date();
  const period = now.getHours() >= 18 ? "gece" : "gunduz";
  return `${localDateStr()}-${period}`;
}

// ─── Cache (localStorage) ───

const CACHE_KEY = "nobetci_eczane_cache";

interface CacheEntry {
  period: string; // "YYYY-MM-DD-gece" veya "YYYY-MM-DD-gunduz"
  date: string; // "YYYY-MM-DD" (görüntüleme için)
  data: NobetciEczane[];
}

function readCache(): CacheEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Partial<CacheEntry>;
    if (!Array.isArray(entry.data)) return null;
    // Eski format uyumluluğu: period yoksa date'den türet
    if (!entry.period && entry.date) {
      entry.period = entry.date + "-gunduz";
    }
    if (!entry.period || !entry.date) return null;
    return entry as CacheEntry;
  } catch {
    return null;
  }
}

function writeCache(data: NobetciEczane[]): { period: string; date: string } {
  const period = nobetPeriodId();
  const date = localDateStr();
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ period, date, data }));
    } catch {
      // localStorage dolu olabilir
    }
  }
  return { period, date };
}

// ─── Tarih formatlama ───

const AY_ISIMLERI = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

export function formatNobetDate(dateStr: string): string {
  const parts = dateStr.split("-").map(Number);
  if (parts.length < 3) return dateStr;
  const [y, m, d] = parts;
  return `${d} ${AY_ISIMLERI[m - 1]} ${y}`;
}

// ─── API Fetch ───

const API_KEY = process.env.NEXT_PUBLIC_ECZANE_API_KEY ?? "";
const API_BASE = "https://www.nosyapi.com/apiv2/service";
const FETCH_TIMEOUT = 15_000;

interface RawPharmacy {
  [key: string]: unknown;
}

/** İsim + koordinattan stabil ID üretir (API sırası değişse bile aynı kalır) */
function stableId(name: string, lat: number, lng: number): string {
  const key = `${name}-${lat.toFixed(4)}-${lng.toFixed(4)}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  }
  return `eczane-${Math.abs(hash).toString(36)}`;
}

function normalizeItem(item: RawPharmacy): NobetciEczane | null {
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
      if (typeof v === "string") {
        const n = parseFloat(v);
        if (!isNaN(n)) return n;
      }
    }
    return 0;
  };

  const name = str(["pharmacyName", "EczaneAdi", "eczaneAdi", "name"]);
  const lat = num(["latitude", "Latitude", "lat"]);
  const lng = num(["longitude", "Longitude", "lng", "lon"]);

  // Doğrulama: isim zorunlu, koordinatlar geçerli aralıkta olmalı
  if (!name) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  if (lat === 0 && lng === 0) return null;

  return {
    id: stableId(name, lat, lng),
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
  for (const item of items) {
    const e = normalizeItem(item);
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
  const [cachedPeriod, setCachedPeriod] = useState<string | null>(null);

  // Mevcut nöbet periyodu zaten çekildi mi?
  const isLocked = cachedPeriod === nobetPeriodId();

  // Mount'ta cache'den yükle (otomatik API çağrısı YOK)
  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setData(cached.data);
      setLastUpdate(cached.date);
      setCachedPeriod(cached.period);
    }
  }, []);

  // Manuel veri çekme (nöbet periyodu kilidi var)
  const refresh = useCallback(async () => {
    if (!API_KEY) {
      setError("API anahtarı tanımlı değil (NEXT_PUBLIC_ECZANE_API_KEY)");
      return;
    }

    // Aynı periyotta tekrar çekmeyi engelle
    const cached = readCache();
    if (cached && cached.period === nobetPeriodId()) {
      setData(cached.data);
      setLastUpdate(cached.date);
      setCachedPeriod(cached.period);
      return;
    }

    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      const url = `${API_BASE}/pharmacies-on-duty?city=bursa`;
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        signal: controller.signal,
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("API anahtarı geçersiz veya süresi dolmuş (401)");
        if (res.status === 403) throw new Error("API erişim reddedildi (403)");
        if (res.status === 429) throw new Error("Çok fazla istek — lütfen bekleyin (429)");
        throw new Error(`API hatası: ${res.status}`);
      }

      const json = await res.json();
      const items = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json) ? json : null;

      if (!items) throw new Error("Bilinmeyen API yanıt formatı");

      const normalized = normalizeApiData(items);
      const { period, date } = writeCache(normalized);
      setData(normalized);
      setLastUpdate(date);
      setCachedPeriod(period);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("İstek zaman aşımına uğradı — internet bağlantınızı kontrol edin");
      } else {
        const msg = err instanceof Error ? err.message : "Veri alınamadı";
        setError(msg);
      }
      logger.error("Nöbetçi eczane verisi alınamadı", err);
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
    }
  }, []);

  return { eczaneler: data, lastUpdate, isLoading, error, refresh, isLocked };
}
