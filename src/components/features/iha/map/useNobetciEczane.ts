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
  time: string; // "HH:MM" (saat bilgisi)
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
    // Eski cache'lerde time olmayabilir
    if (!entry.time) entry.time = "--:--";
    return entry as CacheEntry;
  } catch {
    return null;
  }
}

function localTimeStr(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function writeCache(data: NobetciEczane[]): { period: string; date: string; time: string } {
  const period = nobetPeriodId();
  const date = localDateStr();
  const time = localTimeStr();
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ period, date, time, data }));
    } catch {
      // localStorage dolu olabilir
    }
  }
  return { period, date, time };
}

// ─── Tarih formatlama ───

const AY_ISIMLERI = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

export function formatNobetDate(dateStr: string, timeStr?: string | null): string {
  const parts = dateStr.split("-").map(Number);
  if (parts.length < 3) return dateStr;
  const [y, m, d] = parts;
  const datePart = `${d} ${AY_ISIMLERI[m - 1]} ${y}`;
  if (timeStr && timeStr !== "--:--") return `${datePart} ${timeStr}`;
  return datePart;
}

// ─── API Fetch ───
// CollectAPI — Nöbetçi Eczane servisi
// Endpoint: https://api.collectapi.com/health/dutyPharmacy?il=bursa
// Auth: authorization header ile apikey (collectapi.com)

const API_URL = "https://api.collectapi.com/health/dutyPharmacy";
const FETCH_TIMEOUT = 15_000;

function getApiKey(): string {
  return process.env.NEXT_PUBLIC_ECZANE_API_KEY ?? "";
}

interface RawPharmacy {
  name?: string;
  dist?: string;
  address?: string;
  phone?: string;
  loc?: string; // "lat,lng" formatında
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

function parseLocation(loc: string): { lat: number; lng: number } | null {
  const parts = loc.split(",").map((s) => parseFloat(s.trim()));
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
  const [lat, lng] = parts;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  if (lat === 0 && lng === 0) return null;
  return { lat, lng };
}

function normalizeItem(item: RawPharmacy): NobetciEczane | null {
  const name = item.name?.trim() ?? "";
  if (!name) return null;

  const coords = item.loc ? parseLocation(item.loc) : null;
  if (!coords) return null;

  return {
    id: stableId(name, coords.lat, coords.lng),
    name,
    district: item.dist?.trim() ?? "",
    address: item.address?.trim() ?? "",
    phone: item.phone?.trim() ?? "",
    lat: coords.lat,
    lng: coords.lng,
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
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
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
      setLastUpdateTime(cached.time);
      setCachedPeriod(cached.period);
    }
  }, []);

  // Manuel veri çekme (nöbet periyodu kilidi var)
  const refresh = useCallback(async () => {
    // Aynı periyotta tekrar çekmeyi engelle
    const cached = readCache();
    if (cached && cached.period === nobetPeriodId()) {
      setData(cached.data);
      setLastUpdate(cached.date);
      setLastUpdateTime(cached.time);
      setCachedPeriod(cached.period);
      return;
    }

    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      const apiKey = getApiKey();
      if (!apiKey) throw new Error("API anahtarı tanımlı değil — NEXT_PUBLIC_ECZANE_API_KEY gerekli");

      const url = `${API_URL}?il=bursa`;
      const res = await fetch(url, {
        headers: {
          "content-type": "application/json",
          "authorization": `apikey ${apiKey}`,
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
      if (json?.success === false) throw new Error("API başarısız yanıt döndü");

      const items = Array.isArray(json?.result)
        ? json.result
        : Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json) ? json : null;

      if (!items) throw new Error("Bilinmeyen API yanıt formatı");

      const normalized = normalizeApiData(items);
      if (normalized.length === 0) throw new Error("Eczane verisi bulunamadı — API boş yanıt döndü");

      const { period, date, time } = writeCache(normalized);
      setData(normalized);
      setLastUpdate(date);
      setLastUpdateTime(time);
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

  return { eczaneler: data, lastUpdate, lastUpdateTime, isLoading, error, refresh, isLocked };
}
