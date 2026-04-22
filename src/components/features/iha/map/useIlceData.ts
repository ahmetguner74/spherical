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

// ModÃ¼l dÃ¼zeyinde cache â€” tÃ¼m bileÅŸenler paylaÅŸÄ±r, tek fetch
let cachedData: IlceData | null = null;
let loadingPromise: Promise<IlceData> | null = null;

/**
 * Bursa ilÃ§e sÄ±nÄ±rlarÄ±nÄ± tek bir yerden yÃ¼kler ve paylaÅŸÄ±r.
 * Fetch sadece bir kez yapÄ±lÄ±r, ardÄ±ndan cache'den dÃ¶ner.
 * Kaynak: Bursa BÃ¼yÃ¼kÅŸehir Belediyesi, WGS84, 17 ilÃ§e, MultiPolygon.
 */
export function useIlceData() {
  const [data, setData] = useState<IlceData | null>(cachedData);

  useEffect(() => {
    if (cachedData || loadingPromise) {
      loadingPromise?.then((loaded) => setData(loaded)).catch(() => {});
      return;
    }

    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    loadingPromise = fetch(`${base}/vector/administrative/bursa-ilceler.geojson`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<IlceData>;
      })
      .then((loaded) => {
        cachedData = loaded;
        return loaded;
      })
      .catch((err) => {
        logger.error("Ä°lÃ§e verisi yÃ¼klenemedi", err);
        loadingPromise = null;
        throw err;
      });

    loadingPromise.then((loaded) => setData(loaded)).catch(() => {});
  }, []);

  return data;
}

/**
 * Verilen lat/lng noktasÄ±nÄ± iÃ§eren ilÃ§eyi bulur.
 * DÃ¶nen deÄŸer: title-case ilÃ§e adÄ± (Ã¶r: "NilÃ¼fer") veya null.
 * MultiPolygon'un her bir poligonu iÃ§in dÄ±ÅŸ halka taranÄ±r.
 */
export function findIlceAt(lat: number, lng: number, data: IlceData | null): string | null {
  if (!data) return null;
  // GeoJSON koordinatlarÄ± [lng, lat] formatÄ±nda
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
