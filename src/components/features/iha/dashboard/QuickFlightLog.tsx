"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { inputClass } from "../shared/styles";
import { IHA_CONFIG } from "@/config/iha";
import type { OperationType, FlightLog, Operation, Equipment, TeamMember } from "@/types/iha";
import { OPERATION_TYPE_LABELS } from "@/types/iha";

interface QuickFlightLogProps {
  operations: Operation[];
  equipment: Equipment[];
  team: TeamMember[];
  onSave: (data: Omit<FlightLog, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

const TYPES: OperationType[] = [
  "drone_fotogrametri", "oblik_cekim", "panorama_360", "lidar_el", "lidar_arac",
];

export function QuickFlightLog({ operations, equipment, team, onSave, onCancel }: QuickFlightLogProps) {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toTimeString().slice(0, 5);

  const activeOps = operations.filter((op) => op.status === "saha" || op.status === "planlama");
  const drones = equipment.filter((eq) => eq.category === "drone" || eq.category === "tarayici");
  const pilots = team.filter((t) => t.specialties?.some((s) => s.toLowerCase().includes("pilot") || s.toLowerCase().includes("lidar")));

  const [operationId, setOperationId] = useState(activeOps[0]?.id ?? "");
  const [type, setType] = useState<OperationType>("drone_fotogrametri");
  const [date] = useState(today);
  const [startTime, setStartTime] = useState(now);
  const [pilotId, setPilotId] = useState(pilots[0]?.id ?? "");
  const [equipmentId, setEquipmentId] = useState(drones[0]?.id ?? "");
  const [ilce, setIlce] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();

  useEffect(() => {
    if (operationId) {
      const op = operations.find((o) => o.id === operationId);
      if (op) {
        setType(op.type);
        setIlce(op.location.ilce);
        if (op.location.lat) setLat(op.location.lat);
        if (op.location.lng) setLng(op.location.lng);
      }
    }
  }, [operationId, operations]);

  const getGPS = () => {
    if (!navigator.geolocation) return;
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Math.round(pos.coords.latitude * 10000) / 10000);
        setLng(Math.round(pos.coords.longitude * 10000) / 10000);
        setGettingLocation(false);
      },
      () => setGettingLocation(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const selectedPilot = team.find((t) => t.id === pilotId);
  const selectedEquipment = equipment.find((e) => e.id === equipmentId);

  const handleSave = () => {
    onSave({
      operationId: operationId || "",
      type,
      date,
      startTime,
      pilotId,
      pilotName: selectedPilot?.name,
      equipmentId,
      equipmentName: selectedEquipment?.name,
      corsConnection: "BUSAGA",
      location: {
        il: IHA_CONFIG.defaultLocation.il,
        ilce,
        lat,
        lng,
      },
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--muted-foreground)]">
        Sahadan hızlı kayıt. Detayları sonra düzenleyebilirsin.
      </p>

      {activeOps.length > 0 && (
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Operasyon</label>
          <select value={operationId} onChange={(e) => setOperationId(e.target.value)} className={inputClass}>
            <option value="">Bağımsız kayıt</option>
            {activeOps.map((op) => (
              <option key={op.id} value={op.id}>{op.title}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Tip</label>
          <select value={type} onChange={(e) => setType(e.target.value as OperationType)} className={inputClass}>
            {TYPES.map((t) => (
              <option key={t} value={t}>{OPERATION_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Başlangıç</label>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Pilot</label>
          <select value={pilotId} onChange={(e) => setPilotId(e.target.value)} className={inputClass}>
            {team.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Ekipman</label>
          <select value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} className={inputClass}>
            {drones.map((eq) => (
              <option key={eq.id} value={eq.id}>{eq.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">İlçe</label>
          <input type="text" value={ilce} onChange={(e) => setIlce(e.target.value)} className={inputClass} placeholder="ör: Osmangazi" />
        </div>
        <button
          type="button"
          onClick={getGPS}
          disabled={gettingLocation}
          className="px-3 py-2 text-xs rounded-md border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface)] transition-colors"
        >
          {gettingLocation ? "..." : "GPS"}
        </button>
      </div>

      {lat && lng && (
        <p className="text-xs text-[var(--muted-foreground)]">
          Konum: {lat}, {lng}
        </p>
      )}

      <div className="flex gap-2 pt-2">
        <Button onClick={handleSave}>Kaydet</Button>
        <Button variant="ghost" onClick={onCancel}>İptal</Button>
      </div>
    </div>
  );
}
