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

// ModÃ¼l dÃ¼zeyinde cache â€” tÃ¼m bileÅŸenler paylaÅŸÄ±r, tek fetch
let cachedData: MahalleData | null = null;
let loadingPromise: Promise<MahalleData> | null = null;

/**
 * Bursa mahalle sÄ±nÄ±rlarÄ±nÄ± tek bir yerden yÃ¼kler ve paylaÅŸÄ±r.
 * Fetch sadece bir kez yapÄ±lÄ±r, ardÄ±ndan cache'den dÃ¶ner.
 * Kaynak: Bursa BÃ¼yÃ¼kÅŸehir Belediyesi, WGS84, 1074 mahalle, MultiPolygon.
 * Dosya ~7.8 MB (gzipli ~2 MB iletilir) â€” bu yÃ¼zden lazy, sadece
 * katman aÃ§Ä±ldÄ±ÄŸÄ±nda veya LocationPicker kullanÄ±ldÄ±ÄŸÄ±nda fetch olur.
 */
export function useMahalleData() {
  const [data, setData] = useState<MahalleData | null>(cachedData);

  useEffect(() => {
    if (cachedData || loadingPromise) {
      loadingPromise?.then((loaded) => setData(loaded)).catch(() => {});
      return;
    }

    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    loadingPromise = fetch(`${base}/vector/administrative/bursa-mahalleler.geojson`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<MahalleData>;
      })
      .then((loaded) => {
        cachedData = loaded;
        return loaded;
      })
      .catch((err) => {
        logger.error("Mahalle verisi yÃ¼klenemedi", err);
        loadingPromise = null;
        throw err;
      });

    loadingPromise.then((loaded) => setData(loaded)).catch(() => {});
  }, []);

  return data;
}

/**
 * Verilen lat/lng noktasÄ±nÄ± iÃ§eren mahalleyi bulur.
 * DÃ¶nen deÄŸer: title-case mahalle adÄ± veya null.
 * MultiPolygon'un her bir poligonu iÃ§in dÄ±ÅŸ halka taranÄ±r.
 *
 * Performans notu: 1074 mahalle poligonu lineer taranÄ±r. LocationPicker
 * tÄ±klamasÄ±nda ~5-15ms. Ä°lk Ã¶lÃ§Ã¼m yavaÅŸ Ã§Ä±karsa bbox Ã¶n-filtre eklenebilir.
 */
export function findMahalleAt(lat: number, lng: number, data: MahalleData | null): string | null {
  if (!data) return null;
  for (const feature of data.features) {
    for (const polygon of feature.geometry.coordinates) {
      const ring = polygon[0]; // dÄ±ÅŸ halka
      if (pointInPolygon(lng, lat, ring)) {
        const titled = titleCaseTr(feature.properties.AD ?? "");
        return titled || null;
      }
    }
  }
  return null;
}

// Ray casting point-in-polygon (usePaftaData.ts ile aynÄ± mantÄ±k)
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
