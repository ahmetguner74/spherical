"use client";

import { useState, useMemo } from "react";
import { Marker, Polygon, CircleMarker, Popup, useMapEvents } from "react-leaflet";
import { IhaMapBase } from "./IhaMapBase";
import { createStatusIcon, FitBounds, ClickHandler } from "./mapHelpers";
import { useIhaStore } from "../shared/ihaStore";
import { OperationModal } from "../operations/OperationModal";
import { Modal } from "@/components/ui/Modal";
import { QuickCreateForm } from "../operations/QuickCreateForm";
import { statusColors, statusBgColors, mapColors } from "@/config/tokens";
import type { Operation, OperationStatus, OperationType, FlightPermission } from "@/types/iha";
import {
  OPERATION_STATUS_LABELS, OPERATION_TYPE_LABELS,
  OPERATION_PRIORITY_LABELS, PERMISSION_STATUS_LABELS,
} from "@/types/iha";

type LayerFilter = "all" | "operations" | "permissions";
type StatusFilter = OperationStatus | "all";
type TypeFilter = OperationType | "all";

const STATUS_LIST: OperationStatus[] = ["talep", "planlama", "saha", "isleme", "kontrol", "teslim"];
const TYPE_LIST: OperationType[] = ["iha", "lidar", "lidar_el", "lidar_arac", "drone_fotogrametri", "oblik_cekim", "panorama_360"];

const TYPE_ICON: Record<OperationType, string> = {
  iha: "🛩️", lidar: "📡", lidar_el: "📡", lidar_arac: "🚗", drone_fotogrametri: "🛩️", oblik_cekim: "📐", panorama_360: "🌐",
};

