"use client";

import { useState } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { InventoryToolbar } from "./InventoryToolbar";
import { EquipmentTable } from "./EquipmentTable";
import { EquipmentModal } from "./EquipmentModal";
import { SoftwareTable } from "./SoftwareTable";
import { SoftwareModal } from "./SoftwareModal";
import type { Equipment, Software, EquipmentCategory } from "@/types/iha";

type InventoryView = "equipment" | "software";

export function InventoryTab() {
  const {
    equipment,
    software,
    filters,
    setFilter,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    addSoftware,
    updateSoftware,
    deleteSoftware,
  } = useIhaStore();

  const [view, setView] = useState<InventoryView>("equipment");
  const [selectedEq, setSelectedEq] = useState<Equipment | undefined>();
  const [selectedSw, setSelectedSw] = useState<Software | undefined>();
  const [isEqModalOpen, setIsEqModalOpen] = useState(false);
  const [isSwModalOpen, setIsSwModalOpen] = useState(false);

  const filteredEquipment =
    filters.equipmentCategory === "all"
      ? equipment
      : equipment.filter((eq) => eq.category === filters.equipmentCategory);

  const handleAdd = () => {
    if (view === "equipment") {
      setSelectedEq(undefined);
      setIsEqModalOpen(true);
    } else {
      setSelectedSw(undefined);
      setIsSwModalOpen(true);
    }
  };

  return (
    <div className="space-y-4">
      <InventoryToolbar
        view={view}
        onViewChange={setView}
        categoryFilter={filters.equipmentCategory}
        onCategoryChange={(cat) =>
          setFilter("equipmentCategory", cat as EquipmentCategory | "all")
        }
        onAdd={handleAdd}
      />

      {view === "equipment" ? (
        <EquipmentTable
          equipment={filteredEquipment}
          onSelect={(eq) => {
            setSelectedEq(eq);
            setIsEqModalOpen(true);
          }}
        />
      ) : (
        <SoftwareTable
          software={software}
          onSelect={(sw) => {
            setSelectedSw(sw);
            setIsSwModalOpen(true);
          }}
        />
      )}

      <EquipmentModal
        equipment={selectedEq}
        isOpen={isEqModalOpen}
        onClose={() => setIsEqModalOpen(false)}
        onSave={(data) => {
          if (selectedEq) updateEquipment(selectedEq.id, data);
          else addEquipment(data);
        }}
        onDelete={deleteEquipment}
      />

      <SoftwareModal
        software={selectedSw}
        isOpen={isSwModalOpen}
        onClose={() => setIsSwModalOpen(false)}
        onSave={(data) => {
          if (selectedSw) updateSoftware(selectedSw.id, data);
          else addSoftware(data);
        }}
        onDelete={deleteSoftware}
      />
    </div>
  );
}
