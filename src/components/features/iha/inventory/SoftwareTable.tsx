"use client";

import type { Software } from "@/types/iha";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "../shared/DataTable";

const LICENSE_LABELS: Record<string, string> = {
  perpetual: "Kalıcı",
  subscription: "Abonelik",
  free: "Ücretsiz",
};

const columns: Column<Software>[] = [
  {
    key: "name",
    label: "Yazılım",
    render: (sw) => (
      <span className="text-[var(--foreground)] font-medium">
        {sw.name}
        {sw.version && <span className="text-xs text-[var(--muted-foreground)] ml-2">v{sw.version}</span>}
      </span>
    ),
  },
  {
    key: "license",
    label: "Lisans",
    hidden: "sm",
    render: (sw) => (
      <Badge variant={sw.licenseType === "free" ? "success" : sw.licenseType === "subscription" ? "warning" : "default"}>
        {LICENSE_LABELS[sw.licenseType]}
      </Badge>
    ),
  },
  {
    key: "expiry",
    label: "Bitiş",
    hidden: "md",
    render: (sw) => <span className="text-[var(--muted-foreground)]">{sw.licenseExpiry ?? "-"}</span>,
  },
];

interface SoftwareTableProps {
  software: Software[];
  onSelect: (sw: Software) => void;
}

export function SoftwareTable({ software, onSelect }: SoftwareTableProps) {
  return (
    <DataTable
      data={software}
      columns={columns}
      onSelect={onSelect}
      emptyMessage="Yazılım kaydı yok."
      keyExtractor={(sw) => sw.id}
    />
  );
}
