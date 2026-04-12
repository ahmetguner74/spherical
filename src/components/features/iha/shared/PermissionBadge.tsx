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
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--feedback-error-bg)] text-[var(--feedback-error)] border border-[var(--feedback-error)]/30 ${compact ? "" : "px-2 py-1 text-xs"}`}>
        ⚠️ İzinsiz
      </span>
    );
  }

  // Süresi dolmuş → sarı
  if (match.isExpired) {
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--feedback-warning-bg)] text-[var(--feedback-warning)] border border-[var(--feedback-warning)]/30 ${compact ? "" : "px-2 py-1 text-xs"}`}>
        ⏰ {match.permission.hsdNumber ?? "İzin"} (süresi dolmuş)
      </span>
    );
  }

  // Eşleşme var → yeşil
  const label = match.permission.hsdNumber ?? "İzin onaylı";
  const suffix = compact ? "" : match.isManual ? " (manuel)" : " (otomatik)";
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--feedback-success-bg)] text-[var(--feedback-success)] border border-[var(--feedback-success)]/30 ${compact ? "" : "px-2 py-1 text-xs"}`}>
      ✓ {label}{suffix}
    </span>
  );
}
