"use client";

import { useMemo, useState, useEffect } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { NobetciEczane } from "./useNobetciEczane";
import { mapColors } from "@/config/tokens";

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

interface NobetciEczaneLayerProps {
  eczaneler: NobetciEczane[];
}

export function NobetciEczaneLayer({ eczaneler }: NobetciEczaneLayerProps) {
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
