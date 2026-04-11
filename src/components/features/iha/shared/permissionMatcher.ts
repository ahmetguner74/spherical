import type { Operation, FlightPermission, LocationCoordinate } from "@/types/iha";
import { pointInPolygon as rawPointInPolygon } from "../map/usePaftaData";
import { haversineDistance, polygonCentroid } from "../operations/LocationPicker/locationHelpers";

/**
 * v0.8.80 — Dinamik izin eşleşmesi
 *
 * Operation.permissionId manuel override olarak kalır. Elle atanmamışsa
 * render-time'da point-in-polygon ile otomatik eşleşme hesaplanır.
 * SADECE op.type === "iha" için çalışır. LiDAR el/araç gibi uçuş
 * gerektirmeyen operasyonlar için izin rozeti gösterilmez.
 */

export interface PermissionMatch {
  permission: FlightPermission;
  isManual: boolean;
  isAuto: boolean;
  isExpired: boolean;
}

/**
 * Operasyonun konumunu içeren onaylı izni bul.
 * Manuel override (op.permissionId) varsa o dönülür.
 * Sonuç null ise operasyon için izin bulunamadı.
 */
export function findMatchingPermission(
  op: Operation,
  permissions: FlightPermission[],
): PermissionMatch | null {
  // LiDAR (el/araç) uçuş değil → izin gerekmiyor
  if (op.type !== "iha") return null;

  // 1. Manuel override
  if (op.permissionId) {
    const manual = permissions.find((p) => p.id === op.permissionId);
    if (manual) {
      return {
        permission: manual,
        isManual: true,
        isAuto: false,
        isExpired: isExpired(manual),
      };
    }
  }

  // 2. Otomatik — operasyon noktasını içeren onaylı ve süresi geçerli izin
  const point = operationReferencePoint(op);
  if (!point) return null;

  for (const perm of permissions) {
    if (perm.status !== "onaylandi") continue;
    if (isExpired(perm)) continue;

    if (perm.zoneType === "polygon" && perm.polygonCoordinates.length >= 3) {
      // pointInPolygon (lng, lat, ring) — ring [lng, lat][] formatında
      const ring: number[][] = perm.polygonCoordinates.map((c) => [c.lng, c.lat]);
      if (rawPointInPolygon(point.lng, point.lat, ring)) {
        return { permission: perm, isManual: false, isAuto: true, isExpired: false };
      }
    } else if (perm.zoneType === "circle" && perm.circleCenter && perm.circleRadius) {
      const distM = haversineDistance(point, perm.circleCenter);
      if (distM <= perm.circleRadius) {
        return { permission: perm, isManual: false, isAuto: true, isExpired: false };
      }
    }
  }
  return null;
}

/**
 * Operasyonun referans noktası — nokta yoksa poligon/çizgi centroid/orta.
 */
function operationReferencePoint(op: Operation): LocationCoordinate | null {
  if (op.location.lat !== undefined && op.location.lng !== undefined) {
    return { lat: op.location.lat, lng: op.location.lng };
  }
  if (op.location.polygonCoordinates?.length) {
    return polygonCentroid(op.location.polygonCoordinates);
  }
  if (op.location.lineCoordinates?.length) {
    return op.location.lineCoordinates[Math.floor(op.location.lineCoordinates.length / 2)];
  }
  return null;
}

/** İzin süresi bugün itibariyle dolmuş mu? */
function isExpired(perm: FlightPermission): boolean {
  if (!perm.endDate) return false;
  const today = new Date().toISOString().slice(0, 10);
  return perm.endDate < today;
}

/**
 * İHA operasyonu için rozet durumu — UI'da hangi rozet gösterilecek.
 *   "matched"  → izinli (yeşil)
 *   "expired"  → süresi dolmuş (sarı)
 *   "missing"  → izinsiz (kırmızı)
 *   "n/a"      → İHA değil, rozet gösterme
 */
export type PermissionBadgeStatus = "matched" | "expired" | "missing" | "n/a";

export function permissionBadgeStatus(
  op: Operation,
  permissions: FlightPermission[],
): PermissionBadgeStatus {
  if (op.type !== "iha") return "n/a";
  const match = findMatchingPermission(op, permissions);
  if (!match) return "missing";
  if (match.isExpired) return "expired";
  return "matched";
}
