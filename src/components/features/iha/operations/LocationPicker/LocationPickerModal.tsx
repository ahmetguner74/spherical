"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { inputClass } from "../../shared/styles";
import type { LocationCoordinate } from "@/types/iha";
import { usePaftaData, findPaftaAt } from "../../map/usePaftaData";
import { reverseGeocode, type GeocodeResult } from "@/lib/geocoding";
import { parseKmlOrKmz } from "./kmlParser";
import {
  polygonAreaM2,
  chooseAreaUnit,
  polygonCentroid,
  formatArea,
} from "./locationHelpers";
import { logger } from "@/lib/logger";

// Harita SSR'sız (react-leaflet window gerektirir)
const MapCanvas = dynamic(() => import("./MapCanvas").then((m) => m.MapCanvas), { ssr: false });

export interface LocationPickerResult {
  point?: LocationCoordinate;
  polygon?: LocationCoordinate[];
  pafta?: string;
  geocode?: GeocodeResult;
  areaM2?: number;
  areaValue?: number;
  areaUnit?: "m2" | "km2" | "hektar";
}

interface LocationPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (result: LocationPickerResult) => void;
  initialPoint?: LocationCoordinate;
  initialPolygon?: LocationCoordinate[];
}

type Mode = "point" | "polygon";

