import type { Operation } from "@/types/iha";
import { OPERATION_STATUS_LABELS, OPERATION_TYPE_LABELS } from "@/types/iha";

/**
 * Operasyonu KML string olarak üret — Point / Polygon / LineString desteklenir.
 * @tmcw/togeojson sadece KML→GeoJSON yapıyor; reverse için basit XML writer.
 */
export function operationToKml(op: Operation): string {
  const loc = op.location;
  let geometry = "";

  if (loc.polygonCoordinates?.length) {
    const ring = [...loc.polygonCoordinates, loc.polygonCoordinates[0]]; // halkayı kapat
    const coords = ring.map((c) => `${c.lng},${c.lat},0`).join(" ");
    geometry = `<Polygon><outerBoundaryIs><LinearRing><coordinates>${coords}</coordinates></LinearRing></outerBoundaryIs></Polygon>`;
  } else if (loc.lineCoordinates?.length) {
    const coords = loc.lineCoordinates.map((c) => `${c.lng},${c.lat},0`).join(" ");
    geometry = `<LineString><coordinates>${coords}</coordinates></LineString>`;
  } else if (loc.lat !== undefined && loc.lng !== undefined) {
    geometry = `<Point><coordinates>${loc.lng},${loc.lat},0</coordinates></Point>`;
  }

  const descParts: string[] = [];
  descParts.push(`Durum: ${OPERATION_STATUS_LABELS[op.status] ?? op.status}`);
  descParts.push(`Tip: ${OPERATION_TYPE_LABELS[op.type] ?? op.type}`);
  if (op.requester) descParts.push(`Talep: ${op.requester}`);
  if (loc.ilce) descParts.push(`${loc.il ?? "Bursa"}/${loc.ilce}${loc.mahalle ? "/" + loc.mahalle : ""}`);
  if (loc.pafta) descParts.push(`Pafta: ${loc.pafta}`);
  if (loc.alan && loc.alanBirimi) {
    const unit = loc.alanBirimi === "m2" ? "m²" : loc.alanBirimi === "km2" ? "km²" : "hektar";
    descParts.push(`Alan: ${loc.alan} ${unit}`);
  }
  if (loc.lineLength) {
    const distLabel = loc.lineLength >= 1000
      ? `${(loc.lineLength / 1000).toFixed(2)} km`
      : `${Math.round(loc.lineLength)} m`;
    descParts.push(`Uzunluk: ${distLabel}`);
  }
  if (op.startDate) descParts.push(`Başlangıç: ${op.startDate}`);
  if (op.endDate) descParts.push(`Bitiş: ${op.endDate}`);

  const description = escapeXml(descParts.join("\n"));
  const name = escapeXml(op.title);

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${name}</name>
    <description>${description}</description>
    <Placemark>
      <name>${name}</name>
      <description>${description}</description>
      ${geometry}
    </Placemark>
  </Document>
</kml>`;
}

/** Tarayıcıdan KML dosyası indir */
export function downloadKml(op: Operation): void {
  const kml = operationToKml(op);
  const blob = new Blob([kml], { type: "application/vnd.google-earth.kml+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeName = op.title.replace(/[^a-zA-Z0-9_\-ığüşöçİĞÜŞÖÇ ]/g, "").replace(/\s+/g, "_");
  a.download = `${safeName || "operasyon"}.kml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
