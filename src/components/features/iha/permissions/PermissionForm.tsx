"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { MapPolygon } from "../map";
import { toast } from "@/components/ui/Toast";
import type { FlightPermission, FlightPermissionCoordinate, FlightZoneType, PermissionStatus, Operation } from "@/types/iha";
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
  const [applicationDate, setApplicationDate] = useState(permission?.applicationDate ?? "");
  const [applicationRef, setApplicationRef] = useState(permission?.applicationRef ?? "");
  const [responsiblePerson, setResponsiblePerson] = useState(permission?.responsiblePerson ?? "");
  const [notes, setNotes] = useState(permission?.notes ?? "");
  const [zoneType, setZoneType] = useState<FlightZoneType>(permission?.zoneType ?? "polygon");
  const [circleCenterLat, setCircleCenterLat] = useState(permission?.circleCenter?.lat?.toString() ?? "");
  const [circleCenterLng, setCircleCenterLng] = useState(permission?.circleCenter?.lng?.toString() ?? "");
  const [circleRadius, setCircleRadius] = useState(permission?.circleRadius ?? 0);

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
      zoneType,
      polygonCoordinates: coordinates,
      circleCenter: zoneType === "circle" && circleCenterLat && circleCenterLng
        ? { lat: parseFloat(circleCenterLat), lng: parseFloat(circleCenterLng) }
        : undefined,
      circleRadius: zoneType === "circle" ? circleRadius || undefined : undefined,
      conditions: conditions || undefined,
      coordinationContacts: coordinationContacts || undefined,
      applicationDate: applicationDate || undefined,
      applicationRef: applicationRef || undefined,
      responsiblePerson: responsiblePerson || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
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

      {/* Backend'de var, UI'da yoktu — Bölge Tipi */}
      <div className="ring-2 ring-red-500 rounded-lg p-3 space-y-3">
        <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">Bölge Tipi</p>
        <div className="flex gap-2">
          {(["polygon", "circle"] as FlightZoneType[]).map((zt) => (
            <button
              key={zt}
              type="button"
              onClick={() => setZoneType(zt)}
              className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                zoneType === zt
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--surface)]"
              }`}
            >
              {zt === "polygon" ? "Poligon" : "Daire"}
            </button>
          ))}
        </div>
        {zoneType === "circle" && (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">Merkez Enlem</label>
              <input type="text" value={circleCenterLat} onChange={(e) => setCircleCenterLat(e.target.value)} className={inputClass} placeholder="40.1885" />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">Merkez Boylam</label>
              <input type="text" value={circleCenterLng} onChange={(e) => setCircleCenterLng(e.target.value)} className={inputClass} placeholder="29.0610" />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">Yarıçap (m)</label>
              <input type="number" value={circleRadius} onChange={(e) => setCircleRadius(Number(e.target.value))} className={inputClass} min={0} />
            </div>
          </div>
        )}
      </div>

      {/* Poligon Koordinatları */}
      {zoneType === "polygon" && <div>
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
      </div>}

      {/* 🔴 YENİ: Başvuru Bilgileri — backend'de vardı, UI'da yoktu */}
      <div className="ring-2 ring-red-500 rounded-lg p-3 space-y-3">
        <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider">
          🔴 Başvuru Bilgileri (YENİ)
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Başvuru Tarihi</label>
            <input type="date" value={applicationDate} onChange={(e) => setApplicationDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Başvuru Referansı</label>
            <input type="text" value={applicationRef} onChange={(e) => setApplicationRef(e.target.value)} className={inputClass} placeholder="SHGM-2026-..." />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Sorumlu Kişi</label>
            <input type="text" value={responsiblePerson} onChange={(e) => setResponsiblePerson(e.target.value)} className={inputClass} placeholder="Ad Soyad" />
          </div>
        </div>
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
        <Button type="submit" disabled={!startDate || !endDate}>
          {permission ? "Güncelle" : "Kaydet"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>İptal</Button>
      </div>
    </form>
  );
}
