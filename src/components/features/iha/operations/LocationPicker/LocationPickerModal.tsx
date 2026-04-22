"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { inputClass } from "../../shared/styles";
import type { LocationCoordinate } from "@/types/iha";
import { usePaftaData, findPaftaAt } from "../../map/usePaftaData";
import { useIlceData, findIlceAt } from "../../map/useIlceData";
import { useMahalleData, findMahalleAt } from "../../map/useMahalleData";
import { fetchStreetName, type MultiGeocodeResult } from "@/lib/geocoding";
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
import { IconTrash, IconUndo, IconLoader } from "@/config/icons";

// Harita SSR'sız (react-leaflet window gerektirir)
const MapCanvas = dynamic(() => import("./MapCanvas").then((m) => m.MapCanvas), { ssr: false });
// Overlay katmanları (SSR'sız — leaflet window gerektirir)
const PaftaLayer = dynamic(() => import("../../map/PaftaLayer").then((m) => ({ default: m.PaftaLayer })), { ssr: false });
const IlceLayer = dynamic(() => import("../../map/IlceLayer").then((m) => ({ default: m.IlceLayer })), { ssr: false });
const MahalleLayer = dynamic(() => import("../../map/MahalleLayer").then((m) => ({ default: m.MahalleLayer })), { ssr: false });

export interface LocationPickerResult {
  point?: LocationCoordinate;
  polygon?: LocationCoordinate[];
  line?: LocationCoordinate[];
  lineLengthM?: number;
  /** İlk pafta (geriye uyumluluk için, OperationLocation.pafta alanına yazılır) */
  pafta?: string;
  /** Tespit edilen tüm paftalar. Nokta için 1, poligon/çizgi için 1 veya daha fazla */
  paftalar?: string[];
  geocode?: MultiGeocodeResult;
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
  const [streetName, setStreetName] = useState<string | null>(null);
  const [loadingStreet, setLoadingStreet] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  // Overlay katman toggle'ları (harita sekmesindeki ile aynı katmanlar)
  const [showPaftalar, setShowPaftalar] = useState(false);
  const [showIlceler, setShowIlceler] = useState(false);
  const [showMahalleler, setShowMahalleler] = useState(false);

  const paftaData = usePaftaData();
  const ilceData = useIlceData();
  const mahalleData = useMahalleData();

  // Seçili lat/lng (pafta lookup için — centroid/orta nokta)
  const activeLatLng = useMemo<LocationCoordinate | null>(() => {
    if (mode === "point" && point) return point;
    if (mode === "polygon" && polygon.length >= 3) return polygonCentroid(polygon);
    if (mode === "line" && line.length >= 2) return line[Math.floor(line.length / 2)];
    return null;
  }, [mode, point, polygon, line]);

