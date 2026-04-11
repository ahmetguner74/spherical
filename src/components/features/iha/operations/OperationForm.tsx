"use client";

import { useState, useCallback } from "react";
import type {
  Operation, OperationStatus, OperationMainCategory, OperationSubType,
  OperationLocation, LocationCoordinate, Equipment, TeamMember,
} from "@/types/iha";
import { OPERATION_STATUS_LABELS, legacyTypeToNew } from "@/types/iha";
import { inputClass } from "../shared/styles";
import { IHA_CONFIG } from "@/config/iha";
import { BURSA_ILCELER } from "@/config/iha";
import { TypeSelector } from "./TypeSelector";
import { LocationPickerModal, type LocationPickerResult } from "./LocationPicker/LocationPickerModal";
import { Button } from "@/components/ui/Button";
import { PermissionBadge } from "../shared/PermissionBadge";
import { useIhaStore } from "../shared/ihaStore";

interface OperationFormProps {
  operation?: Operation;
  equipment: Equipment[];
  team: TeamMember[];
  onSave: (data: Omit<Operation, "id" | "createdAt" | "updatedAt" | "deliverables" | "flightLogIds" | "completionPercent">) => void;
  /** Artık sticky alt çubuk OperationModal'da — bu prop deprecated */
  onCancel?: () => void;
}

const STATUSES: OperationStatus[] = ["talep", "planlama", "saha", "isleme", "kontrol", "teslim", "iptal"];

