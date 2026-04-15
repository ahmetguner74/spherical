"use client";

// ============================================
// useWeather — Open-Meteo API hook + localStorage cache
// ============================================

import { useState, useEffect, useCallback } from "react";
import type { WeatherCurrent, WeatherDaily, FlightSuitability } from "@/types/iha";
import { BURSA_COORDS, getFlightSuitability } from "./weatherUtils";
import { logger } from "@/lib/logger";

// ─── Cache ───

const CACHE_KEY = "weather_cache";
const CACHE_TTL = 15 * 60 * 1000; // 15 dakika
const FETCH_TIMEOUT = 10_000;

interface CacheEntry {
  timestamp: number;
  current: WeatherCurrent;
  daily: WeatherDaily[];
  lat: number;
  lng: number;
}

function readCache(lat: number, lng: number): CacheEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    // Süre aşımı kontrolü
    if (Date.now() - entry.timestamp > CACHE_TTL) return null;
    // Farklı koordinatsa geçersiz
    if (Math.abs(entry.lat - lat) > 0.01 || Math.abs(entry.lng - lng) > 0.01) return null;
    return entry;
  } catch {
    return null;
  }
}

function writeCache(current: WeatherCurrent, daily: WeatherDaily[], lat: number, lng: number) {
  if (typeof window === "undefined") return;
  try {
    const entry: CacheEntry = { timestamp: Date.now(), current, daily, lat, lng };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage dolu olabilir
  }
}

// ─── API ───

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

function buildUrl(lat: number, lng: number): string {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lng.toFixed(4),
    current: "temperature_2m,wind_speed_10m,wind_gusts_10m,weather_code,cloud_cover,visibility,relative_humidity_2m,precipitation",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_sum",
    timezone: "Europe/Istanbul",
    forecast_days: "7",
  });
  return `${BASE_URL}?${params}`;
}

function parseCurrent(data: Record<string, unknown>): WeatherCurrent {
  const c = data.current as Record<string, number>;
  return {
    temperature: c.temperature_2m ?? 0,
    windSpeed: c.wind_speed_10m ?? 0,
    windGusts: c.wind_gusts_10m ?? 0,
    weatherCode: c.weather_code ?? 0,
    cloudCover: c.cloud_cover ?? 0,
    visibility: c.visibility ?? 10000,
    humidity: c.relative_humidity_2m ?? 0,
    precipitation: c.precipitation ?? 0,
  };
}

function parseDaily(data: Record<string, unknown>): WeatherDaily[] {
  const d = data.daily as Record<string, unknown[]>;
  if (!d?.time) return [];
  const times = d.time as string[];
  return times.map((date, i) => ({
    date,
    weatherCode: (d.weather_code?.[i] as number) ?? 0,
    tempMax: (d.temperature_2m_max?.[i] as number) ?? 0,
    tempMin: (d.temperature_2m_min?.[i] as number) ?? 0,
    windMax: (d.wind_speed_10m_max?.[i] as number) ?? 0,
    precipitationSum: (d.precipitation_sum?.[i] as number) ?? 0,
  }));
}

// ─── Hook ───

interface UseWeatherResult {
  current: WeatherCurrent | null;
  daily: WeatherDaily[];
  suitability: FlightSuitability | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: string | null;
  refresh: () => Promise<void>;
}

export function useWeather(
  lat: number = BURSA_COORDS.lat,
  lng: number = BURSA_COORDS.lng,
): UseWeatherResult {
  const [current, setCurrent] = useState<WeatherCurrent | null>(null);
  const [daily, setDaily] = useState<WeatherDaily[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const suitability = current ? getFlightSuitability(current) : null;

  const fetchWeather = useCallback(async (force = false) => {
    // Cache kontrolü
    if (!force) {
      const cached = readCache(lat, lng);
      if (cached) {
        setCurrent(cached.current);
        setDaily(cached.daily);
        setLastUpdate(new Date(cached.timestamp).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }));
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      const res = await fetch(buildUrl(lat, lng), { signal: controller.signal });

      if (!res.ok) throw new Error(`API hatası: ${res.status}`);

      const json = await res.json();
      const c = parseCurrent(json);
      const d = parseDaily(json);

      writeCache(c, d, lat, lng);
      setCurrent(c);
      setDaily(d);
      setLastUpdate(new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Zaman aşımı — internet bağlantınızı kontrol edin");
      } else {
        setError(err instanceof Error ? err.message : "Hava verisi alınamadı");
      }
      logger.error("useWeather fetch", err);
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
    }
  }, [lat, lng]);

  // Mount'ta otomatik yükle
  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const refresh = useCallback(() => fetchWeather(true), [fetchWeather]);

  return { current, daily, suitability, isLoading, error, lastUpdate, refresh };
}
