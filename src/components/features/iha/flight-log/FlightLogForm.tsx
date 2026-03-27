"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { FlightLog, OperationType, PpkStatus, Operation, Equipment, TeamMember, OperationLocation } from "@/types/iha";
import { OPERATION_TYPE_LABELS, PPK_STATUS_LABELS } from "@/types/iha";
import { OperationLocationForm } from "../operations/OperationLocationForm";

interface FlightLogFormProps {
  flightLog?: FlightLog;
  operations: Operation[];
  equipment: Equipment[];
  team: TeamMember[];
  onSave: (data: Omit<FlightLog, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

const TYPES: OperationType[] = ["lidar_el", "lidar_arac", "drone_fotogrametri", "oblik_cekim", "panorama_360"];

const inputClass =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";

export function FlightLogForm({ flightLog, operations, equipment, team, onSave, onCancel }: FlightLogFormProps) {
  const [operationId, setOperationId] = useState(flightLog?.operationId ?? "");
  const [type, setType] = useState<OperationType>(flightLog?.type ?? "drone_fotogrametri");
  const [date, setDate] = useState(flightLog?.date ?? new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState(flightLog?.startTime ?? "");
  const [endTime, setEndTime] = useState(flightLog?.endTime ?? "");
  const [duration, setDuration] = useState(flightLog?.duration ?? 0);

  const [pilotId, setPilotId] = useState(flightLog?.pilotId ?? "");
  const [equipmentId, setEquipmentId] = useState(flightLog?.equipmentId ?? "");

  const [altitude, setAltitude] = useState(flightLog?.altitude ?? 0);
  const [gsd, setGsd] = useState(flightLog?.gsd ?? 0);
  const [overlapForward, setOverlapForward] = useState(flightLog?.overlapForward ?? 80);
  const [overlapSide, setOverlapSide] = useState(flightLog?.overlapSide ?? 70);
  const [photoCount, setPhotoCount] = useState(flightLog?.photoCount ?? 0);
  const [scanCount, setScanCount] = useState(flightLog?.scanCount ?? 0);

  const [batteryUsed, setBatteryUsed] = useState(flightLog?.batteryUsed ?? 0);
  const [landingCount, setLandingCount] = useState(flightLog?.landingCount ?? 0);

  const [gpsBaseStation, setGpsBaseStation] = useState(flightLog?.gpsBaseStation ?? "");
  const [staticDuration, setStaticDuration] = useState(flightLog?.staticDuration ?? 20);
  const [corsConnection, setCorsConnection] = useState(flightLog?.corsConnection ?? "");
  const [ppkStatus, setPpkStatus] = useState<PpkStatus>(flightLog?.ppkStatus ?? "beklemede");

  const [weather, setWeather] = useState(flightLog?.weather ?? "");
  const [windSpeed, setWindSpeed] = useState(flightLog?.windSpeed ?? 0);
  const [temperature, setTemperature] = useState(flightLog?.temperature ?? 0);

  const [location, setLocation] = useState<OperationLocation>(flightLog?.location ?? { il: "Bursa", ilce: "" });
  const [notes, setNotes] = useState(flightLog?.notes ?? "");

  // Custom fields
  const [customFields, setCustomFields] = useState<Record<string, string>>(flightLog?.customFields ?? {});
  const [newFieldKey, setNewFieldKey] = useState("");

  const selectedPilot = team.find((t) => t.id === pilotId);
  const selectedEquipment = equipment.find((e) => e.id === equipmentId);

  const isLidar = type === "lidar_el" || type === "lidar_arac";

  const handleSubmit = () => {
    onSave({
      operationId: operationId || "",
      type,
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      duration: duration || undefined,
      pilotId: pilotId || undefined,
      pilotName: selectedPilot?.name,
      equipmentId: equipmentId || undefined,
      equipmentName: selectedEquipment?.name,
      altitude: altitude || undefined,
      gsd: gsd || undefined,
      overlapForward: overlapForward || undefined,
      overlapSide: overlapSide || undefined,
      photoCount: photoCount || undefined,
      scanCount: isLidar ? scanCount || undefined : undefined,
      batteryUsed: batteryUsed || undefined,
      totalFlightTime: duration || undefined,
      landingCount: landingCount || undefined,
      gpsBaseStation: gpsBaseStation || undefined,
      staticDuration: staticDuration || undefined,
      corsConnection: corsConnection || undefined,
      ppkStatus,
      weather: weather || undefined,
      windSpeed: windSpeed || undefined,
      temperature: temperature || undefined,
      location,
      customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
      notes: notes || undefined,
    });
  };

  const addCustomField = () => {
    if (!newFieldKey.trim()) return;
    setCustomFields({ ...customFields, [newFieldKey.trim()]: "" });
    setNewFieldKey("");
  };

  return (
    <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
      {/* Temel Bilgiler */}
      <SectionTitle text="Temel Bilgiler" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Operasyon</label>
          <select value={operationId} onChange={(e) => setOperationId(e.target.value)} className={inputClass}>
            <option value="">Bağımsız kayıt</option>
            {operations.map((op) => (
              <option key={op.id} value={op.id}>{op.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Tip</label>
          <select value={type} onChange={(e) => setType(e.target.value as OperationType)} className={inputClass}>
            {TYPES.map((t) => (
              <option key={t} value={t}>{OPERATION_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Tarih</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Başlangıç</label>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Bitiş</label>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Pilot / Operatör</label>
          <select value={pilotId} onChange={(e) => setPilotId(e.target.value)} className={inputClass}>
            <option value="">Seçin</option>
            {team.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Ekipman</label>
          <select value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} className={inputClass}>
            <option value="">Seçin</option>
            {equipment.map((eq) => (
              <option key={eq.id} value={eq.id}>{eq.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Uçuş / Tarama Parametreleri */}
      <SectionTitle text={isLidar ? "Tarama Parametreleri" : "Uçuş Parametreleri"} />
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Yükseklik (m)</label>
          <input type="number" value={altitude} onChange={(e) => setAltitude(Number(e.target.value))} className={inputClass} min={0} />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">GSD (cm/px)</label>
          <input type="number" value={gsd} onChange={(e) => setGsd(Number(e.target.value))} className={inputClass} min={0} step={0.1} />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Süre (dk)</label>
          <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={inputClass} min={0} />
        </div>
      </div>

      {!isLidar && (
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">İleri Örtüşme (%)</label>
            <input type="number" value={overlapForward} onChange={(e) => setOverlapForward(Number(e.target.value))} className={inputClass} min={0} max={99} />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Yan Örtüşme (%)</label>
            <input type="number" value={overlapSide} onChange={(e) => setOverlapSide(Number(e.target.value))} className={inputClass} min={0} max={99} />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Fotoğraf Sayısı</label>
            <input type="number" value={photoCount} onChange={(e) => setPhotoCount(Number(e.target.value))} className={inputClass} min={0} />
          </div>
        </div>
      )}

      {isLidar && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Tarama Sayısı</label>
            <input type="number" value={scanCount} onChange={(e) => setScanCount(Number(e.target.value))} className={inputClass} min={0} />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Tarama Süresi (dk/tarama)</label>
            <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={inputClass} min={0} />
          </div>
        </div>
      )}

      {/* Batarya */}
      <SectionTitle text="Batarya" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Kullanılan Batarya</label>
          <input type="number" value={batteryUsed} onChange={(e) => setBatteryUsed(Number(e.target.value))} className={inputClass} min={0} />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">İniş Sayısı</label>
          <input type="number" value={landingCount} onChange={(e) => setLandingCount(Number(e.target.value))} className={inputClass} min={0} />
        </div>
      </div>

      {/* GPS / CORS */}
      <SectionTitle text="GPS / CORS" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Baz İstasyonu</label>
          <input type="text" value={gpsBaseStation} onChange={(e) => setGpsBaseStation(e.target.value)} className={inputClass} placeholder="Konum / Nokta adı" />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Statik Süre (dk)</label>
          <input type="number" value={staticDuration} onChange={(e) => setStaticDuration(Number(e.target.value))} className={inputClass} min={0} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">CORS Bağlantı</label>
          <input type="text" value={corsConnection} onChange={(e) => setCorsConnection(e.target.value)} className={inputClass} placeholder="BUSAGA / Diğer" />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">PPK Durumu</label>
          <select value={ppkStatus} onChange={(e) => setPpkStatus(e.target.value as PpkStatus)} className={inputClass}>
            {(Object.entries(PPK_STATUS_LABELS) as [PpkStatus, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Hava Koşulları */}
      <SectionTitle text="Hava Koşulları" />
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Durum</label>
          <input type="text" value={weather} onChange={(e) => setWeather(e.target.value)} className={inputClass} placeholder="Açık, Bulutlu..." />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Rüzgar (km/sa)</label>
          <input type="number" value={windSpeed} onChange={(e) => setWindSpeed(Number(e.target.value))} className={inputClass} min={0} />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Sıcaklık (°C)</label>
          <input type="number" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} className={inputClass} />
        </div>
      </div>

      {/* Konum */}
      <OperationLocationForm location={location} onChange={setLocation} />

      {/* Özel Alanlar */}
      <SectionTitle text="Özel Alanlar" />
      {Object.entries(customFields).map(([key, value]) => (
        <div key={key} className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">{key}</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setCustomFields({ ...customFields, [key]: e.target.value })}
              className={inputClass}
            />
          </div>
          <button
            onClick={() => {
              const next = { ...customFields };
              delete next[key];
              setCustomFields(next);
            }}
            className="px-2 py-2 text-red-500 text-xs hover:bg-red-500/10 rounded"
          >
            ×
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          type="text"
          value={newFieldKey}
          onChange={(e) => setNewFieldKey(e.target.value)}
          className={inputClass}
          placeholder="Alan adı ekle..."
        />
        <Button variant="ghost" size="sm" onClick={addCustomField} disabled={!newFieldKey.trim()}>
          + Ekle
        </Button>
      </div>

      {/* Notlar */}
      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">Notlar</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} h-16 resize-none`} />
      </div>

      <div className="flex gap-2 pt-2 sticky bottom-0 bg-[var(--surface)] py-3">
        <Button onClick={handleSubmit}>{flightLog ? "Güncelle" : "Kaydet"}</Button>
        <Button variant="ghost" onClick={onCancel}>İptal</Button>
      </div>
    </div>
  );
}

function SectionTitle({ text }: { text: string }) {
  return (
    <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider pt-2 border-t border-[var(--border)]">
      {text}
    </h4>
  );
}