export function OperationForm({ operation, equipment, team, onSave }: OperationFormProps) {
  const flightPermissions = useIhaStore((s) => s.flightPermissions);
  const resolved = operation ? legacyTypeToNew(operation.type) : { mainCategory: "iha" as const, subTypes: [] };
  const [title, setTitle] = useState(operation?.title ?? "");
  const [mainCategory, setMainCategory] = useState<OperationMainCategory>(resolved.mainCategory);
  const [subTypes, setSubTypes] = useState<OperationSubType[]>(operation?.subTypes ?? resolved.subTypes);
  const [requester, setRequester] = useState(operation?.requester ?? "");
  const [status, setStatus] = useState<OperationStatus>(operation?.status ?? "talep");
  const [startDate, setStartDate] = useState(operation?.startDate ?? "");
  const [endDate, setEndDate] = useState(operation?.endDate ?? "");

  // Konum
  const [il, setIl] = useState(operation?.location.il ?? IHA_CONFIG.defaultLocation.il);
  const [ilce, setIlce] = useState(operation?.location.ilce ?? "");
  const [mahalle, setMahalle] = useState(operation?.location.mahalle ?? "");
  const [sokak, setSokak] = useState(operation?.location.sokak ?? "");
  const [displayAddress, setDisplayAddress] = useState(operation?.location.displayAddress ?? "");
  const [allIlces, setAllIlces] = useState<string[] | undefined>();
  const [lat, setLat] = useState(operation?.location.lat);
  const [lng, setLng] = useState(operation?.location.lng);
  const [polygonCoordinates, setPolygonCoordinates] = useState<LocationCoordinate[] | undefined>(operation?.location.polygonCoordinates);
  const [lineCoordinates, setLineCoordinates] = useState<LocationCoordinate[] | undefined>(operation?.location.lineCoordinates);
  const [lineLength, setLineLength] = useState<number | undefined>(operation?.location.lineLength);
  const [alan, setAlan] = useState<number | undefined>(operation?.location.alan);
  const [alanBirimi, setAlanBirimi] = useState<"m2" | "km2" | "hektar" | undefined>(operation?.location.alanBirimi);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationDetailsOpen, setLocationDetailsOpen] = useState(false);

  // Ekip & Ekipman
  const [assignedTeam, setAssignedTeam] = useState<string[]>(operation?.assignedTeam ?? []);
  const [assignedEquipment, setAssignedEquipment] = useState<string[]>(operation?.assignedEquipment ?? []);

  // Paftalar (opsiyonel — birden fazla pafta bağlanabilir)
  const initialPaftalar = operation?.paftalar ?? (operation?.location.pafta ? [operation.location.pafta] : []);
  const [paftalar, setPaftalar] = useState<string[]>(initialPaftalar);

  // Veri & Notlar
  const [description, setDescription] = useState(operation?.description ?? "");
  const [dataStoragePath, setDataStoragePath] = useState(operation?.dataStoragePath ?? "");
  const [dataSize, setDataSize] = useState(operation?.dataSize ?? 0);
  const [outputDescription, setOutputDescription] = useState(operation?.outputDescription ?? "");
  const [notes, setNotes] = useState(operation?.notes ?? "");

  const toggleItem = (list: string[], id: string, setter: (v: string[]) => void) => {
    setter(list.includes(id) ? list.filter((i) => i !== id) : [...list, id]);
  };

  const errors: string[] = [];
  if (!title.trim()) errors.push("Başlık zorunlu");
  if (!ilce.trim()) errors.push("İlçe zorunlu");

  const handleSubmit = () => {
    if (errors.length > 0) return;
    onSave({
      title: title.trim(), description: description.trim(), type: mainCategory, subTypes,
      requester: requester.trim(), status,
      location: {
        il,
        ilce,
        mahalle: mahalle || undefined,
        sokak: sokak || undefined,
        pafta: paftalar[0] || undefined,
        lat,
        lng,
        polygonCoordinates,
        lineCoordinates,
        lineLength,
        displayAddress: displayAddress || undefined,
        alan,
        alanBirimi,
      },
      paftalar,
      assignedTeam, assignedEquipment,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      dataStoragePath: dataStoragePath || undefined,
      dataSize: dataSize || undefined,
      outputDescription: outputDescription || undefined,
      notes: notes || undefined,
    });
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
    setAllIlces(result.geocode?.allIlces);
    if (result.areaValue && result.areaUnit) {
      setAlan(result.areaValue);
      setAlanBirimi(result.areaUnit);
    }
  };

  const label = "block text-xs text-[var(--muted-foreground)] mb-1";

  return (
    <form id="operation-edit-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
      {/* ── 1. Temel ── */}
      <div>
        <label className={label}>Başlık <span className="text-red-400">*</span></label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </div>

      <TypeSelector
        defaultCategory={mainCategory}
        defaultSubTypes={subTypes}
        onChange={useCallback((cat: OperationMainCategory, subs: OperationSubType[]) => { setMainCategory(cat); setSubTypes(subs); }, [])}
      />
      <div>
        <label className={label}>Talep Eden</label>
        <input type="text" value={requester} onChange={(e) => setRequester(e.target.value)} className={inputClass} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={label}>Durum</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as OperationStatus)} className={inputClass}>
            {STATUSES.map((s) => <option key={s} value={s}>{OPERATION_STATUS_LABELS[s]}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Başlangıç</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
        </div>
      </div>

      {/* ── 2. Konum ── */}
      <div className="border-t border-[var(--border)] pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Konum</span>
          <button
            type="button"
            onClick={() => setLocationDetailsOpen(!locationDetailsOpen)}
            className="text-xs text-[var(--muted-foreground)] hover:text-[var(--accent)] underline"
          >
            {locationDetailsOpen ? "Detayı Gizle" : "Detay"}
          </button>
        </div>

        <Button
          type="button"
          variant={lat && lng ? "outline" : "primary"}
          onClick={() => setLocationModalOpen(true)}
          className="w-full justify-start min-h-[44px]"
        >
          📍 {lat && lng ? "Konumu Değiştir" : "Haritadan Konum Seç"}
        </Button>

        {/* Özet kart: her zaman görünür */}
        {(lat && lng) || ilce ? (
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
            {polygonCoordinates && polygonCoordinates.length > 0 && (
              <p className="text-[var(--accent)]">▱ Poligon ({polygonCoordinates.length} köşe){alan && alanBirimi ? ` · ${alan.toLocaleString("tr-TR")} ${alanBirimi === "m2" ? "m²" : alanBirimi === "km2" ? "km²" : "hektar"}` : ""}</p>
            )}
            {lineCoordinates && lineCoordinates.length > 0 && (
              <p className="text-[var(--accent)]">〰 Çizgi ({lineCoordinates.length} köşe{lineLength ? ` · ${lineLength >= 1000 ? (lineLength / 1000).toFixed(2) + " km" : Math.round(lineLength) + " m"}` : ""})</p>
            )}
            {displayAddress && <p className="text-[var(--muted-foreground)] truncate">{displayAddress}</p>}
            {/* İzin rozeti (sadece İHA operasyonlar) */}
            {mainCategory === "iha" && operation && (
              <div className="pt-1">
                <PermissionBadge op={operation} permissions={flightPermissions} />
              </div>
            )}
          </div>
        ) : null}

        {/* Detay bölümü: manuel düzenleme için (collapse) */}
        {locationDetailsOpen && (
          <div className="rounded-md border border-dashed border-[var(--border)] p-3 space-y-3">
            <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">Manuel Düzenleme</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={label}>İl</label>
                <input type="text" value={il} onChange={(e) => setIl(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={label}>İlçe <span className="text-red-400">*</span></label>
                <select value={ilce} onChange={(e) => setIlce(e.target.value)} className={inputClass}>
                  <option value="">Seçin</option>
                  {BURSA_ILCELER.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Mahalle</label>
                <input type="text" value={mahalle} onChange={(e) => setMahalle(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={label}>Sokak/Cadde</label>
              <input type="text" value={sokak} onChange={(e) => setSokak(e.target.value)} className={inputClass} />
            </div>
          </div>
        )}

        {/* Konum yoksa ilçe dropdown'unu hemen altta göster (zorunlu alan) */}
        {!ilce && !locationDetailsOpen && (
          <div>
            <label className={label}>İlçe <span className="text-red-400">*</span></label>
            <select value={ilce} onChange={(e) => setIlce(e.target.value)} className={inputClass}>
              <option value="">Seçin (veya haritadan)</option>
              {BURSA_ILCELER.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
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

      {/* ── 3. Ekip & Ekipman ── */}
      <div className="border-t border-[var(--border)] pt-3">
        <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Ekip & Ekipman</span>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {team.map((m) => (
            <button key={m.id} type="button" onClick={() => toggleItem(assignedTeam, m.id, setAssignedTeam)}
              className={`text-xs px-3 py-2 rounded-md border transition-colors min-h-[44px] ${
                assignedTeam.includes(m.id)
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)]"
              }`}>
              {m.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {equipment.map((eq) => (
            <button key={eq.id} type="button" onClick={() => toggleItem(assignedEquipment, eq.id, setAssignedEquipment)}
              className={`text-xs px-3 py-2 rounded-md border transition-colors min-h-[44px] ${
                assignedEquipment.includes(eq.id)
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)]"
              }`}>
              {eq.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. Veri & Notlar ── */}
      <div className="border-t border-[var(--border)] pt-3 space-y-3">
        <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Veri & Notlar</span>
        <div>
          <label className={label}>Açıklama</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} h-14 resize-none`} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Veri Yolu</label>
            <input type="text" value={dataStoragePath} onChange={(e) => setDataStoragePath(e.target.value)} className={inputClass} placeholder="cografidrone/2026/..." />
          </div>
          <div>
            <label className={label}>Veri Boyutu (GB)</label>
            <input type="number" value={dataSize || ""} onChange={(e) => setDataSize(Number(e.target.value))} className={inputClass} min={0} step={0.1} />
          </div>
        </div>
        <div>
          <label className={label}>Çıktı Açıklaması</label>
          <input type="text" value={outputDescription} onChange={(e) => setOutputDescription(e.target.value)} className={inputClass} placeholder="Ortofoto + DEM + nokta bulutu" />
        </div>
        <div>
          <label className={label}>Notlar</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} h-14 resize-none`} />
        </div>
      </div>

      {/* Hatalar */}
      {errors.length > 0 && (
        <div className="text-xs text-red-500 space-y-0.5">
          {errors.map((e) => <p key={e}>{e}</p>)}
        </div>
      )}

      {/* Kaydet/İptal butonları OperationModal sticky alt çubukta — burada yok */}
    </form>
  );
}

