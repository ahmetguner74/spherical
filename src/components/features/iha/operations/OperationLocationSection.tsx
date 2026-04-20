"use client";

import { useState } from "react";
import type { Operation, LocationCoordinate, FlightPermission, OperationMainCategory } from "@/types/iha";
import { Button } from "@/components/ui/Button";
import { BURSA_ILCELER } from "@/config/iha";
import { IconMapPin } from "@/config/icons";
import { inputClass } from "../shared/styles";
import { PermissionBadge } from "../shared/PermissionBadge";
import { LocationPickerModal, type LocationPickerResult } from "./LocationPicker/LocationPickerModal";
import { formatAreaRaw, formatDistance } from "./LocationPicker/locationHelpers";

interface LocationState {
  il: string;
  ilce: string;
  mahalle: string;
  sokak: string;
  displayAddress: string;
  lat?: number;
  lng?: number;
  polygonCoordinates?: LocationCoordinate[];
  lineCoordinates?: LocationCoordinate[];
  lineLength?: number;
  alan?: number;
  alanBirimi?: "m2" | "km2" | "hektar";
  allIlces?: string[];
  paftalar: string[];
}

interface OperationLocationSectionProps {
  state: LocationState;
  setters: {
    setIl: (v: string) => void;
    setIlce: (v: string) => void;
    setMahalle: (v: string) => void;
    setSokak: (v: string) => void;
    setDisplayAddress: (v: string) => void;
    setLat: (v: number | undefined) => void;
    setLng: (v: number | undefined) => void;
    setPolygonCoordinates: (v: LocationCoordinate[] | undefined) => void;
    setLineCoordinates: (v: LocationCoordinate[] | undefined) => void;
    setLineLength: (v: number | undefined) => void;
    setAlan: (v: number | undefined) => void;
    setAlanBirimi: (v: "m2" | "km2" | "hektar" | undefined) => void;
    setAllIlces: (v: string[] | undefined) => void;
    setPaftalar: (v: string[]) => void;
  };
  operation?: Operation;
  mainCategory: OperationMainCategory;
  permissions: FlightPermission[];
  labelClass: string;
  /** İlçe alanı boşsa gösterilecek hata mesajı */
  ilceError?: string;
}

/**
 * Operasyon konum bölümü — OperationForm'dan ayrıştırıldı (v0.8.81)
 * - Haritadan konum seç butonu (primary veya outline — konum yoksa primary)
 * - Özet kart (ilçe/mahalle/sokak/poligon/çizgi + izin rozeti)
 * - Detay accordion — manuel düzenleme için il/ilçe/mahalle/sokak inputları
 */
