"use client";

import { useEffect, useState, useCallback } from "react";
import { useMapEvents, useMap, CircleMarker } from "react-leaflet";
import L from "leaflet";

// --- Marker Icon ---
export const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Status-based colored circle markers
const STATUS_COLORS: Record<string, string> = {
  talep: "#6b7280",
  planlama: "#eab308",
  saha: "#22c55e",
  isleme: "#f97316",
  kontrol: "#3b82f6",
  teslim: "#10b981",
  iptal: "#ef4444",
};

export function createStatusIcon(status: string): L.DivIcon {
  const color = STATUS_COLORS[status] ?? "#6b7280";
  return new L.DivIcon({
    html: `<div style="
      width: 14px; height: 14px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
    "></div>`,
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

// --- Click to place pin ---
export function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onSelect(e.latlng.lat, e.latlng.lng) });
  return null;
}

// --- Fly to location ---
export function FlyTo({ lat, lng, zoom = 14 }: { lat: number; lng: number; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom);
  }, [map, lat, lng, zoom]);
  return null;
}

// --- Fit bounds to all markers ---
export function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.flyTo(points[0], 14);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])));
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [map, points]);
  return null;
}

// --- Mevcut konum butonu ---
export function LocateControl({
  onLocate,
}: {
  onLocate?: (lat: number, lng: number) => void;
}) {
  const map = useMap();
  const [locating, setLocating] = useState(false);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPos([latitude, longitude]);
        map.flyTo([latitude, longitude], 16);
        onLocate?.(latitude, longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [map, onLocate]);

  return (
    <>
      {/* Buton — haritanın sağ altında */}
      <div className="leaflet-bottom leaflet-right" style={{ zIndex: 1000 }}>
        <div className="leaflet-control" style={{ marginBottom: 20, marginRight: 10 }}>
          <button
            onClick={handleLocate}
            disabled={locating}
            title="Konumuma git"
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              border: "2px solid rgba(0,0,0,0.2)",
              background: "white",
              cursor: locating ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            {locating ? "..." : "◎"}
          </button>
        </div>
      </div>

      {/* Mavi nokta — kullanıcı konumu */}
      {userPos && (
        <CircleMarker
          center={userPos}
          radius={8}
          pathOptions={{
            color: "#3b82f6",
            fillColor: "#3b82f6",
            fillOpacity: 0.4,
            weight: 2,
          }}
        />
      )}
    </>
  );
}
