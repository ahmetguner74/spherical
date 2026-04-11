"use client";

import type { Operation, FlightPermission } from "@/types/iha";
import { findMatchingPermission } from "./permissionMatcher";

interface PermissionBadgeProps {
  op: Operation;
  permissions: FlightPermission[];
  compact?: boolean; // OperationCard için kısa form
}

/**
 * Operasyonun uçuş izni durumunu gösteren rozet.
 * İHA olmayan operasyonlarda (LiDAR el/araç) hiçbir şey render etmez.
 */
export function PermissionBadge({ op, permissions, compact = false }: PermissionBadgeProps) {
  if (op.type !== "iha") return null;

  const match = findMatchingPermission(op, permissions);

  // Eşleşme yok → kırmızı uyarı
  if (!match) {
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-500 border border-red-500/30 ${compact ? "" : "px-2 py-1 text-xs"}`}>
        ⚠️ İzinsiz
      </span>
    );
  }

  // Süresi dolmuş → sarı
  if (match.isExpired) {
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-500/10 text-yellow-600 border border-yellow-500/30 ${compact ? "" : "px-2 py-1 text-xs"}`}>
        ⏰ {match.permission.hsdNumber ?? "İzin"} (süresi dolmuş)
      </span>
    );
  }

  // Eşleşme var → yeşil
  const label = match.permission.hsdNumber ?? "İzin onaylı";
  const suffix = compact ? "" : match.isManual ? " (manuel)" : " (otomatik)";
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-500/10 text-green-600 border border-green-500/30 ${compact ? "" : "px-2 py-1 text-xs"}`}>
      ✓ {label}{suffix}
    </span>
  );
}
