"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { MapPolygon } from "../map";
import { toast } from "@/components/ui/Toast";
import type { FlightPermission, FlightPermissionCoordinate, PermissionStatus, Operation } from "@/types/iha";
import { PERMISSION_STATUS_LABELS } from "@/types/iha";
import { inputClass } from "../shared/styles";

interface PermissionFormProps {
  permission?: FlightPermission;
  operations: Operation[];
  onSave: (data: Omit<FlightPermission, "id" | "createdAt">) => void;
  onCancel: () => void;
}

const STATUSES: PermissionStatus[] = ["beklemede", "onaylandi", "reddedildi", "suresi_doldu"];

export function PermissionForm({ permission, operations, onSave, onCancel }: PermissionFormProps) {
  const [operationId, setOperationId] = useState(permission?.operationId ?? "");
  const [hsdNumber, setHsdNumber] = useState(permission?.hsdNumber ?? "");
  const [status, setStatus] = useState<PermissionStatus>(permission?.status ?? "beklemede");
  const [startDate, setStartDate] = useState(permission?.startDate ?? "");
  const [endDate, setEndDate] = useState(permission?.endDate ?? "");
  const [maxAltitude, setMaxAltitude] = useState(permission?.maxAltitude ?? 120);
  const [conditions, setConditions] = useState(permission?.conditions ?? "");
  const [coordinationContacts, setCoordinationContacts] = useState(permission?.coordinationContacts ?? "");
  const [notes, setNotes] = useState(permission?.notes ?? "");

  // Polygon coordinates
  const [coordinates, setCoordinates] = useState<FlightPermissionCoordinate[]>(
    permission?.polygonCoordinates ?? []
  );
  const [newLat, setNewLat] = useState("");
  const [newLng, setNewLng] = useState("");

  const addCoordinate = () => {
    const lat = parseFloat(newLat);
    const lng = parseFloat(newLng);
    if (isNaN(lat) || isNaN(lng)) return;
    setCoordinates([...coordinates, { lat, lng }]);
    setNewLat("");
    setNewLng("");
  };

  const removeCoordinate = (index: number) => {
    setCoordinates(coordinates.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!startDate || !endDate) return;
    if (endDate < startDate) {
      toast("Bitiş tarihi başlangıç tarihinden sonra olmalı", "error");
      return;
    }
    onSave({
      operationId: operationId || undefined,
      hsdNumber: hsdNumber || undefined,
      status,
      startDate,
      endDate,
      maxAltitude: maxAltitude || undefined,
      zoneType: "polygon" as const,
      polygonCoordinates: coordinates,
      conditions: conditions || undefined,
      coordinationContacts: coordinationContacts || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">HSD Belge No</label>
          <input type="text" value={hsdNumber} onChange={(e) => setHsdNumber(e.target.value)} className={inputClass} placeholder={`HSD-${new Date().getFullYear()}-...`} />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Durum</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as PermissionStatus)} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{PERMISSION_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">Bağlı Operasyon</label>
        <select value={operationId} onChange={(e) => setOperationId(e.target.value)} className={inputClass}>
          <option value="">Bağımsız</option>
          {operations.map((op) => (
            <option key={op.id} value={op.id}>{op.title}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Başlangıç Tarihi *</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Bitiş Tarihi *</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">Max Uçuş Yüksekliği (m AGL)</label>
        <input type="number" value={maxAltitude} onChange={(e) => setMaxAltitude(Number(e.target.value))} className={inputClass} min={0} />
      </div>

      {/* Poligon Koordinatları */}
      <div>
        <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2 pt-2 border-t border-[var(--border)]">
          İzin Bölgesi Köşe Koordinatları
        </h4>

        {coordinates.length > 0 && (
          <div className="space-y-1 mb-3">
            {coordinates.map((coord, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded bg-[var(--background)] text-sm">
                <span className="text-[var(--foreground)] font-mono">
                  {i + 1}. {coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}
                </span>
                <button onClick={() => removeCoordinate(i)} className="text-red-500 text-xs hover:bg-red-500/10 px-1.5 py-0.5 rounded">×</button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Enlem</label>
            <input type="text" value={newLat} onChange={(e) => setNewLat(e.target.value)} className={inputClass} placeholder="40.1885" />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Boylam</label>
            <input type="text" value={newLng} onChange={(e) => setNewLng(e.target.value)} className={inputClass} placeholder="29.0610" />
          </div>
          <Button variant="ghost" size="sm" onClick={addCoordinate} disabled={!newLat || !newLng}>+</Button>
        </div>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          HSD belgesindeki köşe koordinatlarını sırayla girin ({coordinates.length} nokta)
        </p>

        {coordinates.length >= 2 && (
          <div className="mt-3">
            <MapPolygon coordinates={coordinates} className="h-36 sm:h-48 w-full rounded-lg" />
          </div>
        )}
      </div>

      {/* Koordinasyon */}
      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">Koordinasyon İrtibat</label>
        <textarea value={coordinationContacts} onChange={(e) => setCoordinationContacts(e.target.value)} className={`${inputClass} h-16 resize-none`} placeholder="Uçuş öncesi aranması gereken kişi/kurumlar" />
      </div>

      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">İzin Koşulları</label>
        <textarea value={conditions} onChange={(e) => setConditions(e.target.value)} className={`${inputClass} h-16 resize-none`} placeholder="SHGM'nin belirttiği koşullar" />
      </div>

      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">Notlar</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} h-12 resize-none`} />
      </div>

      <div className="flex gap-2 pt-2 sticky bottom-0 bg-[var(--surface)] py-3">
        <Button onClick={handleSubmit} disabled={!startDate || !endDate}>
          {permission ? "Güncelle" : "Kaydet"}
        </Button>
        <Button variant="ghost" onClick={onCancel}>İptal</Button>
      </div>
    </div>
  );
}
