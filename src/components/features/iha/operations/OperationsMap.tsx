"use client";

import { useState } from "react";
import { MapOperations } from "../map";
import { useIhaStore } from "../shared/ihaStore";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { OperationForm } from "./OperationForm";
import { OperationModal } from "./OperationModal";
import type { Operation } from "@/types/iha";
import { statusColors } from "@/config/tokens";

type MapLayer = "all" | "operations" | "permissions";

const LEGEND = [
  { color: statusColors.talep, label: "Talep" },
  { color: statusColors.planlama, label: "Planlama" },
  { color: statusColors.saha, label: "Saha" },
  { color: statusColors.isleme, label: "İşleme" },
  { color: statusColors.kontrol, label: "Kontrol" },
  { color: statusColors.teslim, label: "Teslim" },
];

interface OperationsMapProps {
  operations: Operation[];
  onSelect: (op: Operation) => void;
}

export function OperationsMap({ operations, onSelect }: OperationsMapProps) {
  const { equipment, team, flightPermissions, addOperation, updateOperation, deleteOperation } = useIhaStore();

  const [layerFilter, setLayerFilter] = useState<MapLayer>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailOp, setDetailOp] = useState<Operation | undefined>();
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredPerms = layerFilter === "operations" ? [] : flightPermissions;
  const filteredOps = layerFilter === "permissions" ? [] : operations;
  const opsWithCoords = operations.filter((op) => op.location.lat && op.location.lng);
  const activePerms = flightPermissions.filter((p) => p.status === "onaylandi" && p.polygonCoordinates.length >= 3);

  const handleMapSelect = (op: Operation) => {
    setDetailOp(op);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-[var(--border)] overflow-hidden">
            {(["all", "operations", "permissions"] as MapLayer[]).map((layer) => (
              <button
                key={layer}
                onClick={() => setLayerFilter(layer)}
                className={`px-2.5 py-1.5 text-xs ${
                  layerFilter === layer
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--surface)]"
                }`}
              >
                {layer === "all" ? "Tümü" : layer === "operations" ? "Operasyonlar" : "İzinler"}
              </button>
            ))}
          </div>
          <span className="text-xs text-[var(--muted-foreground)]">
            {opsWithCoords.length} operasyon · {activePerms.length} izin
          </span>
        </div>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>+ Haritadan Operasyon</Button>
      </div>

      <MapOperations
        operations={filteredOps}
        permissions={filteredPerms}
        onSelectOperation={handleMapSelect}
        className="h-[50vh] sm:h-[60vh] md:h-[calc(100vh-20rem)] w-full rounded-lg"
      />

      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-3">
          {LEGEND.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: item.color, boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
              <span className="text-[var(--muted-foreground)]">{item.label}</span>
            </div>
          ))}
        </div>
        {activePerms.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-2 border border-green-500 border-dashed bg-green-500/10 rounded-sm" />
            <span className="text-[var(--muted-foreground)]">İzin bölgesi</span>
          </div>
        )}
      </div>

      <OperationModal
        operation={detailOp}
        equipment={equipment}
        team={team}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onSave={(data) => { if (detailOp) updateOperation(detailOp.id, data); }}
        onDelete={(id) => { deleteOperation(id); setIsDetailOpen(false); }}
      />

      <Modal open={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">Haritadan Yeni Operasyon</h2>
        <OperationForm
          equipment={equipment}
          team={team}
          onSave={(data) => { addOperation(data); setIsCreateOpen(false); }}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Modal>
    </div>
  );
}