export function MapTab() {
  const {
    operations, equipment, team, flightPermissions,
    addOperation, updateOperation, deleteOperation,
  } = useIhaStore();

  // Filtreler
  const [layerFilter, setLayerFilter] = useState<LayerFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  // Modaller
  const [detailOp, setDetailOp] = useState<Operation | undefined>();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [newOpCoords, setNewOpCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Sol panel
  const [panelOpen, setPanelOpen] = useState(true);
  const [searchText, setSearchText] = useState("");

  // Filtrelenmiş veriler
  const filteredOps = useMemo(() => {
    return operations.filter((op) => {
      if (!op.location.lat || !op.location.lng) return false;
      if (statusFilter !== "all" && op.status !== statusFilter) return false;
      if (typeFilter !== "all" && op.type !== typeFilter) return false;
      if (searchText) {
        const q = searchText.toLowerCase();
        const s = [op.title, op.requester, op.location.ilce].filter(Boolean).join(" ").toLowerCase();
        if (!s.includes(q)) return false;
      }
      return true;
    });
  }, [operations, statusFilter, typeFilter, searchText]);

  const allOpsWithCoords = operations.filter((op) => op.location.lat && op.location.lng);
  const showOps = layerFilter !== "permissions";
  const showPerms = layerFilter !== "operations";

  const activePerms = flightPermissions.filter(
    (p) => p.polygonCoordinates.length >= 3
  );
  const filteredPerms = showPerms ? activePerms : [];

  const points: [number, number][] = (showOps ? filteredOps : allOpsWithCoords).map((op) => [op.location.lat!, op.location.lng!]);
  // İzin polygon noktalarını da ekle
  filteredPerms.forEach((p) => {
    p.polygonCoordinates.forEach((c) => points.push([c.lat, c.lng]));
  });

  // Durum sayaçları
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allOpsWithCoords.forEach((op) => { counts[op.status] = (counts[op.status] ?? 0) + 1; });
    return counts;
  }, [allOpsWithCoords]);

  // Haritaya tıklama ile yeni operasyon
  const handleMapClick = (lat: number, lng: number) => {
    setNewOpCoords({ lat, lng });
  };

  // Hızlı durum değiştirme (popup'tan)
  const handleQuickStatus = (op: Operation, newStatus: OperationStatus) => {
    updateOperation(op.id, { status: newStatus });
  };

  return (
    <div className="relative">
      {/* ─── Harita (tam alan) ─── */}
      <div className="rounded-lg overflow-hidden border border-[var(--border)]">
        <IhaMapBase className="h-[45vh] sm:h-[50vh] md:h-[calc(100vh-14rem)] w-full" showLocate>
          {points.length > 0 && <FitBounds points={points} />}
          <ClickHandler onSelect={handleMapClick} />

          {/* İzin Polygonları */}
          {filteredPerms.map((perm) => (
            <Polygon
              key={perm.id}
              positions={perm.polygonCoordinates.map((c) => [c.lat, c.lng] as [number, number])}
              pathOptions={{
                color: perm.status === "onaylandi" ? mapColors.permission : perm.status === "beklemede" ? "#eab308" : "#ef4444",
                fillColor: perm.status === "onaylandi" ? mapColors.permission : perm.status === "beklemede" ? "#eab308" : "#ef4444",
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
                  {perm.coordinationContacts && <p className="text-gray-500">📞 {perm.coordinationContacts}</p>}
                </div>
              </Popup>
            </Polygon>
          ))}

          {/* Operasyon Marker'ları */}
          {showOps && filteredOps.map((op) => {
            const nextStatus = getNextStatus(op.status);
            return (
              <Marker
                key={op.id}
                position={[op.location.lat!, op.location.lng!]}
                icon={createStatusIcon(op.status)}
                eventHandlers={{ click: () => { setDetailOp(op); setIsDetailOpen(true); } }}
              >
                <Popup>
                  <div className="text-xs min-w-[220px] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm">{op.title}</p>
                      <span className="text-base">{TYPE_ICON[op.type]}</span>
                    </div>
                    <p className="text-gray-500">{OPERATION_TYPE_LABELS[op.type]}</p>
                    <p className="text-gray-500">{op.location.il} / {op.location.ilce}</p>
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        op.status === "saha" ? "bg-green-100 text-green-700" :
                        op.status === "teslim" ? "bg-emerald-100 text-emerald-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {OPERATION_STATUS_LABELS[op.status]}
                      </span>
                      <span className="text-[10px] text-gray-400">{OPERATION_PRIORITY_LABELS[op.priority]}</span>
                    </div>
                    {op.requester && <p className="text-gray-400">Talep: {op.requester}</p>}
                    {op.completionPercent > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${op.completionPercent}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-400">%{op.completionPercent}</span>
                      </div>
                    )}
                    {/* Hızlı durum değiştir */}
                    {nextStatus && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleQuickStatus(op, nextStatus); }}
                        className="w-full mt-1 px-2 py-1.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        → {OPERATION_STATUS_LABELS[nextStatus]}
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Yeni operasyon marker'ı */}
          {newOpCoords && (
            <CircleMarker
              center={[newOpCoords.lat, newOpCoords.lng]}
              radius={10}
              pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.3, weight: 2 }}
            />
          )}
        </IhaMapBase>
      </div>

      {/* ─── Üst overlay: Filtreler ─── */}
      <div className="absolute top-2 left-2 right-2 z-10 flex flex-wrap gap-1.5 pointer-events-none">
        {/* Katman filtresi */}
        <div className="pointer-events-auto flex rounded-lg overflow-hidden shadow-lg border border-[var(--border)]">
          {(["all", "operations", "permissions"] as LayerFilter[]).map((l) => (
            <button
              key={l}
              onClick={() => setLayerFilter(l)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                layerFilter === l ? "bg-[var(--accent)] text-white" : "bg-[var(--surface)] text-[var(--foreground)]"
              }`}
            >
              {l === "all" ? "Tümü" : l === "operations" ? "Operasyonlar" : "Uçuş İzinleri"}
            </button>
          ))}
        </div>

        {/* Durum filtresi */}
        <div className="pointer-events-auto flex rounded-lg overflow-hidden shadow-lg border border-[var(--border)]">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-2 py-2 text-xs font-medium transition-colors ${
              statusFilter === "all" ? "bg-[var(--accent)] text-white" : "bg-[var(--surface)] text-[var(--foreground)]"
            }`}
          >
            Hepsi
          </button>
          {STATUS_LIST.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
              className={`px-2 py-2 text-[10px] font-medium transition-colors flex items-center gap-1 ${
                statusFilter === s ? "bg-[var(--accent)] text-white" : "bg-[var(--surface)] text-[var(--foreground)]"
              }`}
            >
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: statusColors[s] }} />
              {statusCounts[s] ?? 0}
            </button>
          ))}
        </div>

        {/* Tip filtresi */}
        <div className="pointer-events-auto flex rounded-lg overflow-hidden shadow-lg border border-[var(--border)]">
          {TYPE_LIST.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(typeFilter === t ? "all" : t)}
              className={`px-2 py-2 text-xs transition-colors ${
                typeFilter === t ? "bg-[var(--accent)] text-white" : "bg-[var(--surface)] text-[var(--foreground)]"
              }`}
              title={OPERATION_TYPE_LABELS[t]}
            >
              {TYPE_ICON[t]}
            </button>
          ))}
        </div>

        {/* Arama */}
        <div className="pointer-events-auto">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="🔍 Ara..."
            className="px-3 py-2 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-lg w-32 sm:w-40 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
      </div>

      {/* ─── Alt overlay: Sayaçlar + Legend ─── */}
      <div className="absolute bottom-2 left-2 right-2 z-10 flex items-end justify-between pointer-events-none">
        {/* Sol: canlı sayaçlar */}
        <div className="pointer-events-auto rounded-lg bg-[var(--surface)]/90 backdrop-blur border border-[var(--border)] shadow-lg px-3 py-2 flex items-center gap-3 text-xs">
          <span className="font-semibold text-[var(--foreground)]">{filteredOps.length} operasyon</span>
          <span className="text-[var(--muted-foreground)]">{filteredPerms.length} izin</span>
          {statusFilter !== "all" && (
            <button onClick={() => setStatusFilter("all")} className="text-[var(--accent)] hover:underline">Filtreyi kaldır</button>
          )}
        </div>

        {/* Sağ: Legend */}
        <div className="pointer-events-auto rounded-lg bg-[var(--surface)]/90 backdrop-blur border border-[var(--border)] shadow-lg px-3 py-2 flex items-center gap-2 flex-wrap">
          {STATUS_LIST.map((s) => (
            <div key={s} className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full border border-white" style={{ backgroundColor: statusColors[s] }} />
              <span className="text-[10px] text-[var(--muted-foreground)] hidden sm:inline">{OPERATION_STATUS_LABELS[s]}</span>
            </div>
          ))}
          <span className="text-[var(--border)]">|</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-2 border border-green-500 bg-green-500/10 rounded-sm" />
            <span className="text-[10px] text-[var(--muted-foreground)] hidden sm:inline">İzin</span>
          </div>
        </div>
      </div>

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

/* ─── Yardımcı: Sonraki durum ─── */
const STATUS_FLOW: OperationStatus[] = ["talep", "planlama", "saha", "isleme", "kontrol", "teslim"];

function getNextStatus(current: OperationStatus): OperationStatus | null {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}
