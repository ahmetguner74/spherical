"use client";

import { Marker } from "react-leaflet";
import { IhaMapBase } from "./IhaMapBase";
import { ClickHandler, FlyTo, markerIcon } from "./mapHelpers";

interface MapPickerProps {
  lat?: number;
  lng?: number;
  onSelect: (lat: number, lng: number) => void;
  className?: string;
}

export function MapPicker({ lat, lng, onSelect, className = "h-56 w-full rounded-lg" }: MapPickerProps) {
  const center: [number, number] = lat && lng ? [lat, lng] : [40.1885, 29.0610];
  const zoom = lat && lng ? 14 : 11;

  return (
    <IhaMapBase center={center} zoom={zoom} className={className}>
      <ClickHandler onSelect={onSelect} />
      {lat && lng && (
        <>
          <Marker position={[lat, lng]} icon={markerIcon} />
          <FlyTo lat={lat} lng={lng} />
        </>
      )}
    </IhaMapBase>
  );
}
