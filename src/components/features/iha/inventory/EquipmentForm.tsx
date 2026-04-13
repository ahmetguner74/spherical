"use client";

import { useState } from "react";
import { Button, FormInput, FormSelect, FormTextarea } from "@/components/ui";
import type { Equipment, EquipmentCategory, EquipmentStatus, OwnershipType, EquipmentCondition } from "@/types/iha";
import { EQUIPMENT_CATEGORY_LABELS, EQUIPMENT_STATUS_LABELS, EQUIPMENT_CONDITION_LABELS } from "@/types/iha";

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Ad"
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FormInput
          label="Model"
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormSelect
          label="Kategori"
          value={category}
          onChange={(e) => setCategory(e.target.value as EquipmentCategory)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{EQUIPMENT_CATEGORY_LABELS[c]}</option>
          ))}
        </FormSelect>
        <FormSelect
          label="Durum"
          value={status}
          onChange={(e) => setStatus(e.target.value as EquipmentStatus)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{EQUIPMENT_STATUS_LABELS[s]}</option>
          ))}
        </FormSelect>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormSelect
          label="Sahiplik"
          value={ownership}
          onChange={(e) => setOwnership(e.target.value as OwnershipType)}
        >
          <option value="sahip">Kendi</option>
          <option value="odunc">Ödünç</option>
        </FormSelect>
        <FormInput
          label="Seri No"
          type="text"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Elinde Olan"
          type="text"
          value={currentHolder}
          onChange={(e) => setCurrentHolder(e.target.value)}
          placeholder="Kişi adı"
        />
        <FormInput
          label="Sigorta Bitiş"
          type="date"
          value={insuranceExpiry}
          onChange={(e) => setInsuranceExpiry(e.target.value)}
        />
      </div>

      {isDrone && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Uçuş Saati"
            type="number"
            value={flightHours}
            onChange={(e) => setFlightHours(Number(e.target.value))}
            min={0}
          />
          <FormInput
            label="Batarya Sayısı"
            type="number"
            value={batteryCount}
            onChange={(e) => setBatteryCount(Number(e.target.value))}
            min={0}
          />
        </div>
      )}

      <div className="rounded-lg p-3 space-y-4 border border-[var(--border)]">
        <p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Ek Ekipman Bilgileri</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect
            label="Fiziksel Durum"
            value={condition}
            onChange={(e) => setCondition(e.target.value as EquipmentCondition)}
          >
            {(Object.entries(EQUIPMENT_CONDITION_LABELS) as [EquipmentCondition, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </FormSelect>
          <FormInput
            label="Satın Alma Tarihi"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Son Bakım"
            type="date"
            value={lastMaintenanceDate}
            onChange={(e) => setLastMaintenanceDate(e.target.value)}
          />
          <FormInput
            label="Sonraki Bakım"
            type="date"
            value={nextMaintenanceDate}
            onChange={(e) => setNextMaintenanceDate(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Firmware Versiyon"
            type="text"
            value={firmwareVersion}
            onChange={(e) => setFirmwareVersion(e.target.value)}
            placeholder="v1.2.3"
          />
          <FormInput
            label="Toplam Batarya Döngüsü"
            type="number"
            value={totalBatteryCycles}
            onChange={(e) => setTotalBatteryCycles(Number(e.target.value))}
            min={0}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Son Kalibrasyon"
            type="date"
            value={lastCalibration}
            onChange={(e) => setLastCalibration(e.target.value)}
          />
          <FormInput
            label="Sonraki Kalibrasyon"
            type="date"
            value={nextCalibration}
            onChange={(e) => setNextCalibration(e.target.value)}
          />
        </div>
        <FormInput
          label="Aksesuarlar (virgülle ayır)"
          type="text"
          value={accessories}
          onChange={(e) => setAccessories(e.target.value)}
          placeholder="Batarya, Pervane, Şarj cihazı"
        />
      </div>

      <FormTextarea
        label="Notlar"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
      />

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={!name.trim()}>
          {equipment ? "Güncelle" : "Ekle"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>İptal</Button>
      </div>
    </form>
  );
}
