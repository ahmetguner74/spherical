"use client";

import type { ReactNode } from "react";
import { Marker, Polyline, Polygon, CircleMarker } from "react-leaflet";
import L from "leaflet";
import { IhaMapBase } from "../../map/IhaMapBase";
import { ClickHandler, FlyTo, FitBounds, markerIcon } from "../../map/mapHelpers";
import type { LocationCoordinate } from "@/types/iha";
import { polygonBounds } from "./locationHelpers";

interface MapCanvasProps {
  mode: "point" | "polygon" | "line";
  point?: LocationCoordinate;
  polygon: LocationCoordinate[];
  line: LocationCoordinate[];
  shapeClosed: boolean;
  editMode: boolean;
  onMapClick: (lat: number, lng: number) => void;
  onVertexClick: (index: number) => void;
  /** Ek harita katmanları (PaftaLayer, IlceLayer, MahalleLayer vs.) */
  children?: ReactNode;
}

export function MapCanvas({
  mode, point, polygon, line, shapeClosed, editMode, onMapClick, onVertexClick, children,
}: MapCanvasProps) {
  const coords = mode === "polygon" ? polygon : mode === "line" ? line : [];

  // İlk açılış merkezi
  const center: [number, number] = point
    ? [point.lat, point.lng]
    : coords.length > 0
    ? [coords[0].lat, coords[0].lng]
    : [40.1885, 29.0610];
  const zoom = point || coords.length > 0 ? 14 : 11;

  // Bounds (açıldığında tam kadraj için)
  const bounds = coords.length >= 2 ? polygonBounds(coords) : null;
  const boundPoints: [number, number][] = bounds
    ? [
        [bounds[0][0], bounds[0][1]],
        [bounds[1][0], bounds[1][1]],
      ]
    : [];

  const shapePath: [number, number][] = coords.map((c) => [c.lat, c.lng]);

  // Köşe rengi edit modunda kırmızı (silinebilir), yoksa yeşil
  const vertexColor = editMode ? "#ef4444" : "#22c55e";
  const strokeColor = "#22c55e";

  return (
    <IhaMapBase center={center} zoom={zoom} className="h-56 sm:h-72 md:h-96 w-full" onLocate={onMapClick} showLocate>
      <ClickHandler onSelect={onMapClick} />
      {children}

      {/* Nokta modu */}
      {mode === "point" && point && (
        <>
          <Marker position={[point.lat, point.lng]} icon={markerIcon} />
          <FlyTo lat={point.lat} lng={point.lng} />
        </>
      )}

      {/* Poligon modu */}
      {mode === "polygon" && polygon.length > 0 && (
        <>
          {shapeClosed ? (
            <Polygon positions={shapePath} pathOptions={{ color: strokeColor, weight: 2, fillOpacity: 0.15 }} />
          ) : (
            <Polyline positions={shapePath} pathOptions={{ color: strokeColor, weight: 2, dashArray: "4 4" }} />
          )}
        </>
      )}

      {/* Çizgi modu */}
      {mode === "line" && line.length > 0 && (
        <Polyline
          positions={shapePath}
          pathOptions={{
            color: strokeColor,
            weight: shapeClosed ? 4 : 3,
            dashArray: shapeClosed ? undefined : "4 4",
          }}
        />
      )}

      {/* Köşe işaretçileri — click handler ile */}
      {(mode === "polygon" || mode === "line") && coords.map((c, i) => (
        <CircleMarker
          key={i}
          center={[c.lat, c.lng]}
          radius={editMode ? 7 : 4}
          pathOptions={{
            color: vertexColor,
            fillColor: vertexColor,
            fillOpacity: 1,
            weight: editMode ? 2 : 1,
          }}
          eventHandlers={{
            click: (e) => {
              L.DomEvent.stopPropagation(e);
              onVertexClick(i);
            },
          }}
        />
      ))}

      {boundPoints.length > 0 && <FitBounds points={boundPoints} />}
    </IhaMapBase>
  );
}
