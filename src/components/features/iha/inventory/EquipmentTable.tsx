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
  const owned = equipment.filter((eq) => eq.ownership !== "odunc");
  const borrowed = equipment.filter((eq) => eq.ownership === "odunc");

  return (
    <div className="space-y-0">
      <DataTable
        data={owned}
        columns={columns}
        onSelect={onSelect}
        emptyMessage="Bu kategoride ekipman yok."
        keyExtractor={(eq) => eq.id}
      />
      {borrowed.length > 0 && (
        <>
          <div className="flex items-center gap-3 py-4">
            <div className="flex-1 border-t border-[var(--border)]" />
            <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
              Ödünç Ekipman
            </span>
            <div className="flex-1 border-t border-[var(--border)]" />
          </div>
          <DataTable
            data={borrowed}
            columns={columns}
            onSelect={onSelect}
            emptyMessage=""
            keyExtractor={(eq) => eq.id}
          />
        </>
      )}
    </div>
  );
}
