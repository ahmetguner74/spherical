"use client";

import { useState } from "react";
import { FormInput, Button } from "@/components/ui";
import { MapPolygon } from "../../map";
import { decimalToDmsString, metersToNm, nmToMeters } from "@/lib/coordinates";
import { LocationPickerModal, type LocationPickerResult } from "../../operations/LocationPicker/LocationPickerModal";
import type { FlightPermissionCoordinate, FlightZoneType, TakeoffLandingPoint } from "@/types/iha";

interface ZoneSectionProps {
  regionCity: string;
  regionDistrict: string;
  regionArea: string;
  zoneType: FlightZoneType;
  polygonCoordinates: FlightPermissionCoordinate[];
  circleCenter: { lat: string; lng: string };
  circleRadiusNm: number;
  routeCoordinates: FlightPermissionCoordinate[];
  routeWidthNm: number;
  takeoffPoints: TakeoffLandingPoint[];
  landingPoints: TakeoffLandingPoint[];
  onUpdate: (field: string, value: unknown) => void;
}

const ZONE_LABELS: Record<FlightZoneType, string> = { polygon: "Çokgen", circle: "Daire", route: "Rota" };

export function ZoneSection({
  regionCity, regionDistrict, regionArea,
  zoneType, polygonCoordinates, circleCenter, circleRadiusNm,
  routeCoordinates, routeWidthNm,
  takeoffPoints, landingPoints,
  onUpdate,
}: ZoneSectionProps) {
  const [zonePickerOpen, setZonePickerOpen] = useState(false);
  const [takeoffPickerOpen, setTakeoffPickerOpen] = useState(false);
  const [landingPickerOpen, setLandingPickerOpen] = useState(false);
  const [newAddress, setNewAddress] = useState("");

  const handleZoneSave = (result: LocationPickerResult) => {
    if (zoneType === "polygon" && result.polygon && result.polygon.length >= 3) {
      onUpdate("polygonCoordinates", result.polygon);
    } else if (zoneType === "route" && result.polygon && result.polygon.length >= 2) {
      onUpdate("routeCoordinates", result.polygon);
    }
  };

  const handlePointSave = (result: LocationPickerResult, target: "takeoff" | "landing") => {
    if (result.point) {
      const point: TakeoffLandingPoint = { address: newAddress, coordinate: result.point };
      const field = target === "takeoff" ? "takeoffPoints" : "landingPoints";
      const current = target === "takeoff" ? takeoffPoints : landingPoints;
      onUpdate(field, [...current, point]);
      setNewAddress("");
    }
  };

  const removePoint = (target: "takeoff" | "landing", idx: number) => {
    const field = target === "takeoff" ? "takeoffPoints" : "landingPoints";
    const current = target === "takeoff" ? [...takeoffPoints] : [...landingPoints];
    current.splice(idx, 1);
    onUpdate(field, current);
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Uçuş Bölgesi" />
      <div className="grid grid-cols-3 gap-3">
        <FormInput label="İl" value={regionCity} onChange={(e) => onUpdate("regionCity", e.target.value)} />
        <FormInput label="İlçe" value={regionDistrict} onChange={(e) => onUpdate("regionDistrict", e.target.value)} />
        <FormInput label="Bölge" value={regionArea} onChange={(e) => onUpdate("regionArea", e.target.value)} placeholder="Mahalle/Alan adı" />
      </div>

      {/* Bölge Tipi */}
      <div className="flex gap-2">
        {(["polygon", "circle", "route"] as FlightZoneType[]).map((zt) => (
          <button
            key={zt}
            type="button"
            onClick={() => onUpdate("zoneType", zt)}
            className={`px-4 py-2 rounded-md text-xs font-medium transition-all min-h-[44px] ${
              zoneType === zt
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--surface)]"
            }`}
          >
            {ZONE_LABELS[zt]}
          </button>
        ))}
      </div>

      {/* Daire */}
      {zoneType === "circle" && (
        <div className="grid grid-cols-3 gap-3">
          <FormInput label="Merkez Enlem" value={circleCenter.lat} onChange={(e) => onUpdate("circleCenterLat", e.target.value)} placeholder="40.1885" />
          <FormInput label="Merkez Boylam" value={circleCenter.lng} onChange={(e) => onUpdate("circleCenterLng", e.target.value)} placeholder="29.0610" />
          <FormInput label="Yarıçap (NM)" type="number" value={circleRadiusNm} onChange={(e) => {
            const nm = Number(e.target.value);
            onUpdate("circleRadiusNm", nm);
            onUpdate("circleRadius", nmToMeters(nm));
          }} min={0} step={0.1} />
        </div>
      )}

      {/* Rota */}
      {zoneType === "route" && (
        <div className="space-y-2">
          <FormInput label="Rota Genişliği (NM)" type="number" value={routeWidthNm} onChange={(e) => {
            const nm = Number(e.target.value);
            onUpdate("routeWidthNm", nm);
            onUpdate("routeWidth", nmToMeters(nm));
          }} min={0} step={0.1} />
          <Button type="button" variant={routeCoordinates.length >= 2 ? "outline" : "primary"} onClick={() => setZonePickerOpen(true)} className="w-full min-h-[44px]">
            {routeCoordinates.length >= 2 ? `Rotayı Değiştir (${routeCoordinates.length} nokta)` : "Haritadan Rota Çiz"}
          </Button>
        </div>
      )}

      {/* Çokgen */}
      {zoneType === "polygon" && (
        <div className="space-y-2">
          <Button type="button" variant={polygonCoordinates.length >= 3 ? "outline" : "primary"} onClick={() => setZonePickerOpen(true)} className="w-full min-h-[44px]">
            {polygonCoordinates.length >= 3 ? `Poligonu Değiştir (${polygonCoordinates.length} köşe)` : "Haritadan Poligon Çiz"}
          </Button>
          {polygonCoordinates.length >= 3 && <MapPolygon coordinates={polygonCoordinates} className="h-36 w-full rounded-lg" />}
        </div>
      )}

      {/* Koordinat listesi (DMS) */}
      {((zoneType === "polygon" && polygonCoordinates.length > 0) || (zoneType === "route" && routeCoordinates.length > 0)) && (
        <CoordList coords={zoneType === "polygon" ? polygonCoordinates : routeCoordinates} />
      )}

      {/* Kalkış / İniş Noktaları */}
      <SectionHeader title="Kalkış Noktaları" />
      <PointList points={takeoffPoints} onRemove={(i) => removePoint("takeoff", i)} />
      <div className="flex gap-2">
        <div className="flex-1">
          <FormInput label="" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="Kalkış adresi yazın..." />
        </div>
        <Button type="button" variant="outline" onClick={() => setTakeoffPickerOpen(true)} className="min-h-[44px] mt-auto whitespace-nowrap">+ Haritadan Ekle</Button>
      </div>

      <SectionHeader title="İniş Noktaları" />
      <PointList points={landingPoints} onRemove={(i) => removePoint("landing", i)} />
      <Button type="button" variant="outline" onClick={() => setLandingPickerOpen(true)} className="w-full min-h-[44px]">+ İniş Noktası Ekle</Button>

      {/* Modaller */}
      <LocationPickerModal
        open={zonePickerOpen}
        onClose={() => setZonePickerOpen(false)}
        onSave={handleZoneSave}
        initialPolygon={zoneType === "polygon" && polygonCoordinates.length >= 3 ? polygonCoordinates : zoneType === "route" && routeCoordinates.length >= 2 ? routeCoordinates : undefined}
      />
      <LocationPickerModal
        open={takeoffPickerOpen}
        onClose={() => setTakeoffPickerOpen(false)}
        onSave={(r) => handlePointSave(r, "takeoff")}
      />
      <LocationPickerModal
        open={landingPickerOpen}
        onClose={() => setLandingPickerOpen(false)}
        onSave={(r) => handlePointSave(r, "landing")}
      />
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="pt-2 border-t border-[var(--border)]">
      <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">{title}</h4>
    </div>
  );
}