  // Pafta + İlçe + Mahalle — hepsi lokal lookup, offline çalışır.
  // Pafta: nokta için centroid, poligon/çizgi için tüm köşelerin + centroid'in paftaları
  // unique set olarak toplanır. Böylece poligon birden fazla paftaya yayılsa da
  // tüm etkilenen paftalar kaydedilir.
  const paftalar = useMemo<string[]>(() => {
    if (!paftaData) return [];
    const set = new Set<string>();
    const add = (lat: number, lng: number) => {
      const p = findPaftaAt(lat, lng, paftaData);
      if (p) set.add(p);
    };
    if (mode === "point" && point) {
      add(point.lat, point.lng);
    } else if (mode === "polygon" && polygon.length >= 3) {
      for (const c of polygon) add(c.lat, c.lng);
      const centroid = polygonCentroid(polygon);
      if (centroid) add(centroid.lat, centroid.lng);
    } else if (mode === "line" && line.length >= 2) {
      for (const c of line) add(c.lat, c.lng);
    }
    return [...set].sort();
  }, [mode, point, polygon, line, paftaData]);
  const pafta = paftalar[0];
  const ilce = useMemo(
    () => (activeLatLng ? findIlceAt(activeLatLng.lat, activeLatLng.lng, ilceData) ?? undefined : undefined),
    [activeLatLng, ilceData],
  );
  const mahalle = useMemo(
    () => (activeLatLng ? findMahalleAt(activeLatLng.lat, activeLatLng.lng, mahalleData) ?? undefined : undefined),
    [activeLatLng, mahalleData],
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

  // Sokak adı — Nominatim'den tek centroid sorgusu (ilçe/mahalle zaten lokal).
  // Ağ/offline hatasında sessiz null, ilçe/mahalle yine çalışır.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!open || !activeLatLng) {
      setStreetName(null);
      setLoadingStreet(false);
      return;
    }
    let cancelled = false;
    setLoadingStreet(true);
    const t = setTimeout(async () => {
      const res = await fetchStreetName(activeLatLng.lat, activeLatLng.lng);
      if (!cancelled) {
        setStreetName(res);
        setLoadingStreet(false);
      }
    }, 500);
    return () => { cancelled = true; clearTimeout(t); setLoadingStreet(false); };
  }, [open, activeLatLng]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
    const geocode: MultiGeocodeResult | undefined =
      ilce || mahalle || streetName
        ? { ilce, mahalle, sokak: streetName ?? undefined }
        : undefined;
    const result: LocationPickerResult = {
      pafta,
      paftalar: paftalar.length > 0 ? paftalar : undefined,
      geocode,
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
        <Button type="button" size="sm" variant={mode === "point" ? "primary" : "outline"} onClick={() => changeMode("point")}>
          📍 Nokta
        </Button>
        <Button type="button" size="sm" variant={mode === "polygon" ? "primary" : "outline"} onClick={() => changeMode("polygon")}>
          ▱ Alan
        </Button>
        <Button type="button" size="sm" variant={mode === "line" ? "primary" : "outline"} onClick={() => changeMode("line")}>
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

      {importError && <p className="text-xs text-[var(--feedback-error)] mb-2">{importError}</p>}

      {/* Harita */}
      <div className="rounded-lg overflow-hidden border border-[var(--border)] mb-2">
        <MapCanvas
          mode={mode}
          point={point}
          polygon={polygon}
          line={line}
          shapeClosed={shapeClosed}
          editMode={editMode}
          onMapClick={handleMapClick}
          onVertexClick={handleVertexClick}
        >
          {showPaftalar && <PaftaLayer />}
          {showIlceler && <IlceLayer />}
          {showMahalleler && <MahalleLayer />}
        </MapCanvas>
      </div>

      {/* Katman toggle'ları (harita sekmesindeki ile aynı katmanlar) */}
      <div className="flex gap-1 mb-3 flex-wrap">
        {([
          ["Paftalar", showPaftalar, setShowPaftalar],
          ["İlçeler", showIlceler, setShowIlceler],
          ["Mahalleler", showMahalleler, setShowMahalleler],
        ] as const).map(([label, active, setter]) => (
          <button
            key={label}
            type="button"
            onClick={() => setter(!active)}
            className={`text-[11px] font-medium px-2.5 py-1.5 rounded-md border transition-colors ${
              active
                ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            {label} {active ? "✓" : ""}
          </button>
        ))}
      </div>

      {/* Şekil kontrolleri (polygon + line için) */}
      {(mode === "polygon" || mode === "line") && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          <Button type="button" size="sm" variant="outline" onClick={undoLastVertex} disabled={(mode === "polygon" ? polygon.length : line.length) === 0}>
            <IconUndo size={14} className="mr-1" /> Geri Al
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={clearShape} disabled={(mode === "polygon" ? polygon.length : line.length) === 0}>
            <IconTrash size={14} className="mr-1" /> Temizle
          </Button>
          {!shapeClosed && (
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={closeShape}
              disabled={mode === "polygon" ? polygon.length < 3 : line.length < 2}
            >
              {mode === "polygon" ? "Poligonu Kapat" : "Çizgiyi Bitir"}
            </Button>
          )}
          {shapeClosed && (
            <Button type="button" size="sm" variant={editMode ? "primary" : "outline"} onClick={toggleEdit}>
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
            {ilce && <p><span className="text-[var(--muted-foreground)]">İlçe:</span> {ilce}</p>}
            {mahalle && <p><span className="text-[var(--muted-foreground)]">Mahalle:</span> {mahalle}</p>}
            {streetName && <p><span className="text-[var(--muted-foreground)]">Sokak:</span> {streetName}</p>}
            {loadingStreet && !streetName && (
              <p className="text-[var(--muted-foreground)] flex items-center gap-1.5">
                <IconLoader size={12} className="animate-spin" /> Sokak aranıyor…
              </p>
            )}
            {paftalar.length > 0 && (
              <p>
                <span className="text-[var(--muted-foreground)]">Pafta{paftalar.length > 1 ? `lar (${paftalar.length})` : ""}:</span>{" "}
                <span className="font-mono">{paftalar.join(", ")}</span>
              </p>
            )}
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
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>İptal</Button>
        <Button type="button" size="sm" onClick={handleSave} disabled={!canSave}>Kaydet</Button>
      </div>
    </Modal>
  );
}
