"use client";

import { useState, useCallback } from "react";
import type {
  Operation, OperationStatus, OperationMainCategory, OperationSubType,
  LocationCoordinate, Equipment, TeamMember,
} from "@/types/iha";
import { OPERATION_STATUS_LABELS, legacyTypeToNew } from "@/types/iha";
import { inputClass } from "../shared/styles";
import { IHA_CONFIG } from "@/config/iha";
import { TypeSelector } from "./TypeSelector";
import { OperationLocationSection } from "./OperationLocationSection";
import { useIhaStore } from "../shared/ihaStore";

interface OperationFormProps {
  operation?: Operation;
  equipment: Equipment[];
  team: TeamMember[];
  onSave: (data: Omit<Operation, "id" | "createdAt" | "updatedAt" | "deliverables" | "flightLogIds" | "completionPercent">) => void;
  /** Artık sticky alt çubuk OperationModal'da — bu prop deprecated */
  onCancel?: () => void;
  /** true → tüm form salt-okunur, input'lar disabled, klavye açılmaz */
  readOnly?: boolean;
}

const STATUSES: OperationStatus[] = ["talep", "planlama", "saha", "isleme", "kontrol", "teslim", "iptal"];

export function OperationForm({ operation, equipment, team, onSave, readOnly = false }: OperationFormProps) {
  const flightPermissions = useIhaStore((s) => s.flightPermissions);
  const resolved = operation ? legacyTypeToNew(operation.type) : { mainCategory: "iha" as const, subTypes: [] };
  const [title, setTitle] = useState(operation?.title ?? "");
  const [mainCategory, setMainCategory] = useState<OperationMainCategory>(resolved.mainCategory);
  const [subTypes, setSubTypes] = useState<OperationSubType[]>(operation?.subTypes ?? resolved.subTypes);
  const [requester, setRequester] = useState(operation?.requester ?? "");
  const [status, setStatus] = useState<OperationStatus>(operation?.status ?? "talep");
  const [startDate, setStartDate] = useState(operation?.startDate ?? "");
  const [endDate, setEndDate] = useState(operation?.endDate ?? "");
  const [startTime, setStartTime] = useState(operation?.startTime ?? "");
  const [endTime, setEndTime] = useState(operation?.endTime ?? "");

  // Konum
  const [il, setIl] = useState(operation?.location.il ?? IHA_CONFIG.defaultLocation.il);
  const [ilce, setIlce] = useState(operation?.location.ilce ?? "");
  const [mahalle, setMahalle] = useState(operation?.location.mahalle ?? "");
  const [sokak, setSokak] = useState(operation?.location.sokak ?? "");
  const [displayAddress, setDisplayAddress] = useState(operation?.location.displayAddress ?? "");
  const [allIlces, setAllIlces] = useState<string[] | undefined>();
  const [lat, setLat] = useState<number | undefined>(operation?.location.lat);
  const [lng, setLng] = useState<number | undefined>(operation?.location.lng);
  const [polygonCoordinates, setPolygonCoordinates] = useState<LocationCoordinate[] | undefined>(operation?.location.polygonCoordinates);
  const [lineCoordinates, setLineCoordinates] = useState<LocationCoordinate[] | undefined>(operation?.location.lineCoordinates);
  const [lineLength, setLineLength] = useState<number | undefined>(operation?.location.lineLength);
  const [alan, setAlan] = useState<number | undefined>(operation?.location.alan);
  const [alanBirimi, setAlanBirimi] = useState<"m2" | "km2" | "hektar" | undefined>(operation?.location.alanBirimi);

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
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      dataStoragePath: dataStoragePath || undefined,
      dataSize: dataSize || undefined,
      outputDescription: outputDescription || undefined,
      notes: notes || undefined,
    });
  };

  const label = "block text-xs text-[var(--muted-foreground)] mb-1";

  const locationState = {
    il, ilce, mahalle, sokak, displayAddress, lat, lng,
    polygonCoordinates, lineCoordinates, lineLength, alan, alanBirimi,
    allIlces, paftalar,
  };
  const locationSetters = {
    setIl, setIlce, setMahalle, setSokak, setDisplayAddress,
    setLat, setLng, setPolygonCoordinates, setLineCoordinates, setLineLength,
    setAlan, setAlanBirimi, setAllIlces, setPaftalar,
  };

  return (
    <form id="operation-edit-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      {/* fieldset disabled → tüm input/select/button/textarea'ları tek hamlede salt-okunur yapar */}
      <fieldset disabled={readOnly} className="space-y-4 min-w-0 p-0 m-0 border-0 disabled:opacity-[0.88]">
      {/* ── 1. Temel ── */}
      <div>
        <label className={label}>Başlık <span className="text-[var(--feedback-error)]">*</span></label>
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

      <div>
        <label className={label}>Durum</label>
        <select value={status} onChange={(e) => setStatus(e.target.value as OperationStatus)} className={inputClass}>
          {STATUSES.map((s) => <option key={s} value={s}>{OPERATION_STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={label}>Başlangıç</label>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={label}>Bitiş</label>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      {/* ── 2. Konum (ayrı component) ── */}
      <OperationLocationSection
        state={locationState}
        setters={locationSetters}
        operation={operation}
        mainCategory={mainCategory}
        permissions={flightPermissions}
        labelClass={label}
      />

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
        <div className="text-xs text-[var(--feedback-error)] space-y-0.5">
          {errors.map((e) => <p key={e}>{e}</p>)}
        </div>
      )}

      {/* Kaydet/İptal butonları OperationModal sticky alt çubukta — burada yok */}
      </fieldset>
    </form>
  );
}