function CoordList({ coords }: { coords: FlightPermissionCoordinate[] }) {
  return (
    <div className="rounded-lg bg-[var(--surface)] p-3">
      <p className="text-[10px] font-semibold text-[var(--muted-foreground)] mb-1 uppercase">Koordinatlar (WGS-84 DMS)</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {coords.map((c, i) => (
          <span key={i} className="text-[11px] font-mono text-[var(--muted-foreground)]">
            {i + 1}. {decimalToDmsString(c.lat, true)} / {decimalToDmsString(c.lng, false)}
          </span>
        ))}
      </div>
    </div>
  );
}

function PointList({ points, onRemove }: { points: TakeoffLandingPoint[]; onRemove: (i: number) => void }) {
  if (!points.length) return <p className="text-xs text-[var(--muted-foreground)]">Henüz nokta eklenmedi</p>;
  return (
    <div className="space-y-1">
      {points.map((p, i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg bg-[var(--surface)] p-2 text-xs">
          <span className="flex-1 truncate">
            {p.address || `${decimalToDmsString(p.coordinate.lat, true)} / ${decimalToDmsString(p.coordinate.lng, false)}`}
          </span>
          <button type="button" onClick={() => onRemove(i)} className="text-[var(--feedback-error)] hover:underline shrink-0">Sil</button>
        </div>
      ))}
    </div>
  );
}
