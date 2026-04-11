"use client";

import { useEffect, useState } from "react";
import type { FeatureCollection, MultiPolygon } from "geojson";
import { logger } from "@/lib/logger";
import { titleCaseTr } from "@/lib/turkish";

export interface IlceProperties {
  AD: string;
  KIMLIKNO: number;
}

export type IlceData = FeatureCollection<MultiPolygon, IlceProperties>;

// Modül düzeyinde cache — tüm bileşenler paylaşır, tek fetch
let cachedData: IlceData | null = null;
let loadingPromise: Promise<IlceData> | null = null;

/**
 * Bursa ilçe sınırlarını tek bir yerden yükler ve paylaşır.
 * Fetch sadece bir kez yapılır, ardından cache'den döner.
 * Kaynak: Bursa Büyükşehir Belediyesi, WGS84, 17 ilçe, MultiPolygon.
 */
export function useIlceData() {
  const [data, setData] = useState<IlceData | null>(cachedData);

  useEffect(() => {
    if (cachedData) {
      setData(cachedData);
      return;
    }
    if (!loadingPromise) {
      const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      loadingPromise = fetch(`${base}/vector/administrative/bursa-ilceler.geojson`)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json() as Promise<IlceData>;
        })
        .then((d) => {
          cachedData = d;
          return d;
        })
        .catch((err) => {
          logger.error("İlçe verisi yüklenemedi", err);
          loadingPromise = null;
          throw err;
        });
    }
    loadingPromise.then((d) => setData(d)).catch(() => {});
  }, []);

  return data;
}

/**
 * Verilen lat/lng noktasını içeren ilçeyi bulur.
 * Dönen değer: title-case ilçe adı (ör: "Nilüfer") veya null.
 * MultiPolygon'un her bir poligonu için dış halka taranır.
 */
export function findIlceAt(lat: number, lng: number, data: IlceData | null): string | null {
  if (!data) return null;
  // GeoJSON koordinatları [lng, lat] formatında
  for (const feature of data.features) {
    for (const polygon of feature.geometry.coordinates) {
      const ring = polygon[0]; // dış halka
      if (pointInPolygon(lng, lat, ring)) {
        const titled = titleCaseTr(feature.properties.AD ?? "");
        return titled || null;
      }
    }
  }
  return null;
}

// Ray casting point-in-polygon (usePaftaData.ts ile aynı mantık)
export function pointInPolygon(x: number, y: number, polygon: number[][]): boolean {
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
