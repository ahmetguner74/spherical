"use client";

import { useState, useCallback } from "react";
import type { Operation, OperationMainCategory, OperationSubType, TeamMember } from "@/types/iha";
import { SUB_TYPE_LABELS } from "@/types/iha";
import { inputClass } from "../shared/styles";
import { BURSA_ILCELER } from "@/config/iha";
import { TypeSelector } from "./TypeSelector";

interface QuickCreateFormProps {
  team: TeamMember[];
  onSave: (data: Omit<Operation, "id" | "createdAt" | "updatedAt" | "deliverables" | "flightLogIds" | "completionPercent">) => void;
  onCancel: () => void;
  defaultDate?: string;
  defaultLat?: number;
  defaultLng?: number;
}

export function QuickCreateForm({ team, onSave, onCancel, defaultDate, defaultLat, defaultLng }: QuickCreateFormProps) {
  const [ilce, setIlce] = useState("");
  const [mainCategory, setMainCategory] = useState<OperationMainCategory>("iha");
  const [subTypes, setSubTypes] = useState<OperationSubType[]>([]);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [assignedTeam, setAssignedTeam] = useState<string[]>([]);
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
      location: { il: "Bursa", ilce, lat: defaultLat, lng: defaultLng },
      assignedTeam,
      assignedEquipment: [],
      startDate,
      startTime,
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
      <LocationField ilce={ilce} setIlce={setIlce} error={error} setError={setError} />
      <TypeSelector onChange={handleTypeChange} />
      {error && error !== "İlçe seçin" && <p className="text-xs text-red-500">{error}</p>}
      <NameTimeField title={title} setTitle={setTitle} startTime={startTime} setStartTime={setStartTime} ilce={ilce} mainCategory={mainCategory} subTypes={subTypes} />
      <TeamField team={team} assignedTeam={assignedTeam} toggleMember={toggleMember} />
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

function NameTimeField({ title, setTitle, startTime, setStartTime, ilce, mainCategory, subTypes }: {
  title: string; setTitle: (v: string) => void; startTime: string; setStartTime: (v: string) => void;
  ilce: string; mainCategory: OperationMainCategory; subTypes: OperationSubType[];
}) {
  const catLabel = mainCategory === "iha" ? "İHA" : "LİDAR";
  const subLabels = subTypes.map((s) => SUB_TYPE_LABELS[s]).join(", ");
  const placeholder = ilce ? `${ilce} ${catLabel}${subLabels ? ` - ${subLabels}` : ""}` : "Otomatik oluşturulur";

  return (
    <div className="grid grid-cols-[1fr_auto] gap-2">
      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Operasyon Adı</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={placeholder} className={`${inputClass} py-2.5`} />
      </div>
      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Saat</label>
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={`${inputClass} py-2.5`} />
      </div>
    </div>
  );
}

function TeamField({ team, assignedTeam, toggleMember }: { team: TeamMember[]; assignedTeam: string[]; toggleMember: (id: string) => void }) {
  return (
    <div>
      <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Kim gidecek?</label>
      <div className="flex flex-wrap gap-2">
        {team.map((m) => (
          <button key={m.id} type="button" onClick={() => toggleMember(m.id)}
            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors min-h-[44px] ${
              assignedTeam.includes(m.id) ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
            }`}
          >{m.name}</button>
        ))}
      </div>
    </div>
  );
}

function FormActions({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="flex gap-2 pt-1">
      <button type="submit" className="flex-1 py-3 rounded-lg bg-[var(--accent)] text-white font-semibold text-sm hover:opacity-90 transition-opacity min-h-[48px]">
        Oluştur
      </button>
      <button type="button" onClick={onCancel} className="px-4 py-3 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] text-sm hover:bg-[var(--surface-hover)] transition-colors min-h-[48px]">
        İptal
      </button>
    </div>
  );
}
