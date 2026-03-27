"use client";

import type { Software } from "@/types/iha";
import { Badge } from "@/components/ui/Badge";

interface SoftwareTableProps {
  software: Software[];
  onSelect: (sw: Software) => void;
}

const LICENSE_LABELS: Record<string, string> = {
  perpetual: "Kalıcı",
  subscription: "Abonelik",
  free: "Ücretsiz",
};

export function SoftwareTable({ software, onSelect }: SoftwareTableProps) {
  if (software.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted-foreground)]">
        Yazılım kaydı yok.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="text-left py-3 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase">
              Yazılım
            </th>
            <th className="text-left py-3 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase hidden sm:table-cell">
              Lisans
            </th>
            <th className="text-left py-3 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase hidden md:table-cell">
              Bitiş
            </th>
          </tr>
        </thead>
        <tbody>
          {software.map((sw) => (
            <tr
              key={sw.id}
              onClick={() => onSelect(sw)}
              className="border-b border-[var(--border)] hover:bg-[var(--surface)] cursor-pointer transition-colors"
            >
              <td className="py-3 px-3">
                <span className="text-[var(--foreground)] font-medium">
                  {sw.name}
                </span>
                {sw.version && (
                  <span className="text-xs text-[var(--muted-foreground)] ml-2">
                    v{sw.version}
                  </span>
                )}
              </td>
              <td className="py-3 px-3 hidden sm:table-cell">
                <Badge
                  variant={
                    sw.licenseType === "free"
                      ? "success"
                      : sw.licenseType === "subscription"
                        ? "warning"
                        : "default"
                  }
                >
                  {LICENSE_LABELS[sw.licenseType]}
                </Badge>
              </td>
              <td className="py-3 px-3 text-[var(--muted-foreground)] hidden md:table-cell">
                {sw.licenseExpiry ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
