"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Equipment, EquipmentCategory, EquipmentStatus, OwnershipType, EquipmentCondition } from "@/types/iha";
import { EQUIPMENT_CATEGORY_LABELS, EQUIPMENT_STATUS_LABELS, EQUIPMENT_CONDITION_LABELS } from "@/types/iha";
import { inputClass } from "../shared/styles";

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
  const [condition, setCondition] = useState<EquipmentCondition>(equipment?.condition ?? "iyi");
  const [purchaseDate, setPurchaseDate] = useState(equipment?.purchaseDate ?? "");
  const [lastMaintenanceDate, setLastMaintenanceDate] = useState(equipment?.lastMaintenanceDate ?? "");
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState(equipment?.nextMaintenanceDate ?? "");
  const [firmwareVersion, setFirmwareVersion] = useState(equipment?.firmwareVersion ?? "");
  const [lastCalibration, setLastCalibration] = useState(equipment?.lastCalibration ?? "");
  const [nextCalibration, setNextCalibration] = useState(equipment?.nextCalibration ?? "");
  const [accessories, setAccessories] = useState(equipment?.accessories?.join(", ") ?? "");
  const [totalBatteryCycles, setTotalBatteryCycles] = useState(equipment?.totalBatteryCycles ?? 0);

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
      condition,
      purchaseDate: purchaseDate || undefined,
      lastMaintenanceDate: lastMaintenanceDate || undefined,
      nextMaintenanceDate: nextMaintenanceDate || undefined,
      firmwareVersion: firmwareVersion || undefined,
      lastCalibration: lastCalibration || undefined,
      nextCalibration: nextCalibration || undefined,
      accessories: accessories ? accessories.split(",").map((a) => a.trim()).filter(Boolean) : undefined,
      totalBatteryCycles: totalBatteryCycles || undefined,
      flightHours: isDrone ? flightHours : undefined,
      batteryCount: isDrone ? batteryCount : undefined,
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
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

      {/* Backend'de var, UI'da yoktu */}
      <div className="ring-2 ring-red-500 rounded-lg p-3 space-y-4">
        <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">Ek Ekipman Bilgileri</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Fiziksel Durum</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value as EquipmentCondition)} className={inputClass}>
              {(Object.entries(EQUIPMENT_CONDITION_LABELS) as [EquipmentCondition, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Satın Alma Tarihi</label>
            <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Son Bakım</label>
            <input type="date" value={lastMaintenanceDate} onChange={(e) => setLastMaintenanceDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Sonraki Bakım</label>
            <input type="date" value={nextMaintenanceDate} onChange={(e) => setNextMaintenanceDate(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Firmware Versiyon</label>
            <input type="text" value={firmwareVersion} onChange={(e) => setFirmwareVersion(e.target.value)} className={inputClass} placeholder="v1.2.3" />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Toplam Batarya Döngüsü</label>
            <input type="number" value={totalBatteryCycles} onChange={(e) => setTotalBatteryCycles(Number(e.target.value))} className={inputClass} min={0} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Son Kalibrasyon</label>
            <input type="date" value={lastCalibration} onChange={(e) => setLastCalibration(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Sonraki Kalibrasyon</label>
            <input type="date" value={nextCalibration} onChange={(e) => setNextCalibration(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Aksesuarlar (virgülle ayır)</label>
          <input type="text" value={accessories} onChange={(e) => setAccessories(e.target.value)} className={inputClass} placeholder="Batarya, Pervane, Şarj cihazı" />
        </div>
      </div>

      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">Notlar</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} h-16 resize-none`} />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={!name.trim()}>
          {equipment ? "Güncelle" : "Ekle"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>İptal</Button>
      </div>
    </form>
  );
}
