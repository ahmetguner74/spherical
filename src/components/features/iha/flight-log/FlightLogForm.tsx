"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { toast } from "@/components/ui/Toast";
import type { FlightLog, OperationType, PpkStatus, Operation, Equipment, TeamMember, OperationLocation } from "@/types/iha";
import { OPERATION_TYPE_LABELS, PPK_STATUS_LABELS } from "@/types/iha";
import { OperationLocationForm } from "../operations/OperationLocationForm";
import { inputClass } from "../shared/styles";
import { IHA_CONFIG } from "@/config/iha";
import { IconTrash } from "@/config/icons";

interface FlightLogFormProps {
  flightLog?: FlightLog;
  operations: Operation[];
  equipment: Equipment[];
  team: TeamMember[];
  onSave: (data: Omit<FlightLog, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

const TYPES: OperationType[] = ["iha", "lidar", "lidar_el", "lidar_arac", "drone_fotogrametri", "oblik_cekim", "panorama_360"];

export function FlightLogForm({ flightLog, operations, equipment, team, onSave, onCancel }: FlightLogFormProps) {
  // Temel
  const [operationId, setOperationId] = useState(flightLog?.operationId ?? "");
  const [type, setType] = useState<OperationType>(flightLog?.type ?? "drone_fotogrametri");
  const [date, setDate] = useState(flightLog?.date ?? new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState(flightLog?.startTime ?? "");
  const [endTime, setEndTime] = useState(flightLog?.endTime ?? "");
  const [duration, setDuration] = useState(flightLog?.duration ?? 0);
  const [pilotId, setPilotId] = useState(flightLog?.pilotId ?? "");
  const [equipmentId, setEquipmentId] = useState(flightLog?.equipmentId ?? "");

  // Parametreler
  const [altitude, setAltitude] = useState(flightLog?.altitude ?? 0);
  const [gsd, setGsd] = useState(flightLog?.gsd ?? 0);
  const [overlapForward, setOverlapForward] = useState(flightLog?.overlapForward ?? 80);
  const [overlapSide, setOverlapSide] = useState(flightLog?.overlapSide ?? 70);
  const [photoCount, setPhotoCount] = useState(flightLog?.photoCount ?? 0);
  const [scanCount, setScanCount] = useState(flightLog?.scanCount ?? 0);

  // Batarya
  const [batteryUsed, setBatteryUsed] = useState(flightLog?.batteryUsed ?? 0);
  const [landingCount, setLandingCount] = useState(flightLog?.landingCount ?? 0);

  // GPS
  const [gpsBaseStation, setGpsBaseStation] = useState(flightLog?.gpsBaseStation ?? "");
  const [staticDuration, setStaticDuration] = useState(flightLog?.staticDuration ?? 20);
  const [corsConnection, setCorsConnection] = useState(flightLog?.corsConnection ?? "");
  const [ppkStatus, setPpkStatus] = useState<PpkStatus>(flightLog?.ppkStatus ?? "beklemede");

  // Tarama süresi + görüş
  const [scanDuration, setScanDuration] = useState(flightLog?.scanDuration ?? 0);
  const [visibility, setVisibility] = useState((flightLog as unknown as Record<string, unknown>)?.visibility as string ?? "");

  // Hava
  const [weather, setWeather] = useState(flightLog?.weather ?? "");
  const [windSpeed, setWindSpeed] = useState(flightLog?.windSpeed ?? 0);
  const [temperature, setTemperature] = useState(flightLog?.temperature ?? 0);

  // Konum + Not
  const [location, setLocation] = useState<OperationLocation>(flightLog?.location ?? IHA_CONFIG.defaultLocation);
  const [notes, setNotes] = useState(flightLog?.notes ?? "");

  // Özel alanlar
  const [customFields, setCustomFields] = useState<Record<string, string>>(flightLog?.customFields ?? {});
  const [newFieldKey, setNewFieldKey] = useState("");

  const selectedPilot = team.find((t) => t.id === pilotId);
  const selectedEquipment = equipment.find((e) => e.id === equipmentId);
  const isLidar = type === "lidar_el" || type === "lidar_arac";

  // Süre otomatik hesaplama
  const autoCalcDuration = (start: string, end: string) => {
    if (!start || !end) return;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff > 0) setDuration(diff);
  };

  const handleSubmit = () => {
    if (startTime && endTime && endTime <= startTime) {
      toast("Bitiş saati başlangıç saatinden sonra olmalı", "error");
      return;
    }
    onSave({
      operationId: operationId || "",
      type, date,
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
      scanDuration: isLidar ? scanDuration || undefined : undefined,
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

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
      {/* === TEMEL BİLGİLER (her zaman açık) === */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Operasyon</label>
            <select value={operationId} onChange={(e) => setOperationId(e.target.value)} className={inputClass}>
              <option value="">Bağımsız kayıt</option>
              {operations.map((op) => <option key={op.id} value={op.id}>{op.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Tip</label>
            <select value={type} onChange={(e) => setType(e.target.value as OperationType)} className={inputClass}>
              {TYPES.map((t) => <option key={t} value={t}>{OPERATION_TYPE_LABELS[t]}</option>)}
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
            <input type="time" value={startTime} onChange={(e) => { setStartTime(e.target.value); autoCalcDuration(e.target.value, endTime); }} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Bitiş</label>
            <input type="time" value={endTime} onChange={(e) => { setEndTime(e.target.value); autoCalcDuration(startTime, e.target.value); }} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Pilot</label>
            <select value={pilotId} onChange={(e) => setPilotId(e.target.value)} className={inputClass}>
              <option value="">Seçin</option>
              {team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Ekipman</label>
            <select value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} className={inputClass}>
              <option value="">Seçin</option>
              {equipment.map((eq) => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Süre (dk)</label>
            <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={inputClass} min={0} />
          </div>
        </div>
      </div>

      {/* === KATLANABILIR BÖLÜMLER === */}

      <CollapsibleSection title={isLidar ? "Tarama Parametreleri" : "Uçuş Parametreleri"}>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Yükseklik (m)</label>
            <input type="number" value={altitude} onChange={(e) => setAltitude(Number(e.target.value))} className={inputClass} min={0} />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">GSD (cm/px)</label>
            <input type="number" value={gsd} onChange={(e) => setGsd(Number(e.target.value))} className={inputClass} min={0} step={0.1} />
          </div>
          {isLidar ? (
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">Tarama Sayısı</label>
              <input type="number" value={scanCount} onChange={(e) => setScanCount(Number(e.target.value))} className={inputClass} min={0} />
            </div>
          ) : (
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">Fotoğraf</label>
              <input type="number" value={photoCount} onChange={(e) => setPhotoCount(Number(e.target.value))} className={inputClass} min={0} />
            </div>
          )}
        </div>
        {!isLidar && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">İleri Örtüşme (%)</label>
              <input type="number" value={overlapForward} onChange={(e) => setOverlapForward(Number(e.target.value))} className={inputClass} min={0} max={99} />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">Yan Örtüşme (%)</label>
              <input type="number" value={overlapSide} onChange={(e) => setOverlapSide(Number(e.target.value))} className={inputClass} min={0} max={99} />
            </div>
          </div>
        )}
      </CollapsibleSection>

      {/* Backend'de var, UI'da yoktu */}
      <div className="ring-2 ring-red-500 rounded-lg p-3 space-y-3">
        <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">Ek Parametreler</p>
        <div className="grid grid-cols-2 gap-3">
          {isLidar && (
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">Tarama Süresi (dk)</label>
              <input type="number" value={scanDuration} onChange={(e) => setScanDuration(Number(e.target.value))} className={inputClass} min={0} />
            </div>
          )}
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Görüş Mesafesi</label>
            <input type="text" value={visibility} onChange={(e) => setVisibility(e.target.value)} className={inputClass} placeholder="10 km, iyi, kısıtlı..." />
          </div>
        </div>
      </div>

      <CollapsibleSection title="Batarya">
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
      </CollapsibleSection>

      <CollapsibleSection title="GPS / CORS">
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
            <input type="text" value={corsConnection} onChange={(e) => setCorsConnection(e.target.value)} className={inputClass} placeholder="BUSAGA" />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">PPK Durumu</label>
            <select value={ppkStatus} onChange={(e) => setPpkStatus(e.target.value as PpkStatus)} className={inputClass}>
              {(Object.entries(PPK_STATUS_LABELS) as [PpkStatus, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Hava Koşulları">
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
      </CollapsibleSection>

      <CollapsibleSection title="Konum">
        <OperationLocationForm location={location} onChange={setLocation} />
      </CollapsibleSection>

      <CollapsibleSection title="Özel Alanlar">
        {Object.entries(customFields).map(([key, value]) => (
          <div key={key} className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">{key}</label>
              <input type="text" value={value} onChange={(e) => setCustomFields({ ...customFields, [key]: e.target.value })} className={inputClass} />
            </div>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => { const next = { ...customFields }; delete next[key]; setCustomFields(next); }}
              aria-label={`${key} alanını sil`}
              className="min-h-[44px]"
            >
              <IconTrash size={14} />
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <input type="text" value={newFieldKey} onChange={(e) => setNewFieldKey(e.target.value)} className={inputClass} placeholder="Alan adı ekle..." />
          <Button variant="ghost" size="sm" onClick={() => { if (newFieldKey.trim()) { setCustomFields({ ...customFields, [newFieldKey.trim()]: "" }); setNewFieldKey(""); } }} disabled={!newFieldKey.trim()}>+</Button>
        </div>
      </CollapsibleSection>

      {/* Not */}
      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">Notlar</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} h-16 resize-none`} />
      </div>

      <div className="flex gap-2 pt-2 sticky bottom-0 bg-[var(--surface)] py-3">
        <Button type="submit">{flightLog ? "Güncelle" : "Kaydet"}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>İptal</Button>
      </div>
    </form>
  );
}
