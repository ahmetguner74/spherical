"use client";

import type { Equipment } from "@/types/iha";
import { EQUIPMENT_CATEGORY_LABELS, EQUIPMENT_STATUS_LABELS } from "@/types/iha";
import { Badge } from "@/components/ui/Badge";

interface EquipmentTableProps {
  equipment: Equipment[];
  onSelect: (eq: Equipment) => void;
}

export function EquipmentTable({ equipment, onSelect }: EquipmentTableProps) {
  if (equipment.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted-foreground)]">
        Bu kategoride ekipman yok.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="text-left py-3 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase">
              Ad
            </th>
            <th className="text-left py-3 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase hidden sm:table-cell">
              Kategori
            </th>
            <th className="text-left py-3 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase">
              Durum
            </th>
            <th className="text-left py-3 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase hidden md:table-cell">
              Sahiplik
            </th>
            <th className="text-left py-3 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase hidden lg:table-cell">
              Elinde
            </th>
          </tr>
        </thead>
        <tbody>
          {equipment.map((eq) => (
            <tr
              key={eq.id}
              onClick={() => onSelect(eq)}
              className="border-b border-[var(--border)] hover:bg-[var(--surface)] cursor-pointer transition-colors"
            >
              <td className="py-3 px-3">
                <div>
                  <span className="text-[var(--foreground)] font-medium">
                    {eq.name}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)] block sm:hidden">
                    {EQUIPMENT_CATEGORY_LABELS[eq.category]}
                  </span>
                </div>
              </td>
              <td className="py-3 px-3 hidden sm:table-cell">
                <Badge>{EQUIPMENT_CATEGORY_LABELS[eq.category]}</Badge>
              </td>
              <td className="py-3 px-3">
                <Badge
                  variant={
                    eq.status === "musait"
                      ? "success"
                      : eq.status === "ariza"
                        ? "danger"
                        : "warning"
                  }
                >
                  {EQUIPMENT_STATUS_LABELS[eq.status]}
                </Badge>
              </td>
              <td className="py-3 px-3 text-[var(--muted-foreground)] hidden md:table-cell">
                {eq.ownership === "sahip" ? "Kendi" : "Ödünç"}
              </td>
              <td className="py-3 px-3 text-[var(--muted-foreground)] hidden lg:table-cell">
                {eq.currentHolder ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
