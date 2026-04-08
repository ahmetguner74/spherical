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

export function QuickFlightLog({ operations, equipment, team, onSave, onCancel }: QuickFlightLogProps) {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toTimeString().slice(0, 5);

  const activeOps = operations.filter((op) => op.status === "saha" || op.status === "planlama");
  const pilots = team.filter((t) => t.pilotLicense || t.profession?.toLowerCase().includes("pilot"));

  const [operationId, setOperationId] = useState(activeOps[0]?.id ?? "");
  const [pilotId, setPilotId] = useState(pilots[0]?.id ?? "");
  const [gettingLocation, setGettingLocation] = useState(false);
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();

  // Operasyon seçilince otomatik doldurulan değerler
  const selectedOp = operations.find((o) => o.id === operationId);
  const type: OperationType = selectedOp?.type ?? "drone_fotogrametri";
  const ilce = selectedOp?.location.ilce ?? "";

  useEffect(() => {
    if (selectedOp?.location.lat) setLat(selectedOp.location.lat);
    if (selectedOp?.location.lng) setLng(selectedOp.location.lng);
  }, [operationId, selectedOp?.location.lat, selectedOp?.location.lng]);

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
  const drones = equipment.filter((eq) => eq.category === "drone" || eq.category === "tarayici");
  const autoEquipment = selectedOp
    ? drones.find((d) => selectedOp.assignedEquipment.includes(d.id))
    : drones[0];

  const handleSave = () => {
    onSave({
      operationId: operationId || "",
      type,
      date: today,
      startTime: now,
      pilotId,
      pilotName: selectedPilot?.name,
      equipmentId: autoEquipment?.id,
      equipmentName: autoEquipment?.name,
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
    <div className="space-y-4">
      <p className="text-xs text-[var(--muted-foreground)]">
        3 alan doldur, kaydı oluştur. Detayları sonra düzenlersin.
      </p>

      {/* 1. Operasyon */}
      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">Operasyon *</label>
        <select value={operationId} onChange={(e) => setOperationId(e.target.value)} className={`${inputClass} text-base py-3`}>
          <option value="">Bağımsız kayıt</option>
          {activeOps.map((op) => (
            <option key={op.id} value={op.id}>{op.title} — {op.location.ilce}</option>
          ))}
        </select>
      </div>

      {/* 2. Pilot */}
      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">Pilot *</label>
        <select value={pilotId} onChange={(e) => setPilotId(e.target.value)} className={`${inputClass} text-base py-3`}>
          {(pilots.length > 0 ? pilots : team).map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* 3. GPS Konum */}
      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">Konum</label>
        <button
          type="button"
          onClick={getGPS}
          disabled={gettingLocation}
          className="w-full py-3 text-sm rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface)] active:bg-[var(--surface-hover)] transition-colors"
        >
          {gettingLocation ? "Konum alınıyor..." : lat && lng ? `${lat}, ${lng}` : "GPS Konumu Al"}
        </button>
      </div>

      {/* Otomatik doldurulan bilgiler (bilgi amaçlı) */}
      {selectedOp && (
        <div className="rounded-lg bg-[var(--background)] p-3 text-xs text-[var(--muted-foreground)] space-y-1">
          <div className="flex justify-between">
            <span>Tip:</span>
            <span className="text-[var(--foreground)]">{OPERATION_TYPE_LABELS[type]}</span>
          </div>
          {autoEquipment && (
            <div className="flex justify-between">
              <span>Ekipman:</span>
              <span className="text-[var(--foreground)]">{autoEquipment.name}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tarih / Saat:</span>
            <span className="text-[var(--foreground)]">{today} {now}</span>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button onClick={handleSave} className="flex-1 py-3 text-base">Kaydet</Button>
        <Button variant="ghost" onClick={onCancel} className="py-3">İptal</Button>
      </div>
    </div>
  );
}
