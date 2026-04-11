"use client";

import { useState, useMemo } from "react";
import { Marker, Polygon, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import { IhaMapBase } from "./IhaMapBase";
import { PaftaLayer } from "./PaftaLayer";
import { createStatusIcon, FitBounds } from "./mapHelpers";
import { useIhaStore } from "../shared/ihaStore";
import { OperationModal } from "../operations/OperationModal";
import { Modal } from "@/components/ui/Modal";
import { mapColors } from "@/config/tokens";
import { IconCalendar, IconRuler } from "@/config/icons";
import type { Operation, OperationStatus, OperationStatusGroup, FlightPermission } from "@/types/iha";
import {
  OPERATION_STATUS_LABELS, OPERATION_TYPE_LABELS,
  PERMISSION_STATUS_LABELS,
  OPERATION_STATUS_GROUP_LABELS, getStatusGroup,
} from "@/types/iha";
import { PermissionBadge } from "../shared/PermissionBadge";
import { formatAreaRaw, formatDistance } from "../operations/LocationPicker/locationHelpers";

const GROUP_COLORS: Record<OperationStatusGroup, string> = {
  yapilacak: "#f97316",
  yapiliyor: "#3b82f6",
  yapildi: "#22c55e",
};

type LayerFilter = "all" | "operations" | "permissions";
type StatusFilter = OperationStatusGroup | "all";

const STATUS_GROUPS: OperationStatusGroup[] = ["yapilacak", "yapiliyor", "yapildi"];

export function MapTab() {
  const {
    operations, equipment, team, flightPermissions,
    updateOperation, deleteOperation,
  } = useIhaStore();

  // Filtreler
  const [layerFilter, setLayerFilter] = useState<LayerFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchText, setSearchText] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [showPaftalar, setShowPaftalar] = useState(false);
  const [activeBaseLayer, setActiveBaseLayer] = useState("Harita");

  // Modaller
  const [detailOpId, setDetailOpId] = useState<string | undefined>();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const detailOp = detailOpId ? operations.find((o) => o.id === detailOpId) : undefined;

  // Filtrelenmiş veriler — lat/lng VEYA polygon VEYA line'ı olan operasyonlar
  const filteredOps = useMemo(() => {
    return operations.filter((op) => {
      const hasGeometry =
        (op.location.lat && op.location.lng) ||
        (op.location.polygonCoordinates && op.location.polygonCoordinates.length >= 3) ||
        (op.location.lineCoordinates && op.location.lineCoordinates.length >= 2);
      if (!hasGeometry) return false;
      if (statusFilter !== "all" && getStatusGroup(op.status) !== statusFilter) return false;
      if (searchText) {
        const q = searchText.toLowerCase();
        const s = [op.title, op.requester, op.location.ilce].filter(Boolean).join(" ").toLowerCase();
        if (!s.includes(q)) return false;
      }
      return true;
    });
  }, [operations, statusFilter, searchText]);

  const allOpsWithGeometry = operations.filter(
    (op) =>
      (op.location.lat && op.location.lng) ||
      (op.location.polygonCoordinates && op.location.polygonCoordinates.length >= 3) ||
      (op.location.lineCoordinates && op.location.lineCoordinates.length >= 2),
  );
  const showOps = layerFilter !== "permissions";
  const showPerms = layerFilter !== "operations";

  const activePerms = flightPermissions.filter((p) => p.polygonCoordinates.length >= 3);
  const filteredPerms = showPerms ? activePerms : [];

  // Bounds için tüm geometri noktalarını topla
  const points: [number, number][] = [];
  (showOps ? filteredOps : allOpsWithGeometry).forEach((op) => {
    if (op.location.lat && op.location.lng) {
      points.push([op.location.lat, op.location.lng]);
    }
    op.location.polygonCoordinates?.forEach((c) => points.push([c.lat, c.lng]));
    op.location.lineCoordinates?.forEach((c) => points.push([c.lat, c.lng]));
  });
  filteredPerms.forEach((p) => {
    p.polygonCoordinates.forEach((c) => points.push([c.lat, c.lng]));
  });

  const activeFilterCount = (layerFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0) + (searchText ? 1 : 0) + (showPaftalar ? 1 : 0);


  return (
    <div className="space-y-2">
      {/* ─── Üst Kontroller (harita dışında, çakışma yok) ─── */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="🔍 Ara..."
          className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
        <button
          onClick={() => setFilterOpen(true)}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors whitespace-nowrap"
        >
          Filtre{activeFilterCount > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[11px] rounded-full bg-[var(--accent)] text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ─── Harita ─── */}
      <div className="relative rounded-lg overflow-hidden border border-[var(--border)]">
        <IhaMapBase
          className="h-[50vh] sm:h-[60vh] md:h-[calc(100vh-14rem)] w-full"
          showLocate
          onBaseLayerChange={setActiveBaseLayer}
        >
          {points.length > 0 && <FitBounds points={points} />}
          {showPaftalar && <PaftaLayer satelliteMode={activeBaseLayer === "Uydu"} />}

          {/* İzin Polygonları */}
          {filteredPerms.map((perm) => (
            <PermissionPolygon key={perm.id} perm={perm} />
          ))}

          {/* Operasyon Poligonları (alan) */}
          {showOps && filteredOps.filter((op) => op.location.polygonCoordinates && op.location.polygonCoordinates.length >= 3).map((op) => (
            <OperationPolygon
              key={`poly-${op.id}`}
              op={op}
              permissions={flightPermissions}
              onSelect={() => { setDetailOpId(op.id); setIsDetailOpen(true); }}
            />
          ))}

          {/* Operasyon Çizgileri (polyline) */}
          {showOps && filteredOps.filter((op) => op.location.lineCoordinates && op.location.lineCoordinates.length >= 2).map((op) => (
            <OperationLine
              key={`line-${op.id}`}
              op={op}
              permissions={flightPermissions}
              onSelect={() => { setDetailOpId(op.id); setIsDetailOpen(true); }}
            />
          ))}

          {/* Operasyon Marker'ları (nokta ya da polygon/line centroid) */}
          {showOps && filteredOps.filter((op) => op.location.lat && op.location.lng).map((op) => (
            <OperationMarker
              key={op.id}
              op={op}
              permissions={flightPermissions}
              onSelect={() => { setDetailOpId(op.id); setIsDetailOpen(true); }}
            />
          ))}
        </IhaMapBase>

        {/* Alt sayaç (harita içinde, sol alt köşede) */}
        <div className="absolute bottom-2 left-2 z-[400] pointer-events-none">
          <div className="rounded-lg bg-[var(--surface)]/90 backdrop-blur border border-[var(--border)] shadow-lg px-3 py-1.5 text-xs text-[var(--foreground)]">
            {filteredOps.length} operasyon · {filteredPerms.length} izin
          </div>
        </div>
      </div>

      {/* ─── Filtre Paneli (alttan açılır) ─── */}
      <Modal open={filterOpen} onClose={() => setFilterOpen(false)}>
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">Filtre</h2>

        {/* Paftalar Toggle */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2 block">
            Katmanlar
          </label>
          <button
            onClick={() => setShowPaftalar(!showPaftalar)}
            className={`w-full px-4 py-3 text-sm font-medium rounded-md transition-colors min-h-[48px] flex items-center justify-between ${
              showPaftalar
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--background)] text-[var(--muted-foreground)] border border-[var(--border)]"
            }`}
          >
            <span>📐 Bursa Paftaları (1/5000)</span>
            <span className="text-xs opacity-80">{showPaftalar ? "Açık" : "Kapalı"}</span>
          </button>
        </div>

        {/* Katman */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2 block">
            Gösterilen
          </label>
          <div className="flex gap-1">
            {(["all", "operations", "permissions"] as LayerFilter[]).map((l) => (
              <button
                key={l}
                onClick={() => setLayerFilter(l)}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors min-h-[44px] ${
                  layerFilter === l
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--background)] text-[var(--muted-foreground)] border border-[var(--border)]"
                }`}
              >
                {l === "all" ? "Tümü" : l === "operations" ? "Operasyon" : "İzin"}
              </button>
            ))}
          </div>
        </div>

        {/* Durum — 3 grup */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2 block">
            Durum
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors min-h-[44px] ${
                statusFilter === "all"
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--background)] text-[var(--muted-foreground)] border border-[var(--border)]"
              }`}
            >
              Tümü
            </button>
            {STATUS_GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => setStatusFilter(statusFilter === g ? "all" : g)}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-colors min-h-[44px] ${
                  statusFilter === g
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--background)] text-[var(--muted-foreground)] border border-[var(--border)]"
                }`}
              >
                {OPERATION_STATUS_GROUP_LABELS[g]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { setLayerFilter("all"); setStatusFilter("all"); setSearchText(""); setShowPaftalar(false); }}
            className="flex-1 px-4 py-3 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] text-sm hover:bg-[var(--surface-hover)] transition-colors min-h-[48px]"
          >
            Sıfırla
          </button>
          <button
            onClick={() => setFilterOpen(false)}
            className="flex-1 px-4 py-3 rounded-lg bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-90 transition-opacity min-h-[48px]"
          >
            Uygula
          </button>
        </div>
      </Modal>

      {/* ─── Operasyon Detay Modal ─── */}
      <OperationModal
        operation={detailOp}
        equipment={equipment}
        team={team}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onSave={(data) => { if (detailOp) updateOperation(detailOp.id, data); }}
        onDelete={(id) => { deleteOperation(id); setIsDetailOpen(false); }}
      />

    </div>
  );
}

/* ─── İzin Poligonu ─── */
function PermissionPolygon({ perm }: { perm: FlightPermission }) {
  return (
    <Polygon
      positions={perm.polygonCoordinates.map((c) => [c.lat, c.lng] as [number, number])}
      pathOptions={{
        color: perm.status === "onaylandi" ? mapColors.permission : perm.status === "beklemede" ? mapColors.permissionPending : mapColors.permissionRejected,
        fillColor: perm.status === "onaylandi" ? mapColors.permission : perm.status === "beklemede" ? mapColors.permissionPending : mapColors.permissionRejected,
        fillOpacity: 0.08,
        weight: 2,
        dashArray: perm.status === "onaylandi" ? undefined : "6, 4",
      }}
    >
      <Popup>
        <div className="text-xs min-w-[180px] space-y-1">
          <p className="font-bold text-sm">{perm.hsdNumber ?? "Uçuş İzni"}</p>
          <p>
            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
              perm.status === "onaylandi" ? "bg-green-100 text-green-700" :
              perm.status === "beklemede" ? "bg-yellow-100 text-yellow-700" :
              "bg-red-100 text-red-700"
            }`}>
              {PERMISSION_STATUS_LABELS[perm.status]}
            </span>
          </p>
          <p className="text-gray-500 flex items-center gap-1"><IconCalendar size={10} /> {perm.startDate} — {perm.endDate}</p>
          {perm.maxAltitude && <p className="text-gray-500 flex items-center gap-1"><IconRuler size={10} /> Max {perm.maxAltitude}m AGL</p>}
        </div>
      </Popup>
    </Polygon>
  );
}

