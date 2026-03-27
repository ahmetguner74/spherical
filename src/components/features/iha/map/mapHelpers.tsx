"use client";

import { useEffect } from "react";
import { useMapEvents, useMap, Marker, Popup, Polygon } from "react-leaflet";
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
