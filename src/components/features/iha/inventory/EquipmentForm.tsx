"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Equipment, EquipmentCategory, EquipmentStatus, OwnershipType } from "@/types/iha";
import { EQUIPMENT_CATEGORY_LABELS, EQUIPMENT_STATUS_LABELS } from "@/types/iha";

interface EquipmentFormProps {
  equipment?: Equipment;
  onSave: (data: Omit<Equipment, "id">) => void;
  onCancel: () => void;
}

const CATEGORIES: EquipmentCategory[] = [
  "drone", "gps", "kamera", "tarayici", "arac", "bilgisayar", "aksesuar",
];
const STATUSES: EquipmentStatus[] = [
  "musait", "kullanımda", "bakim", "ariza", "odunc",
];

export function EquipmentForm({ equipment, onSave, onCancel }: EquipmentFormProps) {
  const [name, setName] = useState(equipment?.name ?? "");
  const [model, setModel] = useState(equipment?.model ?? "");
  const [serialNumber, setSerialNumber] = useState(equipment?.serialNumber ?? "");
  const [category, setCategory] = useState<EquipmentCategory>(equipment?.category ?? "drone");
  const [status, setStatus] = useState<EquipmentStatus>(equipment?.status ?? "musait");
  const [ownership, setOwnership] = useState<OwnershipType>(equipment?.ownership ?? "sahip");
  const [currentHolder, setCurrentHolder] = useState(equipment?.currentHolder ?? "");
  const [insuranceExpiry, setInsuranceExpiry] = useState(equipment?.insuranceExpiry ?? "");
  const [notes, setNotes] = useState(equipment?.notes ?? "");
  const [flightHours, setFlightHours] = useState(equipment?.flightHours ?? 0);
  const [batteryCount, setBatteryCount] = useState(equipment?.batteryCount ?? 0);

  const inputClass =
    "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";

  const isDrone = category === "drone";

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      model: model.trim(),
      serialNumber: serialNumber || undefined,
      category,
      status,
      ownership,
      currentHolder: currentHolder || undefined,
      insuranceExpiry: insuranceExpiry || undefined,
      notes: notes || undefined,
      flightHours: isDrone ? flightHours : undefined,
      batteryCount: isDrone ? batteryCount : undefined,
      accessories: equipment?.accessories,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Ad *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Model</label>
          <input type="text" value={model} onChange={(e) => setModel(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Kategori</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as EquipmentCategory)} className={inputClass}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{EQUIPMENT_CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Durum</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as EquipmentStatus)} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{EQUIPMENT_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Sahiplik</label>
          <select value={ownership} onChange={(e) => setOwnership(e.target.value as OwnershipType)} className={inputClass}>
            <option value="sahip">Kendi</option>
            <option value="odunc">Ödünç</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Seri No</label>
          <input type="text" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Elinde Olan</label>
          <input type="text" value={currentHolder} onChange={(e) => setCurrentHolder(e.target.value)} className={inputClass} placeholder="Kişi adı" />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Sigorta Bitiş</label>
          <input type="date" value={insuranceExpiry} onChange={(e) => setInsuranceExpiry(e.target.value)} className={inputClass} />
        </div>
      </div>

      {isDrone && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Uçuş Saati</label>
            <input type="number" value={flightHours} onChange={(e) => setFlightHours(Number(e.target.value))} className={inputClass} min={0} />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Batarya Sayısı</label>
            <input type="number" value={batteryCount} onChange={(e) => setBatteryCount(Number(e.target.value))} className={inputClass} min={0} />
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">Notlar</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} h-16 resize-none`} />
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleSubmit} disabled={!name.trim()}>
          {equipment ? "Güncelle" : "Ekle"}
        </Button>
        <Button variant="ghost" onClick={onCancel}>İptal</Button>
      </div>
    </div>
  );
}
