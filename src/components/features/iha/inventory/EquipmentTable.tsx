"use client";

import type { Equipment } from "@/types/iha";
import { EQUIPMENT_CATEGORY_LABELS, EQUIPMENT_STATUS_LABELS } from "@/types/iha";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "../shared/DataTable";

const columns: Column<Equipment>[] = [
  {
    key: "name",
    label: "Ad",
    render: (eq) => (
      <div>
        <span className="text-[var(--foreground)] font-medium">{eq.name}</span>
        <span className="text-xs text-[var(--muted-foreground)] block sm:hidden">
          {EQUIPMENT_CATEGORY_LABELS[eq.category]}
        </span>
      </div>
    ),
  },
  {
    key: "category",
    label: "Kategori",
    hidden: "sm",
    render: (eq) => <Badge>{EQUIPMENT_CATEGORY_LABELS[eq.category]}</Badge>,
  },
  {
    key: "status",
    label: "Durum",
    render: (eq) => (
      <Badge variant={eq.status === "musait" ? "success" : eq.status === "ariza" ? "danger" : "warning"}>
        {EQUIPMENT_STATUS_LABELS[eq.status]}
      </Badge>
    ),
  },
  {
    key: "ownership",
    label: "Sahiplik",
    hidden: "md",
    render: (eq) => (
      <span className="text-[var(--muted-foreground)]">
        {eq.ownership === "sahip" ? "Kendi" : "Ödünç"}
      </span>
    ),
  },
  {
    key: "holder",
    label: "Elinde",
    hidden: "lg",
    render: (eq) => <span className="text-[var(--muted-foreground)]">{eq.currentHolder ?? "-"}</span>,
  },
];

interface EquipmentTableProps {
  equipment: Equipment[];
  onSelect: (eq: Equipment) => void;
}

export function EquipmentTable({ equipment, onSelect }: EquipmentTableProps) {
  return (
    <DataTable
      data={equipment}
      columns={columns}
      onSelect={onSelect}
      emptyMessage="Bu kategoride ekipman yok."
      keyExtractor={(eq) => eq.id}
    />
  );
}
