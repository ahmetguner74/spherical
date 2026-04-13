"use client";

import { FormInput, FormSelect } from "@/components/ui";
import { metersToFeet, feetToMeters } from "@/lib/coordinates";
import type { FlightPurpose, PermissionStatus } from "@/types/iha";
import { PERMISSION_STATUS_LABELS } from "@/types/iha";

const STATUSES: PermissionStatus[] = ["taslak", "gonderildi", "beklemede", "onaylandi", "reddedildi", "suresi_doldu"];

interface FlightInfoSectionProps {
  status: PermissionStatus;
  hsdNumber: string;
  flightPurpose: string;
  startDate: string;
  endDate: string;
  startTimeUtc: string;
  endTimeUtc: string;
  altitudeFeet: number;
  altitudeMeters: number;
  onUpdate: (field: string, value: string | number) => void;
}

export function FlightInfoSection({
  status, hsdNumber, flightPurpose,
  startDate, endDate, startTimeUtc, endTimeUtc,
  altitudeFeet, altitudeMeters,
  onUpdate,
}: FlightInfoSectionProps) {
  const handleMetersChange = (m: number) => {
    onUpdate("altitudeMeters", m);
    onUpdate("altitudeFeet", metersToFeet(m));
  };

  const handleFeetChange = (ft: number) => {
    onUpdate("altitudeFeet", ft);
    onUpdate("altitudeMeters", feetToMeters(ft));
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Durum" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormSelect label="Durum" value={status} onChange={(e) => onUpdate("status", e.target.value)}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{PERMISSION_STATUS_LABELS[s]}</option>
          ))}
        </FormSelect>
        <FormInput label="HSD Belge No" value={hsdNumber} onChange={(e) => onUpdate("hsdNumber", e.target.value)} placeholder="Onay sonrası girilir" />
      </div>

      <SectionHeader title="Uçuş Bilgileri" />
      <FormSelect
        label="Uçuş Amacı"
        value={flightPurpose}
        onChange={(e) => onUpdate("flightPurpose", e.target.value)}
      >
        <option value="">Seçiniz</option>
        <option value="ticari">Ticari</option>
        <option value="arge">Ar-Ge</option>
      </FormSelect>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormInput label="Başlangıç Tarihi *" required type="date" value={startDate} onChange={(e) => onUpdate("startDate", e.target.value)} />
        <FormInput label="Bitiş Tarihi *" required type="date" value={endDate} onChange={(e) => onUpdate("endDate", e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormInput label="Başlangıç Saati (UTC)" type="time" value={startTimeUtc} onChange={(e) => onUpdate("startTimeUtc", e.target.value)} />
        <FormInput label="Bitiş Saati (UTC)" type="time" value={endTimeUtc} onChange={(e) => onUpdate("endTimeUtc", e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormInput label="İrtifa (Feet/MSL)" type="number" value={altitudeFeet} onChange={(e) => handleFeetChange(Number(e.target.value))} min={0} />
        <FormInput label="İrtifa (Metre/MSL)" type="number" value={altitudeMeters} onChange={(e) => handleMetersChange(Number(e.target.value))} min={0} />
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="pt-2 border-t border-[var(--border)]">
      <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">{title}</h4>
    </div>
  );
}
