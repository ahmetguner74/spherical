"use client";

import { Marker, Popup, Polygon } from "react-leaflet";
import { IhaMapBase } from "./IhaMapBase";
import { createStatusIcon, FitBounds } from "./mapHelpers";
import type { Operation, FlightPermission } from "@/types/iha";
import { OPERATION_STATUS_LABELS, OPERATION_TYPE_LABELS, OPERATION_PRIORITY_LABELS } from "@/types/iha";

interface MapOperationsProps {
  operations: Operation[];
  permissions?: FlightPermission[];
  onSelectOperation?: (op: Operation) => void;
  className?: string;
}

export function MapOperations({
  operations,
  permissions = [],
  onSelectOperation,
  className = "h-96 w-full rounded-lg",
}: MapOperationsProps) {
  const opsWithLocation = operations.filter(
    (op) => op.location.lat && op.location.lng
  );

  const points: [number, number][] = opsWithLocation.map((op) => [
    op.location.lat!,
    op.location.lng!,
  ]);

  // Permission polygons
  const activePermissions = permissions.filter(
    (p) => p.status === "onaylandi" && p.polygonCoordinates.length >= 3
  );

  return (
    <IhaMapBase className={className}>
      {points.length > 0 && <FitBounds points={points} />}

      {/* Permission polygons */}
      {activePermissions.map((perm) => (
        <Polygon
          key={perm.id}
          positions={perm.polygonCoordinates.map((c) => [c.lat, c.lng] as [number, number])}
          pathOptions={{
            color: "#22c55e",
            fillColor: "#22c55e",
            fillOpacity: 0.1,
            weight: 2,
            dashArray: "5, 5",
          }}
        >
          <Popup>
            <div className="text-xs">
              <p className="font-semibold">{perm.hsdNumber ?? "Uçuş İzni"}</p>
              <p>{perm.startDate} — {perm.endDate}</p>
              {perm.maxAltitude && <p>Max: {perm.maxAltitude}m</p>}
            </div>
          </Popup>
        </Polygon>
      ))}

      {/* Operation markers */}
      {opsWithLocation.map((op) => (
        <Marker
          key={op.id}
          position={[op.location.lat!, op.location.lng!]}
          icon={createStatusIcon(op.status)}
          eventHandlers={{
            click: () => onSelectOperation?.(op),
          }}
        >
          <Popup>
            <div className="text-xs min-w-[160px]">
              <p className="font-semibold text-sm">{op.title}</p>
              <p className="text-gray-500">
                {OPERATION_TYPE_LABELS[op.type]}
              </p>
              <p className="text-gray-500">
                {op.location.il}/{op.location.ilce}
              </p>
              <div className="flex gap-2 mt-1">
                <span>{OPERATION_STATUS_LABELS[op.status]}</span>
                <span>{OPERATION_PRIORITY_LABELS[op.priority]}</span>
              </div>
              {op.location.alan && (
                <p className="mt-0.5">{op.location.alan.toLocaleString()} m²</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {opsWithLocation.length === 0 && activePermissions.length === 0 && (
        <div className="leaflet-top leaflet-left" style={{ pointerEvents: "none" }}>
          <div className="leaflet-control" style={{ margin: 50, pointerEvents: "none" }}>
            <p style={{ color: "#888", fontSize: 12 }}>
              Koordinatı olan operasyon yok
            </p>
          </div>
        </div>
      )}
    </IhaMapBase>
  );
}
