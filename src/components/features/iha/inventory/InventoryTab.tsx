"use client";

import { useState } from "react";
import { usePermission } from "@/hooks/usePermission";
import { useIhaStore } from "../shared/ihaStore";
import { InventoryToolbar } from "./InventoryToolbar";
import { EquipmentTable } from "./EquipmentTable";
import { EquipmentModal } from "./EquipmentModal";
import { SoftwareTable } from "./SoftwareTable";
import { SoftwareModal } from "./SoftwareModal";
import { EmptyState } from "../shared/EmptyState";
import type { EquipmentCategory } from "@/types/iha";

type InventoryView = "equipment" | "software";

export function InventoryTab() {
  const can = usePermission();
  const {
    equipment,
    software,
    team,
    filters,
    setFilter,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    addCheckoutEntry,
    returnEquipment,
    addSoftware,
    updateSoftware,
    deleteSoftware,
  } = useIhaStore();

  const [view, setView] = useState<InventoryView>("equipment");
  const [selectedEqId, setSelectedEqId] = useState<string | null>(null);
  const [selectedSwId, setSelectedSwId] = useState<string | null>(null);
  const [isEqModalOpen, setIsEqModalOpen] = useState(false);
  const [isSwModalOpen, setIsSwModalOpen] = useState(false);

  const selectedEq = selectedEqId ? equipment.find((item) => item.id === selectedEqId) : undefined;
  const selectedSw = selectedSwId ? software.find((item) => item.id === selectedSwId) : undefined;

  const filteredEquipment = equipment.filter((eq) => {
    if (filters.equipmentCategory !== "all" && eq.category !== filters.equipmentCategory) return false;
    if (filters.searchText) {
      const q = filters.searchText.toLowerCase();
      const searchable = [eq.name, eq.model, eq.serialNumber].filter(Boolean).join(" ").toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });

  const filteredSoftware = software.filter((sw) => {
    if (filters.searchText) {
      const q = filters.searchText.toLowerCase();
      const searchable = [sw.name, sw.version].filter(Boolean).join(" ").toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });

  const handleAdd = () => {
    if (view === "equipment") {
      setSelectedEqId(null);
      setIsEqModalOpen(true);
      return;
    }

    setSelectedSwId(null);
    setIsSwModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <InventoryToolbar
        view={view}
        onViewChange={setView}
        categoryFilter={filters.equipmentCategory}
        onCategoryChange={(cat) => setFilter("equipmentCategory", cat as EquipmentCategory | "all")}
        onAdd={can("inventory.create") ? handleAdd : undefined}
      />

      {view === "equipment" ? (
        equipment.length === 0 ? (
          <EmptyState
            icon="ğŸ“¦"
            title="HenÃ¼z ekipman yok"
            description="Ä°lk ekipmanÄ± eklemek iÃ§in baÅŸla"
            ctaLabel="+ Ekipman Ekle"
            onCta={handleAdd}
          />
        ) : filteredEquipment.length === 0 ? (
          <EmptyState
            icon="ğŸ“¦"
            title="Bu kategoride ekipman yok"
          />
        ) : (
          <EquipmentTable
            equipment={filteredEquipment}
            onSelect={(eq) => {
              setSelectedEqId(eq.id);
              setIsEqModalOpen(true);
            }}
          />
        )
      ) : software.length === 0 ? (
        <EmptyState
          icon="ğŸ“¦"
          title="HenÃ¼z yazÄ±lÄ±m yok"
          description="Ä°lk yazÄ±lÄ±mÄ± eklemek iÃ§in baÅŸla"
          ctaLabel="+ YazÄ±lÄ±m Ekle"
          onCta={handleAdd}
        />
      ) : filteredSoftware.length === 0 ? (
        <EmptyState
          icon="ğŸ“¦"
          title="Bu kategoride yazÄ±lÄ±m yok"
        />
      ) : (
        <SoftwareTable
          software={filteredSoftware}
          onSelect={(sw) => {
            setSelectedSwId(sw.id);
            setIsSwModalOpen(true);
          }}
        />
      )}

      <EquipmentModal
        equipment={selectedEq}
        team={team}
        isOpen={isEqModalOpen}
        onClose={() => setIsEqModalOpen(false)}
        onSave={(data) => {
          if (selectedEqId) updateEquipment(selectedEqId, data);
          else addEquipment(data);
        }}
        onDelete={deleteEquipment}
        onCheckout={(eqId, entry) => addCheckoutEntry(eqId, entry)}
        onReturn={(eqId, entryId) => returnEquipment(eqId, entryId)}
      />

      <SoftwareModal
        software={selectedSw}
        isOpen={isSwModalOpen}
        onClose={() => setIsSwModalOpen(false)}
        onSave={(data) => {
          if (selectedSwId) updateSoftware(selectedSwId, data);
          else addSoftware(data);
        }}
        onDelete={deleteSoftware}
      />
    </div>
  );
}
