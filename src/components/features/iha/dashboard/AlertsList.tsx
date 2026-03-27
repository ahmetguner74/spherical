"use client";

import type { Equipment, Software } from "@/types/iha";

interface AlertsListProps {
  equipment: Equipment[];
  software: Software[];
}

interface Alert {
  id: string;
  type: "danger" | "warning" | "info";
  message: string;
}

function getAlerts(equipment: Equipment[], software: Software[]): Alert[] {
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

  return alerts;
}

const TYPE_STYLES: Record<string, string> = {
  danger: "border-red-500/30 bg-red-500/5 text-red-500",
  warning: "border-yellow-500/30 bg-yellow-500/5 text-yellow-500",
  info: "border-blue-500/30 bg-blue-500/5 text-blue-500",
};

export function AlertsList({ equipment, software }: AlertsListProps) {
  const alerts = getAlerts(equipment, software);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
        Uyarılar
      </h3>
      {alerts.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)] py-4 text-center">
          Uyarı yok
        </p>
      ) : (
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
      )}
    </div>
  );
}
