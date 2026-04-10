"use client";

import { useEffect, useState } from "react";
import type { FeatureCollection, Polygon } from "geojson";
import { logger } from "@/lib/logger";

export interface PaftaProperties {
  paftaadi: string;
}

export type PaftaData = FeatureCollection<Polygon, PaftaProperties>;

// Modül düzeyinde cache — tüm bileşenler paylaşır, tek fetch
let cachedData: PaftaData | null = null;
let loadingPromise: Promise<PaftaData> | null = null;

/**
 * Bursa paftalarını tek bir yerden yükler ve paylaşır.
 * Fetch sadece bir kez yapılır, ardından cache'den döner.
 */
export function usePaftaData() {
  const [data, setData] = useState<PaftaData | null>(cachedData);

  useEffect(() => {
    if (cachedData) {
      setData(cachedData);
      return;
    }
    if (!loadingPromise) {
      const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      loadingPromise = fetch(`${base}/vector/pafta_index/bursa-paftalar.geojson`)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json() as Promise<PaftaData>;
        })
        .then((d) => {
          cachedData = d;
          return d;
        })
        .catch((err) => {
          logger.error("Pafta verisi yüklenemedi", err);
          loadingPromise = null;
          throw err;
        });
    }
    loadingPromise.then((d) => setData(d)).catch(() => {});
  }, []);

  return data;
}

/**
 * Verilen lat/lng noktasını içeren paftayı bulur.
 * Dönen değer: pafta adı (ör: "H21C02C") veya null
 */
export function findPaftaAt(lat: number, lng: number, data: PaftaData | null): string | null {
  if (!data) return null;
  // GeoJSON koordinatları [lng, lat] formatında
  for (const feature of data.features) {
    const ring = feature.geometry.coordinates[0]; // dış halka
    if (pointInPolygon(lng, lat, ring)) {
      return feature.properties.paftaadi;
    }
  }
  return null;
}

/**
 * Tüm pafta adlarını döner (autocomplete için)
 */
export function getAllPaftaNames(data: PaftaData | null): string[] {
  if (!data) return [];
  return data.features.map((f) => f.properties.paftaadi).sort();
}

// Ray casting point-in-polygon
function pointInPolygon(x: number, y: number, polygon: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
