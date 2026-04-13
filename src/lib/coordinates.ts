/**
 * DMS (Derece-Dakika-Saniye) ↔ Ondalık koordinat dönüşüm utility'si
 * Form-19'da koordinatlar DMS formatında gösterilir (WGS-84)
 */

export interface DMS {
  degrees: number;
  minutes: number;
  seconds: number;
  direction: "K" | "G" | "D" | "B"; // Kuzey/Güney/Doğu/Batı
}

/** Ondalık derece → DMS */
export function decimalToDms(decimal: number, isLat: boolean): DMS {
  const abs = Math.abs(decimal);
  const degrees = Math.floor(abs);
  const minFull = (abs - degrees) * 60;
  const minutes = Math.floor(minFull);
  const seconds = parseFloat(((minFull - minutes) * 60).toFixed(2));

  let direction: DMS["direction"];
  if (isLat) {
    direction = decimal >= 0 ? "K" : "G";
  } else {
    direction = decimal >= 0 ? "D" : "B";
  }

  return { degrees, minutes, seconds, direction };
}

/** DMS → Ondalık derece */
export function dmsToDecimal(dms: DMS): number {
  const dec = dms.degrees + dms.minutes / 60 + dms.seconds / 3600;
  return dms.direction === "G" || dms.direction === "B" ? -dec : dec;
}

/** DMS → Form-19 formatında string: 40°11'10.06"K */
export function dmsToString(dms: DMS): string {
  return `${dms.degrees}°${dms.minutes}'${dms.seconds}"${dms.direction}`;
}

/** Ondalık derece → Form-19 string */
export function decimalToDmsString(decimal: number, isLat: boolean): string {
  return dmsToString(decimalToDms(decimal, isLat));
}

/** Metre ↔ Feet dönüşümü */
export function metersToFeet(m: number): number {
  return Math.round(m * 3.28084);
}

export function feetToMeters(ft: number): number {
  return Math.round(ft / 3.28084);
}

/** Metre ↔ Nautical Mile dönüşümü */
export function metersToNm(m: number): number {
  return parseFloat((m / 1852).toFixed(2));
}

export function nmToMeters(nm: number): number {
  return Math.round(nm * 1852);
}