export function LocationPickerModal({
  open,
  onClose,
  onSave,
  initialPoint,
  initialPolygon,
}: LocationPickerModalProps) {
  const [mode, setMode] = useState<Mode>(initialPolygon?.length ? "polygon" : "point");
  const [point, setPoint] = useState<LocationCoordinate | undefined>(initialPoint);
  const [polygon, setPolygon] = useState<LocationCoordinate[]>(initialPolygon ?? []);
  const [polygonClosed, setPolygonClosed] = useState<boolean>(!!initialPolygon?.length);
  const [geocode, setGeocode] = useState<GeocodeResult | null>(null);
  const [loadingGeocode, setLoadingGeocode] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const paftaData = usePaftaData();

  // Seçili lat/lng (nokta modu → point; poligon modu → centroid)
  const activeLatLng = useMemo<LocationCoordinate | null>(() => {
    if (mode === "point" && point) return point;
    if (mode === "polygon" && polygon.length >= 3) return polygonCentroid(polygon);
    return null;
  }, [mode, point, polygon]);

  // Pafta (lokal lookup)
  const pafta = useMemo(
    () => (activeLatLng ? findPaftaAt(activeLatLng.lat, activeLatLng.lng, paftaData) ?? undefined : undefined),
    [activeLatLng, paftaData],
  );

  // Alan hesabı
  const area = useMemo(() => {
    if (mode !== "polygon" || polygon.length < 3) return null;
    const m2 = polygonAreaM2(polygon);
    return { m2, ...chooseAreaUnit(m2) };
  }, [mode, polygon]);

  // Reverse geocode (debounced via timeout)
  useEffect(() => {
    if (!open || !activeLatLng) {
      setGeocode(null);
      return;
    }
    let cancelled = false;
    setLoadingGeocode(true);
    const t = setTimeout(async () => {
      const res = await reverseGeocode(activeLatLng.lat, activeLatLng.lng);
      if (!cancelled) {
        setGeocode(res);
        setLoadingGeocode(false);
      }
    }, 400);
    return () => { cancelled = true; clearTimeout(t); setLoadingGeocode(false); };
  }, [open, activeLatLng]);

  // Map click — mod bazlı
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (mode === "point") {
      setPoint({ lat, lng });
    } else {
      // Poligon modunda: kapalıysa yeniden başlat
      if (polygonClosed) {
        setPolygon([{ lat, lng }]);
        setPolygonClosed(false);
      } else {
        setPolygon((prev) => [...prev, { lat, lng }]);
      }
    }
  }, [mode, polygonClosed]);

  // Poligon modu aksiyonları
  const closePolygon = () => { if (polygon.length >= 3) setPolygonClosed(true); };
  const undoLastVertex = () => { setPolygon((prev) => prev.slice(0, -1)); setPolygonClosed(false); };
  const clearPolygon = () => { setPolygon([]); setPolygonClosed(false); };

  // KML/KMZ import
  const handleFile = async (file: File) => {
    setImportError(null);
    try {
      const res = await parseKmlOrKmz(file);
      if (res.polygon) {
        setMode("polygon");
        setPolygon(res.polygon);
        setPolygonClosed(true);
        setPoint(undefined);
      } else if (res.point) {
        setMode("point");
        setPoint(res.point);
        setPolygon([]);
        setPolygonClosed(false);
      }
    } catch (err) {
      logger.warn("KML import başarısız", err);
      setImportError(err instanceof Error ? err.message : "Dosya okunamadı");
    }
  };

  const handleSave = () => {
    const result: LocationPickerResult = {
      pafta,
      geocode: geocode ?? undefined,
    };
    if (mode === "point" && point) {
      result.point = point;
    } else if (mode === "polygon" && polygonClosed && polygon.length >= 3) {
      result.polygon = polygon;
      result.point = polygonCentroid(polygon) ?? undefined;
      if (area) {
        result.areaM2 = area.m2;
        result.areaValue = area.value;
        result.areaUnit = area.unit;
      }
    }
    onSave(result);
    onClose();
  };

  const canSave = (mode === "point" && !!point) || (mode === "polygon" && polygonClosed && polygon.length >= 3);

  return (
    <Modal open={open} onClose={onClose} className="sm:max-w-2xl">
      <h2 className="text-lg font-bold text-[var(--foreground)] mb-3 pr-6">Konum Seç</h2>

      {/* Mod seçici */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <Button size="sm" variant={mode === "point" ? "primary" : "outline"} onClick={() => setMode("point")}>
          📍 Nokta
        </Button>
        <Button size="sm" variant={mode === "polygon" ? "primary" : "outline"} onClick={() => setMode("polygon")}>
          ▱ Alan (Poligon)
        </Button>
        <label className={`${inputClass} cursor-pointer inline-flex items-center justify-center w-auto px-3 min-h-[36px] text-xs`}>
          📁 KML/KMZ İçe Aktar
          <input
            type="file"
            accept=".kml,.kmz"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </label>
      </div>

      {importError && <p className="text-xs text-red-500 mb-2">{importError}</p>}

      {/* Harita */}
      <div className="rounded-lg overflow-hidden border border-[var(--border)] mb-3">
        <MapCanvas
          mode={mode}
          point={point}
          polygon={polygon}
          polygonClosed={polygonClosed}
          onMapClick={handleMapClick}
        />
      </div>

      {/* Poligon kontrolleri */}
      {mode === "polygon" && (
        <div className="flex gap-2 flex-wrap mb-3">
          <Button size="sm" variant="outline" onClick={undoLastVertex} disabled={polygon.length === 0}>
            ↶ Son Noktayı Sil
          </Button>
          <Button size="sm" variant="outline" onClick={clearPolygon} disabled={polygon.length === 0}>
            Temizle
          </Button>
          {!polygonClosed && (
            <Button size="sm" variant="primary" onClick={closePolygon} disabled={polygon.length < 3}>
              Poligonu Kapat
            </Button>
          )}
          <span className="text-xs text-[var(--muted-foreground)] self-center ml-auto">
            {polygon.length} köşe
          </span>
        </div>
      )}

      {/* Özet */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 mb-3 text-xs space-y-1">
        {!activeLatLng && (
          <p className="text-[var(--muted-foreground)]">
            {mode === "point"
              ? "Haritada bir yere tıklayarak nokta seçin."
              : "Haritaya en az 3 nokta koyup 'Poligonu Kapat' deyin."}
          </p>
        )}
        {activeLatLng && (
          <>
            <p>
              <span className="text-[var(--muted-foreground)]">Koordinat:</span>{" "}
              <span className="font-mono">{activeLatLng.lat.toFixed(5)}, {activeLatLng.lng.toFixed(5)}</span>
            </p>
            {loadingGeocode && <p className="text-[var(--muted-foreground)]">Adres aranıyor…</p>}
            {geocode && (
              <>
                {geocode.ilce && <p><span className="text-[var(--muted-foreground)]">İlçe:</span> {geocode.ilce}</p>}
                {geocode.mahalle && <p><span className="text-[var(--muted-foreground)]">Mahalle:</span> {geocode.mahalle}</p>}
                {geocode.sokak && <p><span className="text-[var(--muted-foreground)]">Sokak:</span> {geocode.sokak}</p>}
              </>
            )}
            {pafta && <p><span className="text-[var(--muted-foreground)]">Pafta:</span> <span className="font-mono">{pafta}</span></p>}
            {area && <p><span className="text-[var(--muted-foreground)]">Alan:</span> {formatArea(area.value, area.unit)}</p>}
          </>
        )}
      </div>

      {/* Aksiyon butonları */}
      <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={onClose}>İptal</Button>
        <Button size="sm" onClick={handleSave} disabled={!canSave}>Kaydet</Button>
      </div>
    </Modal>
  );
}
