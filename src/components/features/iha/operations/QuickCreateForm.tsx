"use client";

import { useState, useCallback } from "react";
import type {
  Operation, OperationMainCategory, OperationSubType, TeamMember,
  LocationCoordinate,
} from "@/types/iha";
import { SUB_TYPE_LABELS } from "@/types/iha";
import { inputClass } from "../shared/styles";
import { BURSA_ILCELER } from "@/config/iha";
import { TypeSelector } from "./TypeSelector";
import { Button } from "@/components/ui/Button";
import { LocationPickerModal, type LocationPickerResult } from "./LocationPicker/LocationPickerModal";

interface QuickCreateFormProps {
  team: TeamMember[];
  onSave: (data: Omit<Operation, "id" | "createdAt" | "updatedAt" | "deliverables" | "flightLogIds" | "completionPercent">) => void;
  onCancel: () => void;
  defaultDate?: string;
  defaultLat?: number;
  defaultLng?: number;
  defaultPaftalar?: string[];
}

export function QuickCreateForm({ team, onSave, onCancel, defaultDate, defaultLat, defaultLng, defaultPaftalar }: QuickCreateFormProps) {
  const [ilce, setIlce] = useState("");
  const [mahalle, setMahalle] = useState<string | undefined>();
  const [sokak, setSokak] = useState<string | undefined>();
  const [displayAddress, setDisplayAddress] = useState<string | undefined>();
  const [lat, setLat] = useState<number | undefined>(defaultLat);
  const [lng, setLng] = useState<number | undefined>(defaultLng);
  const [polygonCoordinates, setPolygonCoordinates] = useState<LocationCoordinate[] | undefined>();
  const [lineCoordinates, setLineCoordinates] = useState<LocationCoordinate[] | undefined>();
  const [lineLength, setLineLength] = useState<number | undefined>();
  const [alan, setAlan] = useState<number | undefined>();
  const [alanBirimi, setAlanBirimi] = useState<"m2" | "km2" | "hektar" | undefined>();
  const [paftalar, setPaftalar] = useState<string[]>(defaultPaftalar ?? []);

  const [mainCategory, setMainCategory] = useState<OperationMainCategory>("iha");
  const [subTypes, setSubTypes] = useState<OperationSubType[]>([]);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [assignedTeam, setAssignedTeam] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const handleTypeChange = useCallback((cat: OperationMainCategory, subs: OperationSubType[]) => {
    setMainCategory(cat);
    setSubTypes(subs);
  }, []);

  const toggleMember = (id: string) => {
    setAssignedTeam((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleLocationSave = (result: LocationPickerResult) => {
    if (result.point) { setLat(result.point.lat); setLng(result.point.lng); }
    setPolygonCoordinates(result.polygon);
    setLineCoordinates(result.line);
    setLineLength(result.lineLengthM);
    if (!result.polygon) { setAlan(undefined); setAlanBirimi(undefined); }
    if (result.pafta) setPaftalar([result.pafta]);
    if (result.geocode?.ilce) setIlce(result.geocode.ilce);
    if (result.geocode?.mahalle) setMahalle(result.geocode.mahalle);
    if (result.geocode?.sokak) setSokak(result.geocode.sokak);
    if (result.geocode?.displayAddress) setDisplayAddress(result.geocode.displayAddress);
    if (result.areaValue && result.areaUnit) {
      setAlan(result.areaValue);
      setAlanBirimi(result.areaUnit);
    }
    setError("");
  };

  const handleSubmit = () => {
    if (!ilce) { setError("İlçe seçin veya haritadan konum belirleyin"); return; }
    if (subTypes.length === 0) { setError("En az bir alt kategori seçin"); return; }

    const startDate = defaultDate ?? new Date().toISOString().slice(0, 10);
    const subLabels = subTypes.map((s) => SUB_TYPE_LABELS[s]).join(", ");
    const catLabel = mainCategory === "iha" ? "İHA" : "LİDAR";
    const autoTitle = title.trim() || `${ilce} ${catLabel} - ${subLabels}`;

    onSave({
      title: autoTitle,
      description: "",
      type: mainCategory,
      subTypes,
      requester: "",
      status: "talep",
      location: {
        il: "Bursa",
        ilce,
        mahalle,
        sokak,
        pafta: paftalar[0],
        lat,
        lng,
        polygonCoordinates,
        lineCoordinates,
        lineLength,
        displayAddress,
        alan,
        alanBirimi,
      },
      paftalar,
      assignedTeam,
      assignedEquipment: [],
      startDate,
      startTime: startTime || "08:00",
      endTime: endTime || "09:00",
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
      <LocationField
        ilce={ilce}
        setIlce={setIlce}
        mahalle={mahalle}
        sokak={sokak}
        pafta={paftalar[0]}
        lat={lat}
        lng={lng}
        polygonCount={polygonCoordinates?.length ?? 0}
        lineCount={lineCoordinates?.length ?? 0}
        lineLength={lineLength}
        onOpenPicker={() => setLocationModalOpen(true)}
        error={error}
        setError={setError}
      />
      <TypeSelector onChange={handleTypeChange} />
      {error && !error.includes("İlçe") && <p className="text-xs text-red-500">{error}</p>}
      <NameTimeField title={title} setTitle={setTitle} startTime={startTime} setStartTime={setStartTime} endTime={endTime} setEndTime={setEndTime} ilce={ilce} mainCategory={mainCategory} subTypes={subTypes} />
      <TeamField team={team} assignedTeam={assignedTeam} toggleMember={toggleMember} />
      <FormActions onCancel={onCancel} />

      <LocationPickerModal
        open={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSave={handleLocationSave}
        initialPoint={lat && lng ? { lat, lng } : undefined}
        initialPolygon={polygonCoordinates}
        initialLine={lineCoordinates}
      />
    </form>
  );
}

function LocationField({
  ilce, setIlce, mahalle, sokak, pafta, lat, lng, polygonCount, lineCount, lineLength, onOpenPicker, error, setError,
}: {
  ilce: string; setIlce: (v: string) => void;
  mahalle?: string; sokak?: string; pafta?: string;
  lat?: number; lng?: number; polygonCount: number; lineCount: number; lineLength?: number;
  onOpenPicker: () => void;
  error: string; setError: (v: string) => void;
}) {
  const hasPicked = lat !== undefined && lng !== undefined;
  return (
    <div>
      <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Nerede? *</label>

      <Button
        type="button"
        variant="outline"
        onClick={onOpenPicker}
        className="w-full justify-start min-h-[48px] mb-2"
      >
        📍 {hasPicked ? "Konumu Değiştir" : "Haritadan Konum Seç"}
      </Button>

      {hasPicked && (
        <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-2 mb-2 text-xs space-y-0.5">
          {ilce && <p><span className="text-[var(--muted-foreground)]">İlçe:</span> {ilce}</p>}
          {mahalle && <p><span className="text-[var(--muted-foreground)]">Mahalle:</span> {mahalle}</p>}
          {sokak && <p><span className="text-[var(--muted-foreground)]">Sokak:</span> {sokak}</p>}
          {pafta && <p><span className="text-[var(--muted-foreground)]">Pafta:</span> <span className="font-mono">{pafta}</span></p>}
          {polygonCount > 0 && <p className="text-[var(--accent)]">▱ Poligon alanı ({polygonCount} köşe)</p>}
          {lineCount > 0 && <p className="text-[var(--accent)]">〰 Çizgi ({lineCount} köşe{lineLength ? ` · ${lineLength >= 1000 ? (lineLength / 1000).toFixed(2) + " km" : Math.round(lineLength) + " m"}` : ""})</p>}
        </div>
      )}

      <select
        value={ilce}
        onChange={(e) => { setIlce(e.target.value); setError(""); }}
        className={`${inputClass} text-base py-3 ${error.includes("İlçe") ? "border-red-500" : ""}`}
      >
        <option value="">İlçe seçin (veya haritadan)</option>
        {BURSA_ILCELER.map((i) => <option key={i} value={i}>{i}</option>)}
      </select>
      {error.includes("İlçe") && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function NameTimeField({ title, setTitle, startTime, setStartTime, endTime, setEndTime, ilce, mainCategory, subTypes }: {
  title: string; setTitle: (v: string) => void;
  startTime: string; setStartTime: (v: string) => void;
  endTime: string; setEndTime: (v: string) => void;
  ilce: string; mainCategory: OperationMainCategory; subTypes: OperationSubType[];
}) {
  const catLabel = mainCategory === "iha" ? "İHA" : "LİDAR";
  const subLabels = subTypes.map((s) => SUB_TYPE_LABELS[s]).join(", ");
  const placeholder = ilce ? `${ilce} ${catLabel}${subLabels ? ` - ${subLabels}` : ""}` : "Otomatik oluşturulur";

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Operasyon Adı</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={placeholder} className={`${inputClass} py-2.5`} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Başlangıç</label>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={`${inputClass} py-2.5`} />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Bitiş</label>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={`${inputClass} py-2.5`} />
        </div>
      </div>
    </div>
  );
}

function TeamField({ team, assignedTeam, toggleMember }: { team: TeamMember[]; assignedTeam: string[]; toggleMember: (id: string) => void }) {
  return (
    <div>
      <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Kim gidecek?</label>
      <div className="flex flex-wrap gap-2">
        {team.map((m) => {
          const selected = assignedTeam.includes(m.id);
          return (
            <Button
              key={m.id}
              type="button"
              variant={selected ? "primary" : "outline"}
              size="sm"
              onClick={() => toggleMember(m.id)}
              className="min-h-[44px]"
            >
              {m.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function FormActions({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="flex gap-2 pt-1">
      <Button type="submit" variant="primary" className="flex-1 min-h-[48px]">
        Oluştur
      </Button>
      <Button type="button" variant="ghost" onClick={onCancel} className="min-h-[48px]">
        İptal
      </Button>
    </div>
  );
}