/* ─── Operasyon Marker (minimalist popup) ─── */
function OperationMarker({ op, permissions, onSelect }: {
  op: Operation;
  permissions: FlightPermission[];
  onSelect: () => void;
}) {
  return (
    <Marker
      position={[op.location.lat!, op.location.lng!]}
      icon={createStatusIcon(op.status)}
      eventHandlers={{
        click: (e) => {
          L.DomEvent.stopPropagation(e);
          onSelect();
        },
      }}
    >
      <Popup>
        <OpPopupContent op={op} permissions={permissions} />
      </Popup>
    </Marker>
  );
}

/* ─── Operasyon Poligonu (alan) ─── */
function OperationPolygon({ op, permissions, onSelect }: { op: Operation; permissions: FlightPermission[]; onSelect: () => void }) {
  const coords = op.location.polygonCoordinates!;
  const color = GROUP_COLORS[getStatusGroup(op.status)];
  return (
    <Polygon
      positions={coords.map((c) => [c.lat, c.lng] as [number, number])}
      pathOptions={{
        color,
        fillColor: color,
        fillOpacity: 0.15,
        weight: 2,
      }}
      eventHandlers={{
        click: (e) => { L.DomEvent.stopPropagation(e); onSelect(); },
      }}
    >
      <Popup>
        <OpPopupContent op={op} permissions={permissions} />
      </Popup>
    </Polygon>
  );
}

