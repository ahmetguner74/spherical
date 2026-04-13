"use client";

import { useMemo, useState, useEffect } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useNobetciEczane, type NobetciEczane } from "./useNobetciEczane";
import { mapColors } from "@/config/tokens";
import { IconLoader } from "@/config/icons";

const MIN_ZOOM = 10;

// ─── Eczane ikonu (yeşil artı) ───

function createEczaneIcon(selected = false): L.DivIcon {
  const size = selected ? 32 : 24;
  const color = mapColors.eczane;
  return new L.DivIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:2px solid ${mapColors.contrastText};
      border-radius:50%;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
    ">
      <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 16 16" fill="${mapColors.contrastText}">
        <rect x="6" y="2" width="4" height="12" rx="1"/>
        <rect x="2" y="6" width="12" height="4" rx="1"/>
      </svg>
    </div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

const defaultIcon = createEczaneIcon(false);
const selectedIcon = createEczaneIcon(true);

// ─── Layer ───

export function NobetciEczaneLayer() {
  const { eczaneler, lastUpdate, isLoading, error, refresh, isTodayFetched } = useNobetciEczane();
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  const [boundsVersion, setBoundsVersion] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const onChange = () => {
      setZoom(map.getZoom());
      setBoundsVersion((v) => v + 1);
    };
    map.on("zoomend", onChange);
    map.on("moveend", onChange);
    return () => {
      map.off("zoomend", onChange);
      map.off("moveend", onChange);
    };
  }, [map]);

  const isVisible = zoom >= MIN_ZOOM;

  // Viewport culling
  const visibleEczaneler = useMemo(() => {
    if (!isVisible || eczaneler.length === 0) return [];
    const bounds = map.getBounds();
    const pad = 0.01;
    const south = bounds.getSouth() - pad;
    const north = bounds.getNorth() + pad;
    const west = bounds.getWest() - pad;
    const east = bounds.getEast() + pad;
    return eczaneler.filter(
      (e) => e.lat >= south && e.lat <= north && e.lng >= west && e.lng <= east,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eczaneler, isVisible, map, boundsVersion]);

  return (
    <>
      {/* Kontrol paneli — sol alt (harita üzerinde) */}
      <div className="leaflet-bottom leaflet-left" style={{ zIndex: 1000 }}>
        <div className="leaflet-control" style={{ marginBottom: 50, marginLeft: 10 }}>
          <EczaneControl
            count={eczaneler.length}
            lastUpdate={lastUpdate}
            isLoading={isLoading}
            error={error}
            onRefresh={refresh}
            isTodayFetched={isTodayFetched}
          />
        </div>
      </div>

      {/* Marker'lar */}
      {isVisible && visibleEczaneler.map((eczane) => (
        <Marker
          key={eczane.id}
          position={[eczane.lat, eczane.lng]}
          icon={selectedId === eczane.id ? selectedIcon : defaultIcon}
          eventHandlers={{ click: () => setSelectedId(eczane.id) }}
        >
          <Popup eventHandlers={{ remove: () => setSelectedId(null) }}>
            <EczanePopup eczane={eczane} />
          </Popup>
        </Marker>
      ))}
    </>
  );
}

// ─── Kontrol paneli (tarih + buton) ───

function EczaneControl({
  count,
  lastUpdate,
  isLoading,
  error,
  onRefresh,
  isTodayFetched,
}: {
  count: number;
  lastUpdate: string | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  isTodayFetched: boolean;
}) {
  const hasData = count > 0;
  const isLocked = hasData && isTodayFetched;

  return (
    <div
      style={{
        background: "var(--surface, #fff)",
        border: "1px solid var(--border, #e5e5e5)",
        borderRadius: 8,
        padding: "8px 12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        minWidth: 180,
        fontSize: 12,
      }}
    >
      {/* Üst: başlık + tarih */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: hasData ? mapColors.eczane : mapColors.emptyText,
          flexShrink: 0,
        }} />
        <span style={{ fontWeight: 600, color: "var(--foreground, #1a1a1a)" }}>
          Nöbetçi Eczaneler
        </span>
      </div>

      {/* Tarih + sayı bilgisi */}
      {hasData && lastUpdate && (
        <div style={{ color: "var(--muted-foreground, #78716c)", marginBottom: 6 }}>
          {count} eczane · <span style={{ fontWeight: 500 }}>{formatDate(lastUpdate)}</span>
        </div>
      )}

      {/* Hata mesajı */}
      {error && (
        <div style={{ color: "#ef4444", marginBottom: 6 }}>
          {error}
        </div>
      )}

      {/* Buton */}
      <button
        type="button"
        onClick={onRefresh}
        disabled={isLoading || isLocked}
        style={{
          width: "100%",
          padding: "6px 0",
          borderRadius: 6,
          border: "none",
          background: isLocked
            ? "var(--surface-hover, #e7e5e4)"
            : hasData ? "var(--surface-hover, #e7e5e4)" : mapColors.eczane,
          color: isLocked
            ? "var(--muted-foreground, #78716c)"
            : hasData ? "var(--foreground, #1a1a1a)" : mapColors.contrastText,
          fontWeight: 600,
          fontSize: 12,
          cursor: isLocked ? "not-allowed" : isLoading ? "wait" : "pointer",
          opacity: isLocked ? 0.7 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        {isLoading ? (
          <>
            <IconLoader size={14} className="animate-spin" />
            Yükleniyor...
          </>
        ) : isLocked ? (
          "Bugün güncellendi"
        ) : hasData ? (
          "Güncelle"
        ) : (
          "Veri Çek"
        )}
      </button>
    </div>
  );
}

// ─── Tarih formatlama (2026-04-13 → 13 Nisan 2026) ───

const AY_ISIMLERI = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${d} ${AY_ISIMLERI[m - 1]} ${y}`;
}

// ─── Popup içeriği ───

function EczanePopup({ eczane }: { eczane: NobetciEczane }) {
  return (
    <div className="min-w-[200px] text-xs space-y-1">
      <p className="font-bold text-sm" style={{ color: mapColors.eczane }}>
        {eczane.name}
      </p>
      <p className="font-medium" style={{ color: mapColors.newMarker }}>
        {eczane.district}
      </p>
      <p className="text-gray-600 dark:text-gray-400">
        {eczane.address}
      </p>
      <a
        href={`tel:${eczane.phone.replace(/\s/g, "")}`}
        className="block font-medium"
        style={{ color: mapColors.newMarker }}
      >
        {eczane.phone}
      </a>
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${eczane.lat},${eczane.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-2 text-center px-3 py-1.5 text-white text-xs font-medium rounded transition-colors"
        style={{ background: mapColors.eczane }}
      >
        Yol Tarifi
      </a>
    </div>
  );
}
