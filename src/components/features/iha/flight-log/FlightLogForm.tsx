"use client";

import { useState } from "react";
import { Button, FormInput, FormSelect, FormTextarea } from "@/components/ui";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { toast } from "@/components/ui/Toast";
import type { FlightLog, OperationType, PpkStatus, Operation, Equipment, TeamMember, OperationLocation } from "@/types/iha";
import { OPERATION_TYPE_LABELS, PPK_STATUS_LABELS } from "@/types/iha";
import { OperationLocationForm } from "../operations/OperationLocationForm";
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
  const [visibility, setVisibility] = useState(flightLog?.visibility ?? "");

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
      visibility: visibility || undefined,
      location,
      customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
      notes: notes || undefined,
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
      {/* === TEMEL BİLGİLER (her zaman açık) === */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormSelect
            label="Operasyon"
            value={operationId}
            onChange={(e) => setOperationId(e.target.value)}
          >
            <option value="">Bağımsız kayıt</option>
            {operations.map((op) => <option key={op.id} value={op.id}>{op.title}</option>)}
          </FormSelect>
          <FormSelect
            label="Tip"
            value={type}
            onChange={(e) => setType(e.target.value as OperationType)}
          >
            {TYPES.map((t) => <option key={t} value={t}>{OPERATION_TYPE_LABELS[t]}</option>)}
          </FormSelect>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormInput
            label="Tarih"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <FormInput
            label="Başlangıç"
            type="time"
            value={startTime}
            onChange={(e) => { setStartTime(e.target.value); autoCalcDuration(e.target.value, endTime); }}
          />
          <FormInput
            label="Bitiş"
            type="time"
            value={endTime}
            onChange={(e) => { setEndTime(e.target.value); autoCalcDuration(startTime, e.target.value); }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormSelect
            label="Pilot"
            value={pilotId}
            onChange={(e) => setPilotId(e.target.value)}
          >
            <option value="">Seçin</option>
            {team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </FormSelect>
          <FormSelect
            label="Ekipman"
            value={equipmentId}
            onChange={(e) => setEquipmentId(e.target.value)}
          >
            <option value="">Seçin</option>
            {equipment.map((eq) => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
          </FormSelect>
          <FormInput
            label="Süre (dk)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            min={0}
          />
        </div>
      </div>

      {/* === KATLANABILIR BÖLÜMLER === */}

      <CollapsibleSection title={isLidar ? "Tarama Parametreleri" : "Uçuş Parametreleri"}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormInput
            label="Yükseklik (m)"
            type="number"
            value={altitude}
            onChange={(e) => setAltitude(Number(e.target.value))}
            min={0}
          />
          <FormInput
            label="GSD (cm/px)"
            type="number"
            value={gsd}
            onChange={(e) => setGsd(Number(e.target.value))}
            min={0}
            step={0.1}
          />
          {isLidar ? (
            <FormInput
              label="Tarama Sayısı"
              type="number"
              value={scanCount}
              onChange={(e) => setScanCount(Number(e.target.value))}
              min={0}
            />
          ) : (
            <FormInput
              label="Fotoğraf"
              type="number"
              value={photoCount}
              onChange={(e) => setPhotoCount(Number(e.target.value))}
              min={0}
            />
          )}
        </div>
        {!isLidar && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="İleri Örtüşme (%)"
              type="number"
              value={overlapForward}
              onChange={(e) => setOverlapForward(Number(e.target.value))}
              min={0}
              max={99}
            />
            <FormInput
              label="Yan Örtüşme (%)"
              type="number"
              value={overlapSide}
              onChange={(e) => setOverlapSide(Number(e.target.value))}
              min={0}
              max={99}
            />
          </div>
        )}
      </CollapsibleSection>

      {/* Ek Parametreler */}
      <div className="rounded-lg p-3 space-y-3 border border-[var(--border)]">
        <p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Ek Parametreler</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {isLidar && (
            <FormInput
              label="Tarama Süresi (dk)"
              type="number"
              value={scanDuration}
              onChange={(e) => setScanDuration(Number(e.target.value))}
              min={0}
            />
          )}
          <FormInput
            label="Görüş Mesafesi"
            type="text"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            placeholder="10 km, iyi, kısıtlı..."
          />
        </div>
      </div>

      <CollapsibleSection title="Batarya">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormInput
            label="Kullanılan Batarya"
            type="number"
            value={batteryUsed}
            onChange={(e) => setBatteryUsed(Number(e.target.value))}
            min={0}
          />
          <FormInput
            label="İniş Sayısı"
            type="number"
            value={landingCount}
            onChange={(e) => setLandingCount(Number(e.target.value))}
            min={0}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="GPS / CORS">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormInput
            label="Baz İstasyonu"
            type="text"
            value={gpsBaseStation}
            onChange={(e) => setGpsBaseStation(e.target.value)}
            placeholder="Konum / Nokta adı"
          />
          <FormInput
            label="Statik Süre (dk)"
            type="number"
            value={staticDuration}
            onChange={(e) => setStaticDuration(Number(e.target.value))}
            min={0}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormInput
            label="CORS Bağlantı"
            type="text"
            value={corsConnection}
            onChange={(e) => setCorsConnection(e.target.value)}
            placeholder="BUSAGA"
          />
          <FormSelect
            label="PPK Durumu"
            value={ppkStatus}
            onChange={(e) => setPpkStatus(e.target.value as PpkStatus)}
          >
            {(Object.entries(PPK_STATUS_LABELS) as [PpkStatus, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </FormSelect>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Hava Koşulları">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormInput
            label="Durum"
            type="text"
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
            placeholder="Açık, Bulutlu..."
          />
          <FormInput
            label="Rüzgar (km/sa)"
            type="number"
            value={windSpeed}
            onChange={(e) => setWindSpeed(Number(e.target.value))}
            min={0}
          />
          <FormInput
            label="Sıcaklık (°C)"
            type="number"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Konum">
        <OperationLocationForm location={location} onChange={setLocation} />
      </CollapsibleSection>

      <CollapsibleSection title="Özel Alanlar">
        {Object.entries(customFields).map(([key, value]) => (
          <div key={key} className="flex gap-2 items-end">
            <div className="flex-1">
              <FormInput
                label={key}
                type="text"
                value={value}
                onChange={(e) => setCustomFields({ ...customFields, [key]: e.target.value })}
              />
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
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <FormInput
              label="Yeni Alan"
              type="text"
              value={newFieldKey}
              onChange={(e) => setNewFieldKey(e.target.value)}
              placeholder="Alan adı ekle..."
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { if (newFieldKey.trim()) { setCustomFields({ ...customFields, [newFieldKey.trim()]: "" }); setNewFieldKey(""); } }}
            disabled={!newFieldKey.trim()}
            className="min-h-[44px]"
          >
            +
          </Button>
        </div>
      </CollapsibleSection>

      <FormTextarea
        label="Notlar"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
      />

      <div className="flex gap-2 pt-2 sticky bottom-0 bg-[var(--surface)] py-3">
        <Button type="submit">{flightLog ? "Güncelle" : "Kaydet"}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>İptal</Button>
      </div>
    </form>
  );
}
