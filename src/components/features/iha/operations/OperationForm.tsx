"use client";

import { useState, useCallback } from "react";
import type {
  Operation, OperationStatus, OperationMainCategory, OperationSubType,
  LocationCoordinate, Equipment, TeamMember,
} from "@/types/iha";
import { OPERATION_STATUS_LABELS, legacyTypeToNew } from "@/types/iha";
import { inputClass } from "../shared/styles";
import { Button, FormInput, FormSelect, FormTextarea } from "@/components/ui";
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
      {/* ── 1. Ne yapılacak? ── */}
      <TypeSelector
        defaultCategory={mainCategory}
        defaultSubTypes={subTypes}
        onChange={useCallback((cat: OperationMainCategory, subs: OperationSubType[]) => { setMainCategory(cat); setSubTypes(subs); }, [])}
      />

      {/* ── 2. Nerede? ── */}
      <OperationLocationSection
        state={locationState}
        setters={locationSetters}
        operation={operation}
        mainCategory={mainCategory}
        permissions={flightPermissions}
        labelClass={label}
      />

      {/* ── 3. Operasyon Bilgileri ── */}
      <FormInput label="Başlık" required type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      <FormInput label="Talep Eden" type="text" value={requester} onChange={(e) => setRequester(e.target.value)} />
      <FormSelect label="Durum" value={status} onChange={(e) => setStatus(e.target.value as OperationStatus)}>
        {STATUSES.map((s) => <option key={s} value={s}>{OPERATION_STATUS_LABELS[s]}</option>)}
      </FormSelect>

      {/* ── 4. Ne zaman? ── */}
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

      {/* ── 5. Ekip & Ekipman ── */}
      <div className="border-t border-[var(--border)] pt-3">
        <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Ekip & Ekipman</span>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {team.map((m) => (
            <Button key={m.id} type="button" size="sm" className="min-h-[44px]"
              variant={assignedTeam.includes(m.id) ? "primary" : "outline"}
              onClick={() => toggleItem(assignedTeam, m.id, setAssignedTeam)}>
              {m.name}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {equipment.map((eq) => (
            <Button key={eq.id} type="button" size="sm" className="min-h-[44px]"
              variant={assignedEquipment.includes(eq.id) ? "primary" : "outline"}
              onClick={() => toggleItem(assignedEquipment, eq.id, setAssignedEquipment)}>
              {eq.name}
            </Button>
          ))}
        </div>
      </div>

      {/* ── 6. Veri & Notlar ── */}
      <div className="border-t border-[var(--border)] pt-3 space-y-3">
        <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Veri & Notlar</span>
        <FormTextarea label="Açıklama" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        <div className="grid grid-cols-2 gap-3">
          <FormInput label="Veri Yolu" type="text" value={dataStoragePath} onChange={(e) => setDataStoragePath(e.target.value)} placeholder="cografidrone/2026/..." />
          <FormInput label="Veri Boyutu (GB)" type="number" value={dataSize || ""} onChange={(e) => setDataSize(Number(e.target.value))} min={0} step={0.1} />
        </div>
        <FormInput label="Çıktı Açıklaması" type="text" value={outputDescription} onChange={(e) => setOutputDescription(e.target.value)} placeholder="Ortofoto + DEM + nokta bulutu" />
        <FormTextarea label="Notlar" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
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

