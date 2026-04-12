"use client";

import type { FlightPermission } from "@/types/iha";
import { PERMISSION_STATUS_LABELS } from "@/types/iha";
import { Badge } from "@/components/ui/Badge";

interface PermissionCardProps {
  permission: FlightPermission;
  operationTitle?: string;
  onClick: () => void;
}

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "danger"> = {
  beklemede: "warning",
  onaylandi: "success",
  reddedildi: "danger",
  suresi_doldu: "default",
};

function isExpiring(endDate: string): boolean {
  const diff = new Date(endDate).getTime() - Date.now();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000; // 3 gün
}

export function PermissionCard({ permission, operationTitle, onClick }: PermissionCardProps) {
  const expiring = permission.status === "onaylandi" && isExpiring(permission.endDate);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors ${
        expiring ? "border-[var(--feedback-warning)]/50" : "border-[var(--border)]"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-[var(--foreground)]">
          {permission.hsdNumber ?? "İzin"}
        </span>
        <Badge variant={STATUS_VARIANT[permission.status]}>
          {PERMISSION_STATUS_LABELS[permission.status]}
        </Badge>
      </div>

      <div className="text-xs text-[var(--muted-foreground)] space-y-0.5">
        <p>{permission.startDate} — {permission.endDate}</p>
        {permission.maxAltitude && <p>Max yükseklik: {permission.maxAltitude}m</p>}
        {permission.polygonCoordinates.length > 0 && (
          <p>{permission.polygonCoordinates.length} köşe noktası</p>
        )}
        {operationTitle && <p>Operasyon: {operationTitle}</p>}
        {expiring && (
          <p className="text-[var(--feedback-warning)] font-medium">Süre dolmak üzere!</p>
        )}
      </div>
    </button>
  );
}
