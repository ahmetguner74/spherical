"use client";

import { MapContainer, TileLayer, LayersControl, useMapEvents } from "react-leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";
import { LocateControl } from "./mapHelpers";

interface IhaMapBaseProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  children?: React.ReactNode;
  onLocate?: (lat: number, lng: number) => void;
  showLocate?: boolean;
  onBaseLayerChange?: (name: string) => void;
}

const BURSA_CENTER: [number, number] = [40.1885, 29.0610];
const DEFAULT_ZOOM = 13;

export function IhaMapBase({
  center = BURSA_CENTER,
  zoom = DEFAULT_ZOOM,
  className = "h-96 w-full rounded-lg",
  children,
  onLocate,
  showLocate = true,
  onBaseLayerChange,
}: IhaMapBaseProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      style={{ zIndex: 30 }}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Harita">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Koyu">
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Uydu">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          />
        </LayersControl.BaseLayer>
      </LayersControl>
      {onBaseLayerChange && <BaseLayerListener onChange={onBaseLayerChange} />}
      {showLocate && <LocateControl onLocate={onLocate} />}
      {children}
    </MapContainer>
  );
}

/* Base layer değişikliğini parent'a bildirir */
function BaseLayerListener({ onChange }: { onChange: (name: string) => void }) {
  useMapEvents({
    baselayerchange: (e) => onChange(e.name),
  });
  return null;
}
