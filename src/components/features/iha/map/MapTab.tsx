"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Marker, Polygon, CircleMarker, Popup, useMap } from "react-leaflet";
import L, { type Popup as LeafletPopup } from "leaflet";
import { IhaMapBase } from "./IhaMapBase";
import { createStatusIcon, FitBounds, ClickHandler } from "./mapHelpers";
import { useIhaStore } from "../shared/ihaStore";
import { OperationModal } from "../operations/OperationModal";
import { Modal } from "@/components/ui/Modal";
import { QuickCreateForm } from "../operations/QuickCreateForm";
import { mapColors } from "@/config/tokens";
import type { Operation, OperationStatus, FlightPermission } from "@/types/iha";
import {
  OPERATION_STATUS_LABELS, OPERATION_TYPE_LABELS,
  PERMISSION_STATUS_LABELS,
} from "@/types/iha";

type LayerFilter = "all" | "operations" | "permissions";
type StatusFilter = OperationStatus | "all";

const STATUS_LIST: OperationStatus[] = ["talep", "planlama", "saha", "isleme", "kontrol", "teslim"];

export function MapTab() {
  const {
    operations, equipment, team, flightPermissions,
    addOperation, updateOperation, deleteOperation,
  } = useIhaStore();

  // Filtreler
  const [layerFilter, setLayerFilter] = useState<LayerFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchText, setSearchText] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  // Modaller
  const [detailOpId, setDetailOpId] = useState<string | undefined>();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const detailOp = detailOpId ? operations.find((o) => o.id === detailOpId) : undefined;
  const [newOpCoords, setNewOpCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [pendingPin, setPendingPin] = useState<{ lat: number; lng: number } | null>(null);

  // Filtrelenmiş veriler
  const filteredOps = useMemo(() => {
    return operations.filter((op) => {
      if (!op.location.lat || !op.location.lng) return false;
      if (statusFilter !== "all" && op.status !== statusFilter) return false;
      if (searchText) {
        const q = searchText.toLowerCase();
        const s = [op.title, op.requester, op.location.ilce].filter(Boolean).join(" ").toLowerCase();
        if (!s.includes(q)) return false;
      }
      return true;
    });
  }, [operations, statusFilter, searchText]);

  const allOpsWithCoords = operations.filter((op) => op.location.lat && op.location.lng);
  const showOps = layerFilter !== "permissions";
  const showPerms = layerFilter !== "operations";

  const activePerms = flightPermissions.filter((p) => p.polygonCoordinates.length >= 3);
  const filteredPerms = showPerms ? activePerms : [];

  const points: [number, number][] = (showOps ? filteredOps : allOpsWithCoords).map((op) => [op.location.lat!, op.location.lng!]);
  filteredPerms.forEach((p) => {
    p.polygonCoordinates.forEach((c) => points.push([c.lat, c.lng]));
  });

  const activeFilterCount = (layerFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0) + (searchText ? 1 : 0);

  // Tıklayınca direkt modal açma — önce pin düşür, kullanıcı onaylasın
  const handleMapClick = (lat: number, lng: number) => setPendingPin({ lat, lng });
  const handleQuickStatus = (op: Operation, newStatus: OperationStatus) => updateOperation(op.id, { status: newStatus });

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
        <IhaMapBase className="h-[60vh] md:h-[calc(100vh-14rem)] w-full" showLocate>
          {points.length > 0 && <FitBounds points={points} />}
          <ClickHandler onSelect={handleMapClick} />

          {/* İzin Polygonları */}
          {filteredPerms.map((perm) => (
            <PermissionPolygon key={perm.id} perm={perm} />
          ))}

          {/* Operasyon Marker'ları */}
          {showOps && filteredOps.map((op) => (
            <OperationMarker
              key={op.id}
              op={op}
              onSelect={() => { setDetailOpId(op.id); setIsDetailOpen(true); }}
              onQuickStatus={handleQuickStatus}
            />
          ))}

          {/* Bekleyen pin (tıklama sonrası, modal açmadan önce onay) */}
          {pendingPin && (
            <PendingPinMarker
              pin={pendingPin}
              onConfirm={() => { setNewOpCoords(pendingPin); setPendingPin(null); }}
              onCancel={() => setPendingPin(null)}
            />
          )}

          {/* Yeni operasyon başlatıldı (modal açıkken gösterilen işaret) */}
          {newOpCoords && (
            <CircleMarker
              center={[newOpCoords.lat, newOpCoords.lng]}
              radius={10}
              pathOptions={{ color: mapColors.newMarker, fillColor: mapColors.newMarker, fillOpacity: 0.3, weight: 2 }}
            />
          )}
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

        {/* Durum */}
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
            {STATUS_LIST.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-colors min-h-[44px] ${
                  statusFilter === s
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--background)] text-[var(--muted-foreground)] border border-[var(--border)]"
                }`}
              >
                {OPERATION_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { setLayerFilter("all"); setStatusFilter("all"); setSearchText(""); }}
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

      {/* ─── Haritadan Yeni Operasyon ─── */}
      <Modal open={!!newOpCoords} onClose={() => setNewOpCoords(null)}>
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">
          📍 Yeni Operasyon
        </h2>
        <p className="text-xs text-[var(--muted-foreground)] mb-4">
          Konum: {newOpCoords?.lat.toFixed(6)}, {newOpCoords?.lng.toFixed(6)}
        </p>
        <QuickCreateForm
          team={team}
          defaultLat={newOpCoords?.lat}
          defaultLng={newOpCoords?.lng}
          onSave={(data) => { addOperation(data); setNewOpCoords(null); }}
          onCancel={() => setNewOpCoords(null)}
        />
      </Modal>
    </div>
  );
}

/* ─── Bekleyen Pin (onay popup'lı) ─── */
function PendingPinMarker({ pin, onConfirm, onCancel }: {
  pin: { lat: number; lng: number };
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const popupRef = useRef<LeafletPopup>(null);
  const map = useMap();

  // İlk render'da popup'ı aç
  useEffect(() => {
    const timer = setTimeout(() => {
      popupRef.current?.openOn(map);
    }, 50);
    return () => clearTimeout(timer);
  }, [map]);

  return (
    <CircleMarker
      center={[pin.lat, pin.lng]}
      radius={10}
      pathOptions={{ color: mapColors.newMarker, fillColor: mapColors.newMarker, fillOpacity: 0.4, weight: 2 }}
      eventHandlers={{
        popupclose: () => onCancel(),
      }}
    >
      <Popup ref={popupRef} autoClose={false} closeOnClick={false}>
        <div className="text-xs min-w-[180px] space-y-2">
          <p className="font-semibold">Buraya operasyon mu?</p>
          <p className="text-gray-500 font-mono">
            {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onConfirm(); }}
              className="flex-1 px-2 py-1.5 rounded bg-blue-600 text-white text-[11px] font-medium hover:bg-blue-700 transition-colors"
            >
              Ekle
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onCancel(); }}
              className="flex-1 px-2 py-1.5 rounded border border-gray-300 text-gray-600 text-[11px] hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      </Popup>
    </CircleMarker>
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
          <p className="text-gray-500">📅 {perm.startDate} — {perm.endDate}</p>
          {perm.maxAltitude && <p className="text-gray-500">📏 Max {perm.maxAltitude}m AGL</p>}
        </div>
      </Popup>
    </Polygon>
  );
}

/* ─── Operasyon Marker ─── */
function OperationMarker({ op, onSelect, onQuickStatus }: {
  op: Operation;
  onSelect: () => void;
  onQuickStatus: (op: Operation, status: OperationStatus) => void;
}) {
  const nextStatus = getNextStatus(op.status);
  return (
    <Marker
      position={[op.location.lat!, op.location.lng!]}
      icon={createStatusIcon(op.status)}
      eventHandlers={{
        click: (e) => {
          // Marker click'inin map click'ine yayılmasını engelle
          L.DomEvent.stopPropagation(e);
        },
      }}
    >
      <Popup>
        <div className="text-xs min-w-[220px] space-y-1.5">
          <p className="font-bold text-sm">{op.title}</p>
          <p className="text-gray-500">{OPERATION_TYPE_LABELS[op.type]}</p>
          <p className="text-gray-500">{op.location.il} / {op.location.ilce}</p>
          <p className="text-gray-500">{OPERATION_STATUS_LABELS[op.status]}</p>
          {op.requester && <p className="text-gray-400">Talep: {op.requester}</p>}
          {nextStatus && (
            <button
              onClick={(e) => { e.stopPropagation(); onQuickStatus(op, nextStatus); }}
              className="w-full mt-1 px-2 py-1.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              → {OPERATION_STATUS_LABELS[nextStatus]}
            </button>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

/* ─── Yardımcı: Sonraki durum ─── */
const STATUS_FLOW: OperationStatus[] = ["talep", "planlama", "saha", "isleme", "kontrol", "teslim"];

function getNextStatus(current: OperationStatus): OperationStatus | null {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}
