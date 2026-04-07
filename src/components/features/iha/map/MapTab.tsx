"use client";

import { useState } from "react";
import { MapOperations } from "../map";
import { useIhaStore } from "../shared/ihaStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { OperationForm } from "../operations/OperationForm";
import { OperationDeliverables } from "../operations/OperationDeliverables";
import { OperationTimeline } from "../operations/OperationTimeline";
import { OperationStatusBadge } from "../operations/OperationStatusBadge";
import { statusColors } from "@/config/tokens";
import type { Operation, TeamMember, Equipment, FlightLog, FlightPermission, Deliverable } from "@/types/iha";
import {
  OPERATION_TYPE_LABELS,
  OPERATION_PRIORITY_LABELS,
  OPERATION_STATUS_LABELS,
  PERMISSION_STATUS_LABELS,
} from "@/types/iha";

type MapLayer = "operations" | "permissions" | "all";

export function MapTab() {
  const {
    operations,
    equipment,
    team,
    flightLogs,
    flightPermissions,
    addOperation,
    updateOperation,
    deleteOperation,
    addDeliverable,
    removeDeliverable,
    setActiveTab,
  } = useIhaStore();

  const [selectedOp, setSelectedOp] = useState<Operation | undefined>();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [layerFilter, setLayerFilter] = useState<MapLayer>("all");

  const handleSelectOp = (op: Operation) => {
    setSelectedOp(op);
    setIsDetailOpen(true);
  };

  const filteredPermissions =
    layerFilter === "operations" ? [] : flightPermissions;

  const opsWithCoords = operations.filter((op) => op.location.lat && op.location.lng);
  const activePerms = flightPermissions.filter((p) => p.status === "onaylandi" && p.polygonCoordinates.length >= 3);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {/* Layer filter */}
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
            {opsWithCoords.length} operasyon · {activePerms.length} izin bölgesi
          </span>
        </div>

        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          + Haritadan Operasyon
        </Button>
      </div>

      {/* Tam ekran harita */}
      <MapOperations
        operations={layerFilter === "permissions" ? [] : operations}
        permissions={filteredPermissions}
        onSelectOperation={handleSelectOp}
        className="h-[50vh] sm:h-[60vh] md:h-[calc(100vh-16rem)] w-full rounded-lg"
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-3">
          <LegendDot color={statusColors.talep} label="Talep" />
          <LegendDot color={statusColors.planlama} label="Planlama" />
          <LegendDot color={statusColors.saha} label="Saha" />
          <LegendDot color={statusColors.isleme} label="İşleme" />
          <LegendDot color={statusColors.kontrol} label="Kontrol" />
          <LegendDot color={statusColors.teslim} label="Teslim" />
        </div>
        {activePerms.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-2 border border-green-500 border-dashed bg-green-500/10 rounded-sm" />
            <span className="text-[var(--muted-foreground)]">İzin bölgesi</span>
          </div>
        )}
      </div>

      {/* Operasyon Detay Modalı */}
      {selectedOp && (
        <Modal open={isDetailOpen} onClose={() => setIsDetailOpen(false)}>
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">{selectedOp.title}</h2>
          <MapOperationDetail
            operation={selectedOp}
            team={team}
            equipment={equipment}
            flightLogs={flightLogs}
            flightPermissions={flightPermissions}
            onEdit={() => { setIsDetailOpen(false); setActiveTab("operations"); }}
            onAddDeliverable={(del) => addDeliverable(selectedOp.id, del)}
            onRemoveDeliverable={(delId) => removeDeliverable(selectedOp.id, delId)}
            onDelete={() => { deleteOperation(selectedOp.id); setIsDetailOpen(false); }}
          />
        </Modal>
      )}

      {/* Yeni Operasyon Modalı */}
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

