"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Props {
  lat?: number;
  lng?: number;
  onSelect?: (lat: number, lng: number) => void;
  readonly?: boolean;
}

function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onSelect(e.latlng.lat, e.latlng.lng) });
  return null;
}

function FlyToMarker({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo([lat, lng], 13); }, [map, lat, lng]);
  return null;
}

export function WorkLocationMap({ lat, lng, onSelect, readonly }: Props) {
  const center: [number, number] = lat && lng ? [lat, lng] : [39.9, 32.8];
  const zoom = lat && lng ? 13 : 6;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-48 w-full rounded-lg"
      style={{ zIndex: 1 }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {!readonly && onSelect && <ClickHandler onSelect={onSelect} />}
      {lat && lng && (
        <>
          <Marker position={[lat, lng]} icon={icon} />
          <FlyToMarker lat={lat} lng={lng} />
        </>
      )}
    </MapContainer>
  );
}
