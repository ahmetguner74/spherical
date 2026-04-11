"use client";

import { Marker, Polyline, Polygon, CircleMarker } from "react-leaflet";
import { IhaMapBase } from "../../map/IhaMapBase";
import { ClickHandler, FlyTo, FitBounds, markerIcon } from "../../map/mapHelpers";
import type { LocationCoordinate } from "@/types/iha";
import { polygonBounds } from "./locationHelpers";

interface MapCanvasProps {
  mode: "point" | "polygon";
  point?: LocationCoordinate;
  polygon: LocationCoordinate[];
  polygonClosed: boolean;
  onMapClick: (lat: number, lng: number) => void;
}

export function MapCanvas({ mode, point, polygon, polygonClosed, onMapClick }: MapCanvasProps) {
  // İlk açılış merkezi — mevcut nokta/poligon varsa oraya, yoksa Bursa merkez
  const center: [number, number] = point
    ? [point.lat, point.lng]
    : polygon.length > 0
    ? [polygon[0].lat, polygon[0].lng]
    : [40.1885, 29.0610];
  const zoom = point || polygon.length > 0 ? 14 : 11;

  // Poligon bounds (açıldığında tam kadraj için)
  const bounds = polygon.length >= 2 ? polygonBounds(polygon) : null;
  const boundPoints: [number, number][] = bounds
    ? [
        [bounds[0][0], bounds[0][1]],
        [bounds[1][0], bounds[1][1]],
      ]
    : [];

  const polyLatLngs: [number, number][] = polygon.map((c) => [c.lat, c.lng]);

  return (
    <IhaMapBase center={center} zoom={zoom} className="h-72 sm:h-80 w-full" onLocate={onMapClick} showLocate>
      <ClickHandler onSelect={onMapClick} />

      {/* Nokta modu */}
      {mode === "point" && point && (
        <>
          <Marker position={[point.lat, point.lng]} icon={markerIcon} />
          <FlyTo lat={point.lat} lng={point.lng} />
        </>
      )}

      {/* Poligon modu — çizim halindeyken polyline, kapanınca polygon */}
      {mode === "polygon" && polygon.length > 0 && (
        <>
          {polygonClosed ? (
            <Polygon positions={polyLatLngs} pathOptions={{ color: "#22c55e", weight: 2, fillOpacity: 0.15 }} />
          ) : (
            <Polyline positions={polyLatLngs} pathOptions={{ color: "#22c55e", weight: 2, dashArray: "4 4" }} />
          )}
          {polygon.map((c, i) => (
            <CircleMarker
              key={i}
              center={[c.lat, c.lng]}
              radius={4}
              pathOptions={{ color: "#22c55e", fillColor: "#22c55e", fillOpacity: 1 }}
            />
          ))}
          {boundPoints.length > 0 && <FitBounds points={boundPoints} />}
        </>
      )}
    </IhaMapBase>
  );
}