function MapOperationDetail({
  operation,
  team,
  equipment,
  flightLogs,
  flightPermissions,
  onEdit,
  onAddDeliverable,
  onRemoveDeliverable,
  onDelete,
}: {
  operation: Operation;
  team: TeamMember[];
  equipment: Equipment[];
  flightLogs: FlightLog[];
  flightPermissions: FlightPermission[];
  onEdit: () => void;
  onAddDeliverable: (del: Omit<Deliverable, "id">) => void;
  onRemoveDeliverable: (id: string) => void;
  onDelete: () => void;
}) {
  const opFlights = flightLogs.filter((fl) => fl.operationId === operation.id);
  const opPerm = flightPermissions.find((p) => p.operationId === operation.id || p.id === operation.permissionId);

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <OperationTimeline currentStatus={operation.status} />

      <div className="flex items-center gap-2 flex-wrap">
        <OperationStatusBadge status={operation.status} />
        <Badge>{OPERATION_TYPE_LABELS[operation.type]}</Badge>
        <span className="text-xs text-[var(--muted-foreground)]">
          {OPERATION_PRIORITY_LABELS[operation.priority]}
        </span>
      </div>

      {operation.description && <p className="text-sm text-[var(--foreground)]">{operation.description}</p>}

      {/* Konum */}
      <div className="rounded-md bg-[var(--background)] p-3">
        <p className="text-sm text-[var(--foreground)]">
          {[operation.location.il, operation.location.ilce, operation.location.mahalle].filter(Boolean).join(" / ")}
        </p>
        {operation.location.pafta && (
          <p className="text-xs text-[var(--muted-foreground)]">
            Pafta: {operation.location.pafta}
            {operation.location.ada && ` · Ada: ${operation.location.ada}`}
            {operation.location.parsel && ` · Parsel: ${operation.location.parsel}`}
          </p>
        )}
        {operation.location.alan && (
          <p className="text-xs text-[var(--muted-foreground)]">
            Alan: {operation.location.alan.toLocaleString()} {operation.location.alanBirimi ?? "m²"}
          </p>
        )}
      </div>

      {/* İzin */}
      {opPerm && (
        <div className={`text-xs p-2 rounded border ${opPerm.status === "onaylandi" ? "border-green-500/30 bg-green-500/5" : "border-yellow-500/30 bg-yellow-500/5"}`}>
          İzin: {opPerm.hsdNumber ?? "HSD"} — {PERMISSION_STATUS_LABELS[opPerm.status]}
        </div>
      )}

      {/* Ekip & Ekipman */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {operation.assignedTeam.length > 0 && (
          <div>
            <span className="text-xs text-[var(--muted-foreground)]">Ekip</span>
            <p className="text-[var(--foreground)]">
              {operation.assignedTeam.map((id) => team.find((t) => t.id === id)?.name).filter(Boolean).join(", ")}
            </p>
          </div>
        )}
        {operation.assignedEquipment.length > 0 && (
          <div>
            <span className="text-xs text-[var(--muted-foreground)]">Ekipman</span>
            <p className="text-[var(--foreground)]">
              {operation.assignedEquipment.map((id) => equipment.find((e) => e.id === id)?.name).filter(Boolean).join(", ")}
            </p>
          </div>
        )}
      </div>

      {/* Uçuş Kayıtları */}
      {opFlights.length > 0 && (
        <div>
          <span className="text-xs text-[var(--muted-foreground)]">Uçuş Kayıtları ({opFlights.length})</span>
          {opFlights.map((fl) => (
            <p key={fl.id} className="text-xs text-[var(--foreground)]">{fl.date} · {fl.pilotName ?? ""} · {fl.equipmentName ?? ""}</p>
          ))}
        </div>
      )}

      {/* Çıktılar */}
      <OperationDeliverables
        deliverables={operation.deliverables}
        onAdd={onAddDeliverable}
        onRemove={onRemoveDeliverable}
      />

      <div className="flex gap-2 pt-2">
        <Button onClick={onEdit}>Düzenle</Button>
        <Button variant="danger" onClick={onDelete}>Sil</Button>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: color, boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
      <span className="text-[var(--muted-foreground)]">{label}</span>
    </div>
  );
}