/* ─── Operasyon Çizgisi (polyline) ─── */
function OperationLine({ op, permissions, onSelect }: { op: Operation; permissions: FlightPermission[]; onSelect: () => void }) {
  const coords = op.location.lineCoordinates!;
  const color = GROUP_COLORS[getStatusGroup(op.status)];
  return (
    <Polyline
      positions={coords.map((c) => [c.lat, c.lng] as [number, number])}
      pathOptions={{
        color,
        weight: 4,
      }}
      eventHandlers={{
        click: (e) => { L.DomEvent.stopPropagation(e); onSelect(); },
      }}
    >
      <Popup>
        <OpPopupContent op={op} permissions={permissions} />
      </Popup>
    </Polyline>
  );
}

/* ─── Ortak popup içeriği ─── */
function OpPopupContent({ op, permissions }: { op: Operation; permissions: FlightPermission[] }) {
  const alanLabel = op.location.alan && op.location.alanBirimi
    ? ` · ${formatAreaRaw(op.location.alan, op.location.alanBirimi)}`
    : "";
  const lineLabel = op.location.lineLength
    ? ` · ${formatDistance(op.location.lineLength)}`
    : "";
  return (
    <div className="text-xs min-w-[180px] space-y-1">
      <p className="font-semibold text-sm leading-tight">{op.title}</p>
      <p className="text-gray-500">
        {OPERATION_TYPE_LABELS[op.type]} · {OPERATION_STATUS_LABELS[op.status]}
      </p>
      {op.location.ilce && (
        <p className="text-gray-500">{op.location.ilce}{op.location.mahalle ? ` / ${op.location.mahalle}` : ""}</p>
      )}
      {(alanLabel || lineLabel) && (
        <p className="text-gray-500">{alanLabel || lineLabel}</p>
      )}
      {op.type === "iha" && (
        <div className="pt-1">
          <PermissionBadge op={op} permissions={permissions} compact />
        </div>
      )}
    </div>
  );
}

