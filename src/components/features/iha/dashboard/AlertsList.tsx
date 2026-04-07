"use client";

import type { Equipment, Software, StorageUnit, FlightPermission } from "@/types/iha";

interface AlertsListProps {
  equipment: Equipment[];
  software: Software[];
  storage?: StorageUnit[];
  permissions?: FlightPermission[];
}

interface Alert {
  id: string;
  type: "danger" | "warning" | "info";
  message: string;
}

function getAlerts(
  equipment: Equipment[],
  software: Software[],
  storage: StorageUnit[] = [],
  permissions: FlightPermission[] = []
): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  for (const eq of equipment) {
    if (eq.insuranceExpiry) {
      const expiry = new Date(eq.insuranceExpiry);
      const diff = expiry.getTime() - now.getTime();
      if (diff < 0) {
        alerts.push({
          id: `ins-${eq.id}`,
          type: "danger",
          message: `${eq.name} sigortası süresi dolmuş!`,
        });
      } else if (diff < thirtyDays) {
        alerts.push({
          id: `ins-${eq.id}`,
          type: "warning",
          message: `${eq.name} sigortası ${Math.ceil(diff / (24 * 60 * 60 * 1000))} gün içinde dolacak`,
        });
      }
    }

    if (eq.status === "ariza") {
      alerts.push({
        id: `ariza-${eq.id}`,
        type: "danger",
        message: `${eq.name} arızalı durumda`,
      });
    }
  }

  for (const sw of software) {
    if (sw.licenseExpiry) {
      const expiry = new Date(sw.licenseExpiry);
      const diff = expiry.getTime() - now.getTime();
      if (diff < 0) {
        alerts.push({
          id: `lic-${sw.id}`,
          type: "danger",
          message: `${sw.name} lisansı süresi dolmuş!`,
        });
      } else if (diff < thirtyDays) {
        alerts.push({
          id: `lic-${sw.id}`,
          type: "warning",
          message: `${sw.name} lisansı ${Math.ceil(diff / (24 * 60 * 60 * 1000))} gün içinde dolacak`,
        });
      }
    }
  }

  // Depolama kapasitesi uyarıları
  for (const s of storage) {
    if (s.totalCapacityTB > 0) {
      const pct = (s.usedCapacityTB / s.totalCapacityTB) * 100;
      if (pct >= 90) {
        alerts.push({
          id: `stor-${s.id}`,
          type: "danger",
          message: `${s.name} depolama %${Math.round(pct)} dolu — kritik!`,
        });
      } else if (pct >= 70) {
        alerts.push({
          id: `stor-${s.id}`,
          type: "warning",
          message: `${s.name} depolama %${Math.round(pct)} dolu`,
        });
      }
    }
  }

  // İzin süresi uyarıları
  for (const p of permissions) {
    if (p.status === "onaylandi" && p.endDate) {
      const expiry = new Date(p.endDate);
      const diff = expiry.getTime() - now.getTime();
      if (diff < 0) {
        alerts.push({
          id: `perm-${p.id}`,
          type: "danger",
          message: `Uçuş izni ${p.hsdNumber ?? ""} süresi dolmuş!`,
        });
      } else if (diff < 3 * 24 * 60 * 60 * 1000) {
        alerts.push({
          id: `perm-${p.id}`,
          type: "warning",
          message: `Uçuş izni ${p.hsdNumber ?? ""} ${Math.ceil(diff / (24 * 60 * 60 * 1000))} gün içinde dolacak`,
        });
      }
    }
  }

  return alerts;
}

const TYPE_STYLES: Record<string, string> = {
  danger: "border-red-500/30 bg-red-500/5 text-red-500",
  warning: "border-yellow-500/30 bg-yellow-500/5 text-yellow-500",
  info: "border-blue-500/30 bg-blue-500/5 text-blue-500",
};

export function AlertsList({ equipment, software, storage = [], permissions = [] }: AlertsListProps) {
  const alerts = getAlerts(equipment, software, storage, permissions);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`text-xs px-3 py-2 rounded-md border ${TYPE_STYLES[alert.type]}`}
        >
          {alert.message}
        </div>
      ))}
    </div>
  );
}
