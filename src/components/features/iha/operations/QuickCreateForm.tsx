"use client";

import { useState, useCallback, useMemo } from "react";
import type { Operation, OperationMainCategory, OperationSubType, TeamMember } from "@/types/iha";
import { SUB_TYPE_LABELS } from "@/types/iha";
import { inputClass } from "../shared/styles";
import { BURSA_ILCELER } from "@/config/iha";
import { TypeSelector } from "./TypeSelector";
import { usePaftaData, getAllPaftaNames } from "../map/usePaftaData";
import { Button } from "@/components/ui/Button";

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
  const [mainCategory, setMainCategory] = useState<OperationMainCategory>("iha");
  const [subTypes, setSubTypes] = useState<OperationSubType[]>([]);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [assignedTeam, setAssignedTeam] = useState<string[]>([]);
  const [paftalar, setPaftalar] = useState<string[]>(defaultPaftalar ?? []);
  const [error, setError] = useState("");

  const handleTypeChange = useCallback((cat: OperationMainCategory, subs: OperationSubType[]) => {
    setMainCategory(cat);
    setSubTypes(subs);
  }, []);

  const toggleMember = (id: string) => {
    setAssignedTeam((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleSubmit = () => {
    if (!ilce) { setError("İlçe seçin"); return; }
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
      priority: "normal",
      location: { il: "Bursa", ilce, lat: defaultLat, lng: defaultLng, pafta: paftalar[0] },
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
      <LocationField ilce={ilce} setIlce={setIlce} error={error} setError={setError} />
      <TypeSelector onChange={handleTypeChange} />
      {error && error !== "İlçe seçin" && <p className="text-xs text-red-500">{error}</p>}
      <NameTimeField title={title} setTitle={setTitle} startTime={startTime} setStartTime={setStartTime} endTime={endTime} setEndTime={setEndTime} ilce={ilce} mainCategory={mainCategory} subTypes={subTypes} />
      <TeamField team={team} assignedTeam={assignedTeam} toggleMember={toggleMember} />
      <PaftalarField paftalar={paftalar} setPaftalar={setPaftalar} />
      {defaultLat && defaultLng && (
        <p className="text-xs text-[var(--muted-foreground)]">📍 {defaultLat.toFixed(5)}, {defaultLng.toFixed(5)}</p>
      )}
      <FormActions onCancel={onCancel} />
    </form>
  );
}

function LocationField({ ilce, setIlce, error, setError }: { ilce: string; setIlce: (v: string) => void; error: string; setError: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Nerede? *</label>
      <select
        value={ilce}
        onChange={(e) => { setIlce(e.target.value); setError(""); }}
        autoFocus
        className={`${inputClass} text-base py-3 ${error === "İlçe seçin" ? "border-red-500" : ""}`}
      >
        <option value="">İlçe seçin</option>
        {BURSA_ILCELER.map((i) => <option key={i} value={i}>{i}</option>)}
      </select>
      {error === "İlçe seçin" && <p className="text-xs text-red-500 mt-1">{error}</p>}
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

function PaftalarField({ paftalar, setPaftalar }: { paftalar: string[]; setPaftalar: (p: string[]) => void }) {
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
      <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Paftalar (opsiyonel)</label>
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
          list="pafta-list"
          placeholder="Pafta adı (örn. H21C02C)"
          className={`${inputClass} font-mono py-2 min-h-[44px]`}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addPafta(input)}
          disabled={!input.trim()}
          className="min-h-[44px]"
        >
          + Ekle
        </Button>
      </div>
      <datalist id="pafta-list">
        {allNames.slice(0, 100).map((n) => <option key={n} value={n} />)}
      </datalist>
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
