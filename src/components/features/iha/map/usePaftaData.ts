"use client";

import { useEffect, useState } from "react";
import type { FeatureCollection, Polygon } from "geojson";
import { logger } from "@/lib/logger";

export interface PaftaProperties {
  paftaadi: string;
}

export type PaftaData = FeatureCollection<Polygon, PaftaProperties>;

// ModÃ¼l dÃ¼zeyinde cache â€” tÃ¼m bileÅŸenler paylaÅŸÄ±r, tek fetch
let cachedData: PaftaData | null = null;
let loadingPromise: Promise<PaftaData> | null = null;

/**
 * Bursa paftalarÄ±nÄ± tek bir yerden yÃ¼kler ve paylaÅŸÄ±r.
 * Fetch sadece bir kez yapÄ±lÄ±r, ardÄ±ndan cache'den dÃ¶ner.
 */
export function usePaftaData() {
  const [data, setData] = useState<PaftaData | null>(cachedData);

  useEffect(() => {
    if (cachedData || loadingPromise) {
      loadingPromise?.then((loaded) => setData(loaded)).catch(() => {});
      return;
    }

    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    loadingPromise = fetch(`${base}/vector/pafta_index/bursa-paftalar.geojson`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<PaftaData>;
      })
      .then((loaded) => {
        cachedData = loaded;
        return loaded;
      })
      .catch((err) => {
        logger.error("Pafta verisi yÃ¼klenemedi", err);
        loadingPromise = null;
        throw err;
      });

    loadingPromise.then((loaded) => setData(loaded)).catch(() => {});
  }, []);

  return data;
}

/**
 * Verilen lat/lng noktasÄ±nÄ± iÃ§eren paftayÄ± bulur.
 * DÃ¶nen deÄŸer: pafta adÄ± (Ã¶r: "H21C02C") veya null
 */
export function findPaftaAt(lat: number, lng: number, data: PaftaData | null): string | null {
  if (!data) return null;
  // GeoJSON koordinatlarÄ± [lng, lat] formatÄ±nda
  for (const feature of data.features) {
    const ring = feature.geometry.coordinates[0]; // dÄ±ÅŸ halka
    if (pointInPolygon(lng, lat, ring)) {
      return feature.properties.paftaadi;
    }
  }
  return null;
}

/**
 * TÃ¼m pafta adlarÄ±nÄ± dÃ¶ner (autocomplete iÃ§in)
 */
export function getAllPaftaNames(data: PaftaData | null): string[] {
  if (!data) return [];
  return data.features.map((feature) => feature.properties.paftaadi).sort();
}

// Ray casting point-in-polygon
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
