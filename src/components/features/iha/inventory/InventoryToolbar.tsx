"use client";

import type { EquipmentCategory } from "@/types/iha";
import { EQUIPMENT_CATEGORY_LABELS } from "@/types/iha";
import { ViewToolbar, SelectFilter } from "../shared/ViewToolbar";

type InventoryView = "equipment" | "software";

interface InventoryToolbarProps {
  view: InventoryView;
  onViewChange: (view: InventoryView) => void;
  categoryFilter: EquipmentCategory | "all";
  onCategoryChange: (cat: EquipmentCategory | "all") => void;
  onAdd?: () => void;
}

const VIEWS = [
  { key: "equipment", label: "Donanım" },
  { key: "software", label: "Yazılım" },
];

const CATEGORIES: EquipmentCategory[] = [
  "drone", "gps", "kamera", "tarayici", "arac", "bilgisayar", "aksesuar",
];

export function InventoryToolbar({
  view, onViewChange, categoryFilter, onCategoryChange, onAdd,
}: InventoryToolbarProps) {
  return (
    <ViewToolbar
      views={VIEWS}
      activeView={view}
      onViewChange={(v) => onViewChange(v as InventoryView)}
      addLabel={view === "equipment" ? "Yeni Ekipman" : "Yeni Yazılım"}
      onAdd={onAdd}
      filters={
        view === "equipment" ? (
          <SelectFilter
            value={categoryFilter}
            onChange={(v) => onCategoryChange(v as EquipmentCategory | "all")}
            options={CATEGORIES.map((c) => ({ value: c, label: EQUIPMENT_CATEGORY_LABELS[c] }))}
            allLabel="Tüm Kategoriler"
          />
        ) : undefined
      }
    />
  );
}
