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
  polylineLengthM,
  formatArea,
  formatDistance,
} from "./locationHelpers";
import { logger } from "@/lib/logger";

// Harita SSR'sız (react-leaflet window gerektirir)
const MapCanvas = dynamic(() => import("./MapCanvas").then((m) => m.MapCanvas), { ssr: false });

export interface LocationPickerResult {
  point?: LocationCoordinate;
  polygon?: LocationCoordinate[];
  line?: LocationCoordinate[];
  lineLengthM?: number;
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
  initialLine?: LocationCoordinate[];
}

export type LocationMode = "point" | "polygon" | "line";

export function LocationPickerModal({
  open,
  onClose,
  onSave,
  initialPoint,
  initialPolygon,
  initialLine,
}: LocationPickerModalProps) {
  const initialMode: LocationMode = initialPolygon?.length
    ? "polygon"
    : initialLine?.length
    ? "line"
    : "point";
  const [mode, setMode] = useState<LocationMode>(initialMode);
  const [point, setPoint] = useState<LocationCoordinate | undefined>(initialPoint);
  const [polygon, setPolygon] = useState<LocationCoordinate[]>(initialPolygon ?? []);
  const [line, setLine] = useState<LocationCoordinate[]>(initialLine ?? []);
  const [shapeClosed, setShapeClosed] = useState<boolean>(!!(initialPolygon?.length || initialLine?.length));
  const [editMode, setEditMode] = useState(false);
  const [geocode, setGeocode] = useState<GeocodeResult | null>(null);
  const [loadingGeocode, setLoadingGeocode] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const paftaData = usePaftaData();

  // Seçili lat/lng (reverse geocode için)
  const activeLatLng = useMemo<LocationCoordinate | null>(() => {
    if (mode === "point" && point) return point;
    if (mode === "polygon" && polygon.length >= 3) return polygonCentroid(polygon);
    if (mode === "line" && line.length >= 2) return line[Math.floor(line.length / 2)]; // orta nokta
    return null;
  }, [mode, point, polygon, line]);

  // Pafta (lokal lookup)
  const pafta = useMemo(
    () => (activeLatLng ? findPaftaAt(activeLatLng.lat, activeLatLng.lng, paftaData) ?? undefined : undefined),
    [activeLatLng, paftaData],
  );

  // Alan (poligon için)
  const area = useMemo(() => {
    if (mode !== "polygon" || polygon.length < 3) return null;
    const m2 = polygonAreaM2(polygon);
    return { m2, ...chooseAreaUnit(m2) };
  }, [mode, polygon]);

  // Uzunluk (çizgi için)
  const lineLength = useMemo(() => {
    if (mode !== "line" || line.length < 2) return null;
    return polylineLengthM(line);
  }, [mode, line]);

  // Reverse geocode — debounce ile
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
    }, 500);
    return () => { cancelled = true; clearTimeout(t); setLoadingGeocode(false); };
  }, [open, activeLatLng]);

  // Map click handler — mod + edit state bazlı
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (mode === "point") {
      setPoint({ lat, lng });
      return;
    }

    const activeList = mode === "polygon" ? polygon : line;
    const setActiveList = mode === "polygon" ? setPolygon : setLine;

    // Kapalı + edit mod değil → yeniden başla
    if (shapeClosed && !editMode) {
      setActiveList([{ lat, lng }]);
      setShapeClosed(false);
    } else {
      // Açık veya edit modda → sona ekle
      setActiveList([...activeList, { lat, lng }]);
      if (shapeClosed) setShapeClosed(false);
    }
  }, [mode, polygon, line, shapeClosed, editMode]);

  // Vertex sil (üzerine tıklayınca)
  const handleVertexClick = useCallback((index: number) => {
    // Sadece edit modunda veya çizim sırasında sil
    if (!editMode && !shapeClosed) return;
    if (!editMode && shapeClosed) return; // kapalı ama edit değil → yoksay

    const activeList = mode === "polygon" ? polygon : line;
    const setActiveList = mode === "polygon" ? setPolygon : setLine;
    const newList = activeList.filter((_, i) => i !== index);
    setActiveList(newList);
    // Minimum köşe koruması
    if (mode === "polygon" && newList.length < 3) setShapeClosed(false);
    if (mode === "line" && newList.length < 2) setShapeClosed(false);
  }, [mode, polygon, line, editMode, shapeClosed]);

  // Mod değiştirme — diğer şekilleri temizle
  const changeMode = (newMode: LocationMode) => {
    setMode(newMode);
    setEditMode(false);
    if (newMode !== "point") setPoint(undefined);
    if (newMode !== "polygon") { setPolygon([]); }
    if (newMode !== "line") { setLine([]); }
    setShapeClosed(false);
  };

  // Kapatma / Temizleme / Düzenleme
  const closeShape = () => {
    if (mode === "polygon" && polygon.length >= 3) setShapeClosed(true);
    if (mode === "line" && line.length >= 2) setShapeClosed(true);
    setEditMode(false);
  };
  const undoLastVertex = () => {
    if (mode === "polygon") setPolygon((p) => p.slice(0, -1));
    if (mode === "line") setLine((l) => l.slice(0, -1));
    setShapeClosed(false);
    setEditMode(false);
  };
  const clearShape = () => {
    if (mode === "polygon") setPolygon([]);
    if (mode === "line") setLine([]);
    setShapeClosed(false);
    setEditMode(false);
  };
  const toggleEdit = () => setEditMode((e) => !e);

  // KML/KMZ import
  const handleFile = async (file: File) => {
    setImportError(null);
    try {
      const res = await parseKmlOrKmz(file);
      if (res.polygon) {
        setMode("polygon");
        setPolygon(res.polygon);
        setLine([]);
        setShapeClosed(true);
        setEditMode(false);
        setPoint(undefined);
      } else if (res.point) {
        setMode("point");
        setPoint(res.point);
        setPolygon([]);
        setLine([]);
        setShapeClosed(false);
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
    } else if (mode === "polygon" && shapeClosed && polygon.length >= 3) {
      result.polygon = polygon;
      result.point = polygonCentroid(polygon) ?? undefined;
      if (area) {
        result.areaM2 = area.m2;
        result.areaValue = area.value;
        result.areaUnit = area.unit;
      }
    } else if (mode === "line" && shapeClosed && line.length >= 2) {
      result.line = line;
      result.lineLengthM = lineLength ?? 0;
      // Operasyonun harita marker'ı için orta noktayı point olarak set et
      result.point = line[Math.floor(line.length / 2)];
    }
    onSave(result);
    onClose();
  };

  const canSave =
    (mode === "point" && !!point) ||
    (mode === "polygon" && shapeClosed && polygon.length >= 3) ||
    (mode === "line" && shapeClosed && line.length >= 2);

  return (
    <Modal open={open} onClose={onClose} className="sm:max-w-2xl">
      <h2 className="text-lg font-bold text-[var(--foreground)] mb-3 pr-6">Konum Seç</h2>

      {/* Mod seçici */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        <Button size="sm" variant={mode === "point" ? "primary" : "outline"} onClick={() => changeMode("point")}>
          📍 Nokta
        </Button>
        <Button size="sm" variant={mode === "polygon" ? "primary" : "outline"} onClick={() => changeMode("polygon")}>
          ▱ Alan
        </Button>
        <Button size="sm" variant={mode === "line" ? "primary" : "outline"} onClick={() => changeMode("line")}>
          〰 Çizgi
        </Button>
        <label className={`${inputClass} cursor-pointer inline-flex items-center justify-center w-auto px-3 min-h-[36px] text-xs flex-shrink-0`}>
          📁 KML/KMZ
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
          line={line}
          shapeClosed={shapeClosed}
          editMode={editMode}
          onMapClick={handleMapClick}
          onVertexClick={handleVertexClick}
        />
      </div>

      {/* Şekil kontrolleri (polygon + line için) */}
      {(mode === "polygon" || mode === "line") && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          <Button size="sm" variant="outline" onClick={undoLastVertex} disabled={(mode === "polygon" ? polygon.length : line.length) === 0}>
            ↶ Son Nokta
          </Button>
          <Button size="sm" variant="outline" onClick={clearShape} disabled={(mode === "polygon" ? polygon.length : line.length) === 0}>
            Temizle
          </Button>
          {!shapeClosed && (
            <Button
              size="sm"
              variant="primary"
              onClick={closeShape}
              disabled={mode === "polygon" ? polygon.length < 3 : line.length < 2}
            >
              {mode === "polygon" ? "Poligonu Kapat" : "Çizgiyi Bitir"}
            </Button>
          )}
          {shapeClosed && (
            <Button size="sm" variant={editMode ? "primary" : "outline"} onClick={toggleEdit}>
              {editMode ? "Düzenlemeyi Bitir" : "✎ Düzenle"}
            </Button>
          )}
          <span className="text-xs text-[var(--muted-foreground)] self-center ml-auto">
            {mode === "polygon" ? polygon.length : line.length} köşe
          </span>
        </div>
      )}

      {editMode && (
        <p className="text-xs text-[var(--accent)] mb-2">
          Düzenleme modu: Haritaya tıkla → yeni köşe ekle · Köşe üstüne tıkla → sil
        </p>
      )}

      {/* Özet */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 mb-3 text-xs space-y-1">
        {!activeLatLng && (
          <p className="text-[var(--muted-foreground)]">
            {mode === "point" && "Haritada bir yere tıklayarak nokta seçin."}
            {mode === "polygon" && "Haritaya en az 3 köşe koyup 'Poligonu Kapat' deyin."}
            {mode === "line" && "Haritaya en az 2 nokta koyup 'Çizgiyi Bitir' deyin."}
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
            {lineLength !== null && lineLength > 0 && (
              <p><span className="text-[var(--muted-foreground)]">Uzunluk:</span> {formatDistance(lineLength)}</p>
            )}
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
