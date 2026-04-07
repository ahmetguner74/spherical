"use client";

import { Polygon, Marker } from "react-leaflet";
import { IhaMapBase } from "./IhaMapBase";
import { FitBounds, markerIcon } from "./mapHelpers";
import { mapColors } from "@/config/tokens";
import type { FlightPermissionCoordinate } from "@/types/iha";

interface MapPolygonProps {
  coordinates: FlightPermissionCoordinate[];
  className?: string;
}

export function MapPolygon({ coordinates, className = "h-56 w-full rounded-lg" }: MapPolygonProps) {
  const points: [number, number][] = coordinates.map((c) => [c.lat, c.lng]);
  const hasPolygon = points.length >= 3;

  return (
    <IhaMapBase className={className}>
      {points.length > 0 && <FitBounds points={points} />}

      {hasPolygon && (
        <Polygon
          positions={points}
          pathOptions={{
            color: mapColors.permission,
            fillColor: mapColors.permission,
            fillOpacity: 0.15,
            weight: 2,
          }}
        />
      )}

      {points.map((p, i) => (
        <Marker key={i} position={p} icon={markerIcon} />
      ))}
    </IhaMapBase>
  );
}