export function OperationLocationSection({
  state, setters, operation, mainCategory, permissions, labelClass, ilceError,
}: OperationLocationSectionProps) {
  const {
    il, ilce, mahalle, sokak, displayAddress, lat, lng,
    polygonCoordinates, lineCoordinates, lineLength, alan, alanBirimi,
    allIlces, paftalar,
  } = state;

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationDetailsOpen, setLocationDetailsOpen] = useState(false);

  const handleLocationSave = (result: LocationPickerResult) => {
    if (result.point) { setters.setLat(result.point.lat); setters.setLng(result.point.lng); }
    setters.setPolygonCoordinates(result.polygon);
    setters.setLineCoordinates(result.line);
    setters.setLineLength(result.lineLengthM);
    if (!result.polygon) { setters.setAlan(undefined); setters.setAlanBirimi(undefined); }
    // Çoklu pafta tespiti (poligon birden fazla paftaya yayılırsa hepsi alınır)
    if (result.paftalar && result.paftalar.length > 0) {
      setters.setPaftalar(result.paftalar);
    } else if (result.pafta) {
      setters.setPaftalar([result.pafta]);
    }
    if (result.geocode?.ilce) setters.setIlce(result.geocode.ilce);
    if (result.geocode?.mahalle) setters.setMahalle(result.geocode.mahalle);
    if (result.geocode?.sokak) setters.setSokak(result.geocode.sokak);
    if (result.geocode?.displayAddress) setters.setDisplayAddress(result.geocode.displayAddress);
    setters.setAllIlces(result.geocode?.allIlces);
    if (result.areaValue && result.areaUnit) {
      setters.setAlan(result.areaValue);
      setters.setAlanBirimi(result.areaUnit);
    }
  };

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Konum</span>
        <button
          type="button"
          onClick={() => setLocationDetailsOpen(!locationDetailsOpen)}
          className="text-xs text-[var(--muted-foreground)] hover:text-[var(--accent)] underline"
        >
          {locationDetailsOpen ? "Manuel Düzenlemeyi Gizle" : "Manuel Düzenleme"}
        </button>
      </div>

      <Button
        type="button"
        variant={lat && lng ? "outline" : "primary"}
        onClick={() => setLocationModalOpen(true)}
        className="w-full justify-start min-h-[44px]"
      >
        <IconMapPin size={14} className="mr-1 shrink-0" />
        {lat && lng ? "Konumu Değiştir" : "Haritadan Konum Seç"}
      </Button>

      {/* Özet kart */}
      {((lat && lng) || ilce) && (
        <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-2 text-xs space-y-0.5">
          {ilce && (
            <p>
              <span className="text-[var(--muted-foreground)]">{il}/</span>
              <span className="text-[var(--foreground)]">{ilce}</span>
              {allIlces && allIlces.length > 1 && (
                <span className="text-[var(--accent)] ml-1">+ {allIlces.slice(1).join(", ")}</span>
              )}
              {mahalle && <span className="text-[var(--muted-foreground)]"> · {mahalle}</span>}
            </p>
          )}
          {sokak && <p className="text-[var(--muted-foreground)]">{sokak}</p>}
          {lat && lng && <p className="font-mono text-[var(--muted-foreground)]">{lat.toFixed(5)}, {lng.toFixed(5)}</p>}
          {paftalar.length > 0 && (
            <p className="text-[var(--accent)]">
              <span className="text-[var(--muted-foreground)]">📐 Pafta{paftalar.length > 1 ? `lar (${paftalar.length})` : ""}:</span>{" "}
              <span className="font-mono">{paftalar.join(", ")}</span>
            </p>
          )}
          {polygonCoordinates && polygonCoordinates.length > 0 && (
            <p className="text-[var(--accent)]">
              ▱ Poligon ({polygonCoordinates.length} köşe)
              {alan && alanBirimi && ` · ${formatAreaRaw(alan, alanBirimi)}`}
            </p>
          )}
          {lineCoordinates && lineCoordinates.length > 0 && (
            <p className="text-[var(--accent)]">
              〰 Çizgi ({lineCoordinates.length} köşe
              {lineLength && ` · ${formatDistance(lineLength)}`})
            </p>
          )}
          {displayAddress && <p className="text-[var(--muted-foreground)] truncate">{displayAddress}</p>}
          {/* İzin rozeti sadece İHA operasyonlarda */}
          {mainCategory === "iha" && operation && (
            <div className="pt-1">
              <PermissionBadge op={operation} permissions={permissions} />
            </div>
          )}
        </div>
      )}

      {/* Detay accordion: manuel düzenleme */}
      {locationDetailsOpen && (
        <div className="rounded-md border border-dashed border-[var(--border)] p-3 space-y-3">
          <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">Manuel Düzenleme</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>İl</label>
              <input type="text" value={il} onChange={(e) => setters.setIl(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>İlçe <span className="text-[var(--feedback-error)]">*</span></label>
              <select
                value={ilce}
                onChange={(e) => setters.setIlce(e.target.value)}
                className={`${inputClass}${ilceError ? " border-[var(--feedback-error)]" : ""}`}
                aria-invalid={!!ilceError}
              >
                <option value="">Seçin</option>
                {BURSA_ILCELER.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
              {ilceError && (
                <p className="text-xs text-[var(--feedback-error)] mt-1" role="alert">{ilceError}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Mahalle</label>
              <input type="text" value={mahalle} onChange={(e) => setters.setMahalle(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Sokak/Cadde</label>
            <input type="text" value={sokak} onChange={(e) => setters.setSokak(e.target.value)} className={inputClass} />
          </div>
        </div>
      )}

      <LocationPickerModal
        open={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSave={handleLocationSave}
        initialPoint={lat && lng ? { lat, lng } : undefined}
        initialPolygon={polygonCoordinates}
        initialLine={lineCoordinates}
      />
    </div>
  );
}
