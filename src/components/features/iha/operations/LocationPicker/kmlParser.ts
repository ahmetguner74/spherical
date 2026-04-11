import type { LocationCoordinate } from "@/types/iha";
import { logger } from "@/lib/logger";

export interface KmlParseResult {
  point?: LocationCoordinate;
  polygon?: LocationCoordinate[];
  name?: string;
}

/**
 * KML veya KMZ dosyasını okur, ilk Point veya Polygon geometrisini döner.
 * Lazy import (@tmcw/togeojson + jszip) — sadece kullanıcı içe aktarınca yüklenir.
 */
export async function parseKmlOrKmz(file: File): Promise<KmlParseResult> {
  const isKmz = file.name.toLowerCase().endsWith(".kmz");
  let kmlText: string;

  if (isKmz) {
    const JSZipMod = await import("jszip");
    const JSZip = JSZipMod.default;
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    // KMZ içindeki doc.kml dosyasını bul (genelde doc.kml veya .kml uzantılı herhangi bir dosya)
    const kmlFile =
      zip.file("doc.kml") ??
      Object.values(zip.files).find((f) => f.name.toLowerCase().endsWith(".kml"));
    if (!kmlFile) throw new Error("KMZ içinde .kml dosyası bulunamadı");
    kmlText = await kmlFile.async("string");
  } else {
    kmlText = await file.text();
  }

  // DOM parser (tarayıcı native)
  const parser = new DOMParser();
  const doc = parser.parseFromString(kmlText, "application/xml");
  const parserError = doc.querySelector("parsererror");
  if (parserError) throw new Error("KML dosyası geçersiz XML");

  // @tmcw/togeojson ile GeoJSON'a çevir
  const { kml } = await import("@tmcw/togeojson");
  const geojson = kml(doc);

  // İlk Polygon veya Point bul
  for (const feature of geojson.features) {
    if (!feature.geometry) continue;
    const name = (feature.properties?.name as string) ?? undefined;

    if (feature.geometry.type === "Polygon") {
      const ring = feature.geometry.coordinates[0]; // dış halka
      if (!ring || ring.length < 3) continue;
      // GeoJSON [lng, lat] → LocationCoordinate {lat, lng}
      const polygon = ring.map(([lng, lat]: number[]) => ({ lat, lng }));
      // İlk ve son nokta aynıysa son noktayı at (kapanmış halka)
      if (
        polygon.length > 0 &&
        polygon[0].lat === polygon[polygon.length - 1].lat &&
        polygon[0].lng === polygon[polygon.length - 1].lng
      ) {
        polygon.pop();
      }
      return { polygon, name };
    }

    if (feature.geometry.type === "Point") {
      const [lng, lat] = feature.geometry.coordinates;
      return { point: { lat, lng }, name };
    }

    // MultiPolygon / MultiPoint — ilkini al
    if (feature.geometry.type === "MultiPolygon") {
      const ring = feature.geometry.coordinates[0]?.[0];
      if (!ring || ring.length < 3) continue;
      const polygon = ring.map(([lng, lat]: number[]) => ({ lat, lng }));
      if (
        polygon.length > 0 &&
        polygon[0].lat === polygon[polygon.length - 1].lat &&
        polygon[0].lng === polygon[polygon.length - 1].lng
      ) {
        polygon.pop();
      }
      return { polygon, name };
    }

    if (feature.geometry.type === "MultiPoint") {
      const first = feature.geometry.coordinates[0];
      if (!first) continue;
      const [lng, lat] = first;
      return { point: { lat, lng }, name };
    }
  }

  logger.warn("KML içinde Point veya Polygon bulunamadı", geojson);
  throw new Error("Dosyada içe aktarılabilecek nokta veya poligon yok");
}
