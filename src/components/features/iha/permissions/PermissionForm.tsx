"use client";

import { useState } from "react";
import { Button, FormInput, FormSelect, FormTextarea } from "@/components/ui";
import { MapPolygon } from "../map";
import { toast } from "@/components/ui/Toast";
import type { FlightPermission, FlightPermissionCoordinate, FlightZoneType, PermissionStatus, Operation } from "@/types/iha";
import { PERMISSION_STATUS_LABELS } from "@/types/iha";
import { LocationPickerModal, type LocationPickerResult } from "../operations/LocationPicker/LocationPickerModal";

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
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const handleLocationSave = (result: LocationPickerResult) => {
    if (result.polygon && result.polygon.length >= 3) {
      setCoordinates(result.polygon);
    }
    // Nokta / çizgi → izin poligonu için uygun değil, yoksay
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
        <FormInput
          label="HSD Belge No"
          type="text"
          value={hsdNumber}
          onChange={(e) => setHsdNumber(e.target.value)}
          placeholder={`HSD-${new Date().getFullYear()}-...`}
        />
        <FormSelect
          label="Durum"
          value={status}
          onChange={(e) => setStatus(e.target.value as PermissionStatus)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{PERMISSION_STATUS_LABELS[s]}</option>
          ))}
        </FormSelect>
      </div>

      <FormSelect
        label="Bağlı Operasyon"
        value={operationId}
        onChange={(e) => setOperationId(e.target.value)}
      >
        <option value="">Bağımsız</option>
        {operations.map((op) => (
          <option key={op.id} value={op.id}>{op.title}</option>
        ))}
      </FormSelect>

      <div className="grid grid-cols-2 gap-3">
        <FormInput
          label="Başlangıç Tarihi"
          required
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <FormInput
          label="Bitiş Tarihi"
          required
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <FormInput
        label="Max Uçuş Yüksekliği (m AGL)"
        type="number"
        value={maxAltitude}
        onChange={(e) => setMaxAltitude(Number(e.target.value))}
        min={0}
      />

      {/* Bölge Tipi */}
      <div className="rounded-lg p-3 space-y-3 border border-[var(--border)]">
        <p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Bölge Tipi</p>
        <div className="flex gap-2">
          {(["polygon", "circle"] as FlightZoneType[]).map((zt) => (
            <button
              key={zt}
              type="button"
              onClick={() => setZoneType(zt)}
              className={`px-4 py-2 rounded-md text-xs font-medium transition-all min-h-[44px] ${
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
            <FormInput
              label="Merkez Enlem"
              type="text"
              value={circleCenterLat}
              onChange={(e) => setCircleCenterLat(e.target.value)}
              placeholder="40.1885"
            />
            <FormInput
              label="Merkez Boylam"
              type="text"
              value={circleCenterLng}
              onChange={(e) => setCircleCenterLng(e.target.value)}
              placeholder="29.0610"
            />
            <FormInput
              label="Yarıçap (m)"
              type="number"
              value={circleRadius}
              onChange={(e) => setCircleRadius(Number(e.target.value))}
              min={0}
            />
          </div>
        )}
      </div>

      {/* Poligon Koordinatları — Konum Seçici modal ile */}
      {zoneType === "polygon" && (
        <div className="pt-2 border-t border-[var(--border)] space-y-2">
          <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
            İzin Bölgesi
          </h4>

          <Button
            type="button"
            variant={coordinates.length >= 3 ? "outline" : "primary"}
            onClick={() => setLocationModalOpen(true)}
            className="w-full justify-start min-h-[44px]"
          >
            📍 {coordinates.length >= 3 ? `Poligonu Değiştir (${coordinates.length} köşe)` : "Haritadan Poligon Çiz"}
          </Button>

          {coordinates.length >= 3 && (
            <>
              <p className="text-xs text-[var(--muted-foreground)]">
                HSD belgesindeki köşe koordinatları. KML/KMZ dosyası da içe aktarabilir veya haritadan yeniden çizebilirsiniz.
              </p>
              <MapPolygon coordinates={coordinates} className="h-36 sm:h-48 w-full rounded-lg" />
            </>
          )}

          {coordinates.length > 0 && coordinates.length < 3 && (
            <p className="text-xs text-red-500">En az 3 köşe gerekli (şu an {coordinates.length})</p>
          )}

          <LocationPickerModal
            open={locationModalOpen}
            onClose={() => setLocationModalOpen(false)}
            onSave={handleLocationSave}
            initialPolygon={coordinates.length >= 3 ? coordinates : undefined}
          />
        </div>
      )}

      {/* Başvuru Bilgileri — backend'de vardı, UI'da yoktu */}
      <div className="rounded-lg p-3 space-y-3 border border-[var(--border)]">
        <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
          Başvuru Bilgileri
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <FormInput
            label="Başvuru Tarihi"
            type="date"
            value={applicationDate}
            onChange={(e) => setApplicationDate(e.target.value)}
          />
          <FormInput
            label="Başvuru Referansı"
            type="text"
            value={applicationRef}
            onChange={(e) => setApplicationRef(e.target.value)}
            placeholder="SHGM-2026-..."
          />
          <FormInput
            label="Sorumlu Kişi"
            type="text"
            value={responsiblePerson}
            onChange={(e) => setResponsiblePerson(e.target.value)}
            placeholder="Ad Soyad"
          />
        </div>
      </div>

      <FormTextarea
        label="Koordinasyon İrtibat"
        value={coordinationContacts}
        onChange={(e) => setCoordinationContacts(e.target.value)}
        rows={3}
        placeholder="Uçuş öncesi aranması gereken kişi/kurumlar"
      />

      <FormTextarea
        label="İzin Koşulları"
        value={conditions}
        onChange={(e) => setConditions(e.target.value)}
        rows={3}
        placeholder="SHGM'nin belirttiği koşullar"
      />

      <FormTextarea
        label="Notlar"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
      />

      <div className="flex gap-2 pt-2 sticky bottom-0 bg-[var(--surface)] py-3">
        <Button type="submit" disabled={!startDate || !endDate}>
          {permission ? "Güncelle" : "Kaydet"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>İptal</Button>
      </div>
    </form>
  );
}
