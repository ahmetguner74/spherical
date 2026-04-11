"use client";

import { useEffect, useState } from "react";
import type { FeatureCollection, MultiPolygon } from "geojson";
import { logger } from "@/lib/logger";
import { titleCaseTr } from "@/lib/turkish";

export interface MahalleProperties {
  AD: string;
  KIMLIKNO: number;
  ILCEID: string;
}

export type MahalleData = FeatureCollection<MultiPolygon, MahalleProperties>;

// Modül düzeyinde cache — tüm bileşenler paylaşır, tek fetch
let cachedData: MahalleData | null = null;
let loadingPromise: Promise<MahalleData> | null = null;

/**
 * Bursa mahalle sınırlarını tek bir yerden yükler ve paylaşır.
 * Fetch sadece bir kez yapılır, ardından cache'den döner.
 * Kaynak: Bursa Büyükşehir Belediyesi, WGS84, 1074 mahalle, MultiPolygon.
 * Dosya ~7.8 MB (gzipli ~2 MB iletilir) — bu yüzden lazy, sadece
 * katman açıldığında veya LocationPicker kullanıldığında fetch olur.
 */
export function useMahalleData() {
  const [data, setData] = useState<MahalleData | null>(cachedData);

  useEffect(() => {
    if (cachedData) {
      setData(cachedData);
      return;
    }
    if (!loadingPromise) {
      const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      loadingPromise = fetch(`${base}/vector/administrative/bursa-mahalleler.geojson`)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json() as Promise<MahalleData>;
        })
        .then((d) => {
          cachedData = d;
          return d;
        })
        .catch((err) => {
          logger.error("Mahalle verisi yüklenemedi", err);
          loadingPromise = null;
          throw err;
        });
    }
    loadingPromise.then((d) => setData(d)).catch(() => {});
  }, []);

  return data;
}

/**
 * Verilen lat/lng noktasını içeren mahalleyi bulur.
 * Dönen değer: title-case mahalle adı veya null.
 * MultiPolygon'un her bir poligonu için dış halka taranır.
 *
 * Performans notu: 1074 mahalle poligonu lineer taranır. LocationPicker
 * tıklamasında ~5-15ms. İlk ölçüm yavaş çıkarsa bbox ön-filtre eklenebilir.
 */
export function findMahalleAt(lat: number, lng: number, data: MahalleData | null): string | null {
  if (!data) return null;
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
