"use client";

import { Button } from "@/components/ui/Button";
import type { EquipmentCategory } from "@/types/iha";
import { EQUIPMENT_CATEGORY_LABELS } from "@/types/iha";
import { inputClass } from "../shared/styles";

type InventoryView = "equipment" | "software";

interface InventoryToolbarProps {
  view: InventoryView;
  onViewChange: (view: InventoryView) => void;
  categoryFilter: EquipmentCategory | "all";
  onCategoryChange: (cat: EquipmentCategory | "all") => void;
  onAdd: () => void;
}

const CATEGORIES: EquipmentCategory[] = [
  "drone", "gps", "kamera", "tarayici", "arac", "bilgisayar", "aksesuar",
];

export function InventoryToolbar({
  view,
  onViewChange,
  categoryFilter,
  onCategoryChange,
  onAdd,
}: InventoryToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        {/* View toggle */}
        <div className="flex rounded-md border border-[var(--border)] overflow-hidden">
          <button
            onClick={() => onViewChange("equipment")}
            className={`px-3 py-1.5 text-sm ${
              view === "equipment"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--surface)]"
            }`}
          >
            Donanım
          </button>
          <button
            onClick={() => onViewChange("software")}
            className={`px-3 py-1.5 text-sm ${
              view === "software"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--surface)]"
            }`}
          >
            Yazılım
          </button>
        </div>

        {view === "equipment" && (
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value as EquipmentCategory | "all")}
            className={inputClass}
          >
            <option value="all">Tüm Kategoriler</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {EQUIPMENT_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        )}
      </div>

      <Button onClick={onAdd} size="sm">
        + Yeni {view === "equipment" ? "Ekipman" : "Yazılım"}
      </Button>
    </div>
  );
}
