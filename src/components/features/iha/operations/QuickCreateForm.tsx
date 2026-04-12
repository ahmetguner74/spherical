"use client";

import { useState, useCallback } from "react";
import type {
  Operation, OperationMainCategory, OperationSubType, TeamMember,
  LocationCoordinate,
} from "@/types/iha";
import { SUB_TYPE_LABELS, getCategoryLabel } from "@/types/iha";
import { IHA_CONFIG } from "@/config/iha";
import { TypeSelector } from "./TypeSelector";
import { OperationLocationSection } from "./OperationLocationSection";
import { Button, FormInput } from "@/components/ui";
import { inputClass } from "../shared/styles";

interface QuickCreateFormProps {
  team: TeamMember[];
  onSave: (data: Omit<Operation, "id" | "createdAt" | "updatedAt" | "deliverables" | "flightLogIds" | "completionPercent">) => void;
  onCancel: () => void;
  defaultDate?: string;
  defaultStartTime?: string;
  defaultLat?: number;
  defaultLng?: number;
  defaultPaftalar?: string[];
}

export function QuickCreateForm({ team, onSave, onCancel, defaultDate, defaultStartTime, defaultLat, defaultLng, defaultPaftalar }: QuickCreateFormProps) {
  // Konum state'leri (OperationLocationSection ile uyumlu)
  const [ilce, setIlce] = useState("");
  const [mahalle, setMahalle] = useState("");
  const [sokak, setSokak] = useState("");
  const [displayAddress, setDisplayAddress] = useState("");
  const [allIlces, setAllIlces] = useState<string[] | undefined>();
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
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState<string>(defaultDate ?? today);
  const [endDate, setEndDate] = useState<string>(defaultDate ?? today);
  const [startTime, setStartTime] = useState(defaultStartTime ?? "08:00");
  const [endTime, setEndTime] = useState(() => {
    if (!defaultStartTime) return "09:00";
    const [h, m] = defaultStartTime.split(":").map(Number);
    return `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  });
  const [assignedTeam, setAssignedTeam] = useState<string[]>([]);
  const [error, setError] = useState("");

  const handleTypeChange = useCallback((cat: OperationMainCategory, subs: OperationSubType[]) => {
    setMainCategory(cat);
    setSubTypes(subs);
  }, []);

  const toggleMember = (id: string) => {
    setAssignedTeam((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const label = "block text-xs text-[var(--muted-foreground)] mb-1";
  const locationState = {
    il: IHA_CONFIG.defaultLocation.il ?? "Bursa",
    ilce, mahalle, sokak, displayAddress, lat, lng,
    polygonCoordinates, lineCoordinates, lineLength, alan, alanBirimi,
    allIlces, paftalar,
  };
  const locationSetters = {
    setIl: () => {},
    setIlce, setMahalle, setSokak, setDisplayAddress,
    setLat, setLng, setPolygonCoordinates, setLineCoordinates, setLineLength,
    setAlan, setAlanBirimi, setAllIlces, setPaftalar,
  };

  const handleSubmit = () => {
    const isOfis = mainCategory === "ofis";
    if (!isOfis && !ilce) { setError("İlçe seçin veya haritadan konum belirleyin"); return; }
    if (!isOfis && subTypes.length === 0) { setError("En az bir alt kategori seçin"); return; }

    let autoTitle = title.trim();
    if (!autoTitle) {
      if (isOfis && subTypes.length === 0) {
        autoTitle = "Ofis İşi";
      } else if (isOfis) {
        const subLabels = subTypes.map((s) => SUB_TYPE_LABELS[s]).join(", ");
        autoTitle = `Ofis + ${getCategoryLabel(subTypes)} - ${subLabels}`;
      } else {
        const subLabels = subTypes.map((s) => SUB_TYPE_LABELS[s]).join(", ");
        const catLabel = getCategoryLabel(subTypes);
        autoTitle = `${ilce} ${catLabel} - ${subLabels}`;
      }
    }

    onSave({
      title: autoTitle,
      description: "",
      type: mainCategory,
      subTypes,
      requester: "",
      status: "talep",
      location: {
        il: IHA_CONFIG.defaultLocation.il ?? "Bursa",
        ilce,
        mahalle: mahalle || undefined,
        sokak: sokak || undefined,
        pafta: paftalar[0],
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
      assignedTeam,
      assignedEquipment: [],
      startDate,
      endDate,
      startTime: startTime || "08:00",
      endTime: endTime || "09:00",
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
      <TypeSelector onChange={handleTypeChange} />
      {error && !error.includes("İlçe") && <p className="text-xs text-[var(--feedback-error)]">{error}</p>}
      <OperationLocationSection
        state={locationState}
        setters={locationSetters}
        mainCategory={mainCategory}
        permissions={[]}
        labelClass={label}
      />
      {error && error.includes("İlçe") && <p className="text-xs text-[var(--feedback-error)]">{error}</p>}
      <NameTimeField
        title={title} setTitle={setTitle}
        startDate={startDate} setStartDate={setStartDate}
        endDate={endDate} setEndDate={setEndDate}
        startTime={startTime} setStartTime={setStartTime}
        endTime={endTime} setEndTime={setEndTime}
        ilce={ilce} mainCategory={mainCategory} subTypes={subTypes}
      />
      <TeamField team={team} assignedTeam={assignedTeam} toggleMember={toggleMember} />
      <FormActions onCancel={onCancel} />
    </form>
  );
}

function NameTimeField({
  title, setTitle,
  startDate, setStartDate,
  endDate, setEndDate,
  startTime, setStartTime,
  endTime, setEndTime,
  ilce, mainCategory, subTypes,
}: {
  title: string; setTitle: (v: string) => void;
  startDate: string; setStartDate: (v: string) => void;
  endDate: string; setEndDate: (v: string) => void;
  startTime: string; setStartTime: (v: string) => void;
  endTime: string; setEndTime: (v: string) => void;
  ilce: string; mainCategory: OperationMainCategory; subTypes: OperationSubType[];
}) {
  const isOfis = mainCategory === "ofis";
  const catLabel = isOfis ? "Ofis İşi" : getCategoryLabel(subTypes);
  const subLabels = subTypes.map((s) => SUB_TYPE_LABELS[s]).join(", ");
  const placeholder = isOfis
    ? (subLabels ? `Ofis + ${subLabels}` : "Ofis İşi")
    : (ilce ? `${ilce} ${catLabel}${subLabels ? ` - ${subLabels}` : ""}` : "Otomatik oluşturulur");

  return (
    <div className="space-y-2">
      <FormInput
        label="Operasyon Adı"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholder}
      />
      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">Başlangıç</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            className={inputClass}
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              // Bitiş tarihi daha eski kalmışsa otomatik olarak hizala
              if (!endDate || endDate < e.target.value) setEndDate(e.target.value);
            }}
          />
          <input
            type="time"
            className={inputClass}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">Bitiş</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            className={inputClass}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <input
            type="time"
            className={inputClass}
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
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
