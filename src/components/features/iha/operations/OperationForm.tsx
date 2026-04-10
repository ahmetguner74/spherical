"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { usePaftaData, getAllPaftaNames } from "../map/usePaftaData";
import type {
  Operation, OperationStatus, OperationPriority, OperationMainCategory, OperationSubType,
  OperationLocation, Equipment, TeamMember,
} from "@/types/iha";
import { OPERATION_STATUS_LABELS, OPERATION_PRIORITY_LABELS, legacyTypeToNew } from "@/types/iha";
import { inputClass } from "../shared/styles";
import { IHA_CONFIG } from "@/config/iha";
import { BURSA_ILCELER } from "@/config/iha";
import { MapPicker } from "../map";
import { TypeSelector } from "./TypeSelector";

interface OperationFormProps {
  operation?: Operation;
  equipment: Equipment[];
  team: TeamMember[];
  onSave: (data: Omit<Operation, "id" | "createdAt" | "updatedAt" | "deliverables" | "flightLogIds" | "completionPercent">) => void;
  onCancel: () => void;
}

const STATUSES: OperationStatus[] = ["talep", "planlama", "saha", "isleme", "kontrol", "teslim", "iptal"];
const PRIORITIES: OperationPriority[] = ["dusuk", "normal", "yuksek", "acil"];

export function OperationForm({ operation, equipment, team, onSave, onCancel }: OperationFormProps) {
  const resolved = operation ? legacyTypeToNew(operation.type) : { mainCategory: "iha" as const, subTypes: [] };
  const [title, setTitle] = useState(operation?.title ?? "");
  const [mainCategory, setMainCategory] = useState<OperationMainCategory>(resolved.mainCategory);
  const [subTypes, setSubTypes] = useState<OperationSubType[]>(operation?.subTypes ?? resolved.subTypes);
  const [requester, setRequester] = useState(operation?.requester ?? "");
  const [status, setStatus] = useState<OperationStatus>(operation?.status ?? "talep");
  const [priority, setPriority] = useState<OperationPriority>(operation?.priority ?? "normal");
  const [startDate, setStartDate] = useState(operation?.startDate ?? "");
  const [endDate, setEndDate] = useState(operation?.endDate ?? "");

  // Konum
  const [il, setIl] = useState(operation?.location.il ?? IHA_CONFIG.defaultLocation.il);
  const [ilce, setIlce] = useState(operation?.location.ilce ?? "");
  const [mahalle, setMahalle] = useState(operation?.location.mahalle ?? "");
  const [lat, setLat] = useState(operation?.location.lat);
  const [lng, setLng] = useState(operation?.location.lng);
  const [showMap, setShowMap] = useState(false);

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
      requester: requester.trim(), status, priority,
      location: { il, ilce, mahalle: mahalle || undefined, pafta: paftalar[0] || undefined, lat, lng },
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

  const label = "block text-xs text-[var(--muted-foreground)] mb-1";

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={label}>Durum</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as OperationStatus)} className={inputClass}>
            {STATUSES.map((s) => <option key={s} value={s}>{OPERATION_STATUS_LABELS[s]}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Öncelik</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as OperationPriority)} className={inputClass}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{OPERATION_PRIORITY_LABELS[p]}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Başlangıç</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
        </div>
      </div>

      {/* ── 2. Konum ── */}
      <div className="border-t border-[var(--border)] pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Konum</span>
          <button type="button" onClick={() => setShowMap(!showMap)} className="text-xs text-[var(--accent)]">
            {showMap ? "Gizle" : "📍 Haritada Seç"}
          </button>
        </div>
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
        {/* Paftalar (çoklu) */}
        <div className="mt-3">
          <PaftalarPicker paftalar={paftalar} setPaftalar={setPaftalar} />
        </div>
        {showMap && (
          <div className="mt-2">
            <MapPicker lat={lat} lng={lng} onSelect={(la, ln) => { setLat(la); setLng(ln); }} className="h-40 w-full rounded-lg" />
            {lat && lng && <p className="text-xs text-[var(--muted-foreground)] mt-1 font-mono">{lat.toFixed(5)}, {lng.toFixed(5)}</p>}
          </div>
        )}
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

      {/* Butonlar */}
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={errors.length > 0}>Kaydet</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>İptal</Button>
      </div>
    </form>
  );
}

/* ─── Paftalar Seçici (çoklu) ─── */
function PaftalarPicker({ paftalar, setPaftalar }: { paftalar: string[]; setPaftalar: (p: string[]) => void }) {
  const paftaData = usePaftaData();
  const [input, setInput] = useState("");
  const allNames = useMemo(() => getAllPaftaNames(paftaData), [paftaData]);

  const addPafta = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || paftalar.includes(trimmed)) return;
    setPaftalar([...paftalar, trimmed]);
    setInput("");
  };
  const removePafta = (name: string) => setPaftalar(paftalar.filter((p) => p !== name));

  return (
    <div>
      <label className="block text-xs text-[var(--muted-foreground)] mb-1">Paftalar</label>
      {paftalar.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {paftalar.map((p) => (
            <span key={p} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-mono font-semibold">
              {p}
              <button type="button" onClick={() => removePafta(p)} className="hover:text-red-500 font-sans">×</button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPafta(input); } }}
          list="pafta-list-opform"
          placeholder="Pafta adı (örn. H21C02C)"
          className={`${inputClass} font-mono py-2 min-h-[44px]`}
        />
        <button
          type="button"
          onClick={() => addPafta(input)}
          disabled={!input.trim()}
          className="px-3 py-2 rounded-md border border-[var(--border)] text-xs text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)] disabled:opacity-40 min-h-[44px]"
        >
          + Ekle
        </button>
      </div>
      <datalist id="pafta-list-opform">
        {allNames.slice(0, 100).map((n) => <option key={n} value={n} />)}
      </datalist>
    </div>
  );
}
