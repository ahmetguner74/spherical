"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIhaStore } from "../shared/ihaStore";
import { InventoryToolbar } from "./InventoryToolbar";
import { EquipmentTable } from "./EquipmentTable";
import { EquipmentModal } from "./EquipmentModal";
import { SoftwareTable } from "./SoftwareTable";
import { SoftwareModal } from "./SoftwareModal";
import { EmptyState } from "../shared/EmptyState";
import type { Equipment, Software, EquipmentCategory } from "@/types/iha";

type InventoryView = "equipment" | "software";

export function InventoryTab() {
  const { isAdmin } = useAuth();
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
  const [selectedEq, setSelectedEq] = useState<Equipment | undefined>();
  const [selectedSw, setSelectedSw] = useState<Software | undefined>();
  const [isEqModalOpen, setIsEqModalOpen] = useState(false);
  const [isSwModalOpen, setIsSwModalOpen] = useState(false);

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
      setSelectedEq(undefined);
      setIsEqModalOpen(true);
    } else {
      setSelectedSw(undefined);
      setIsSwModalOpen(true);
    }
  };

  // Re-sync selected equipment after checkout/return
  const refreshSelected = (eqId: string) => {
    const updated = equipment.find((e) => e.id === eqId);
    if (updated) setSelectedEq(updated);
  };

  return (
    <div className="space-y-4">
      <InventoryToolbar
        view={view}
        onViewChange={setView}
        categoryFilter={filters.equipmentCategory}
        onCategoryChange={(cat) => setFilter("equipmentCategory", cat as EquipmentCategory | "all")}
        onAdd={isAdmin ? handleAdd : undefined}
      />

      {view === "equipment" ? (
        equipment.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Henüz ekipman yok"
            description="İlk ekipmanı eklemek için başla"
            ctaLabel="+ Ekipman Ekle"
            onCta={handleAdd}
          />
        ) : filteredEquipment.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Bu kategoride ekipman yok"
          />
        ) : (
          <EquipmentTable
            equipment={filteredEquipment}
            onSelect={(eq) => { setSelectedEq(eq); setIsEqModalOpen(true); }}
          />
        )
      ) : software.length === 0 ? (
        <EmptyState
          icon="📦"
          title="Henüz yazılım yok"
          description="İlk yazılımı eklemek için başla"
          ctaLabel="+ Yazılım Ekle"
          onCta={handleAdd}
        />
      ) : filteredSoftware.length === 0 ? (
        <EmptyState
          icon="📦"
          title="Bu kategoride yazılım yok"
        />
      ) : (
        <SoftwareTable
          software={filteredSoftware}
          onSelect={(sw) => { setSelectedSw(sw); setIsSwModalOpen(true); }}
        />
      )}

      <EquipmentModal
        equipment={selectedEq}
        team={team}
        isOpen={isEqModalOpen}
        onClose={() => setIsEqModalOpen(false)}
        onSave={(data) => {
          if (selectedEq) updateEquipment(selectedEq.id, data);
          else addEquipment(data);
        }}
        onDelete={deleteEquipment}
        onCheckout={(eqId, entry) => { addCheckoutEntry(eqId, entry); refreshSelected(eqId); }}
        onReturn={(eqId, entryId) => { returnEquipment(eqId, entryId); refreshSelected(eqId); }}
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
