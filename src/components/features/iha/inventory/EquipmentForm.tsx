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

interface FormState {
  name: string;
  model: string;
  serialNumber: string;
  registrationNo: string;
  insurancePolicyNo: string;
  category: EquipmentCategory;
  status: EquipmentStatus;
  ownership: OwnershipType;
  currentHolder: string;
  insuranceExpiry: string;
  notes: string;
  flightHours: number;
  batteryCount: number;
  condition: EquipmentCondition;
  purchaseDate: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  firmwareVersion: string;
  lastCalibration: string;
  nextCalibration: string;
  accessories: string;
  totalBatteryCycles: number;
  extraField: string;
}

function initForm(eq?: Equipment): FormState {
  return {
    name: eq?.name ?? "",
    model: eq?.model ?? "",
    serialNumber: eq?.serialNumber ?? "",
    registrationNo: eq?.registrationNo ?? "",
    insurancePolicyNo: eq?.insurancePolicyNo ?? "",
    category: eq?.category ?? "drone",
    status: eq?.status ?? "musait",
    ownership: eq?.ownership ?? "sahip",
    currentHolder: eq?.currentHolder ?? "",
    insuranceExpiry: eq?.insuranceExpiry ?? "",
    notes: eq?.notes ?? "",
    flightHours: eq?.flightHours ?? 0,
    batteryCount: eq?.batteryCount ?? 0,
    condition: eq?.condition ?? "iyi",
    purchaseDate: eq?.purchaseDate ?? "",
    lastMaintenanceDate: eq?.lastMaintenanceDate ?? "",
    nextMaintenanceDate: eq?.nextMaintenanceDate ?? "",
    firmwareVersion: eq?.firmwareVersion ?? "",
    lastCalibration: eq?.lastCalibration ?? "",
    nextCalibration: eq?.nextCalibration ?? "",
    accessories: eq?.accessories?.join(", ") ?? "",
    totalBatteryCycles: eq?.totalBatteryCycles ?? 0,
    extraField: eq?.extraField ?? "",
  };
}

function validateForm(f: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!f.name.trim()) errors.name = "Ad zorunludur";

  if (f.registrationNo && !/^TR-IHA\d-\d{4,}$/i.test(f.registrationNo)) {
    errors.registrationNo = "Format: TR-IHA1-000560";
  }
  if (f.insurancePolicyNo && !/^\d+$/.test(f.insurancePolicyNo)) {
    errors.insurancePolicyNo = "Sadece rakam giriniz";
  }

  const today = new Date().toISOString().split("T")[0];
  if (f.purchaseDate && f.purchaseDate > today) errors.purchaseDate = "Gelecek tarih girilemez";
  if (f.lastMaintenanceDate && f.lastMaintenanceDate > today) errors.lastMaintenanceDate = "Gelecek tarih girilemez";
  if (f.lastCalibration && f.lastCalibration > today) errors.lastCalibration = "Gelecek tarih girilemez";
  if (f.nextMaintenanceDate && f.nextMaintenanceDate < today) errors.nextMaintenanceDate = "Geçmiş tarih girilemez";
  if (f.nextCalibration && f.nextCalibration < today) errors.nextCalibration = "Geçmiş tarih girilemez";

  return errors;
}

export function EquipmentForm({ equipment, onSave, onCancel }: EquipmentFormProps) {
  const [f, setF] = useState<FormState>(() => initForm(equipment));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setF((prev) => ({ ...prev, [key]: value }));

  const isDrone = f.category === "drone";

  const handleSubmit = () => {
    const errs = validateForm(f);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onSave({
      name: f.name.trim(),
      model: f.model.trim(),
      serialNumber: f.serialNumber || undefined,
      registrationNo: f.registrationNo || undefined,
      insurancePolicyNo: f.insurancePolicyNo || undefined,
      category: f.category,
      status: f.status,
      ownership: f.ownership,
      currentHolder: f.currentHolder || undefined,
      insuranceExpiry: f.insuranceExpiry || undefined,
      notes: f.notes || undefined,
      condition: f.condition,
      purchaseDate: f.purchaseDate || undefined,
      lastMaintenanceDate: f.lastMaintenanceDate || undefined,
      nextMaintenanceDate: f.nextMaintenanceDate || undefined,
      firmwareVersion: f.firmwareVersion || undefined,
      lastCalibration: f.lastCalibration || undefined,
      nextCalibration: f.nextCalibration || undefined,
      accessories: f.accessories ? f.accessories.split(",").map((a) => a.trim()).filter(Boolean) : undefined,
      totalBatteryCycles: f.totalBatteryCycles || undefined,
      flightHours: isDrone ? f.flightHours : undefined,
      batteryCount: isDrone ? f.batteryCount : undefined,
      extraField: f.extraField || undefined,
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput label="Ad" required type="text" value={f.name} error={errors.name}
          onChange={(e) => set("name", e.target.value)} />
        <FormInput label="Model" type="text" value={f.model}
          onChange={(e) => set("model", e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormSelect label="Kategori" value={f.category}
          onChange={(e) => set("category", e.target.value as EquipmentCategory)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{EQUIPMENT_CATEGORY_LABELS[c]}</option>)}
        </FormSelect>
        <FormSelect label="Durum" value={f.status}
          onChange={(e) => set("status", e.target.value as EquipmentStatus)}>
          {STATUSES.map((s) => <option key={s} value={s}>{EQUIPMENT_STATUS_LABELS[s]}</option>)}
        </FormSelect>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormSelect label="Sahiplik" value={f.ownership}
          onChange={(e) => set("ownership", e.target.value as OwnershipType)}>
          <option value="sahip">Kendi</option>
          <option value="odunc">Ödünç</option>
        </FormSelect>
        <FormInput label="Seri No" type="text" value={f.serialNumber}
          onChange={(e) => set("serialNumber", e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput label="SHGM Kayıt No" type="text" value={f.registrationNo} error={errors.registrationNo}
          onChange={(e) => set("registrationNo", e.target.value)} placeholder="TR-IHA1-000560" />
        <FormInput label="Elinde Olan" type="text" value={f.currentHolder}
          onChange={(e) => set("currentHolder", e.target.value)} placeholder="Kişi adı" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput label="Sigorta Poliçe No" type="text" value={f.insurancePolicyNo} error={errors.insurancePolicyNo}
          onChange={(e) => set("insurancePolicyNo", e.target.value)} placeholder="100000032207009" />
        <FormInput label="Sigorta Bitiş" type="date" value={f.insuranceExpiry}
          onChange={(e) => set("insuranceExpiry", e.target.value)} />
      </div>

      {isDrone && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput label="Uçuş Saati" type="number" value={f.flightHours} min={0}
            onChange={(e) => set("flightHours", Number(e.target.value))} />
          <FormInput label="Batarya Sayısı" type="number" value={f.batteryCount} min={0}
            onChange={(e) => set("batteryCount", Number(e.target.value))} />
        </div>
      )}

      <div className="rounded-lg p-3 space-y-4 border border-[var(--border)]">
        <p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Ek Ekipman Bilgileri</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect label="Fiziksel Durum" value={f.condition}
            onChange={(e) => set("condition", e.target.value as EquipmentCondition)}>
            {(Object.entries(EQUIPMENT_CONDITION_LABELS) as [EquipmentCondition, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </FormSelect>
          <FormInput label="Satın Alma Tarihi" type="date" value={f.purchaseDate} error={errors.purchaseDate}
            onChange={(e) => set("purchaseDate", e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput label="Son Bakım" type="date" value={f.lastMaintenanceDate} error={errors.lastMaintenanceDate}
            onChange={(e) => set("lastMaintenanceDate", e.target.value)} />
          <FormInput label="Sonraki Bakım" type="date" value={f.nextMaintenanceDate} error={errors.nextMaintenanceDate}
            onChange={(e) => set("nextMaintenanceDate", e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput label="Firmware Versiyon" type="text" value={f.firmwareVersion}
            onChange={(e) => set("firmwareVersion", e.target.value)} placeholder="v1.2.3" />
          <FormInput label="Toplam Batarya Döngüsü" type="number" value={f.totalBatteryCycles} min={0}
            onChange={(e) => set("totalBatteryCycles", Number(e.target.value))} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput label="Son Kalibrasyon" type="date" value={f.lastCalibration} error={errors.lastCalibration}
            onChange={(e) => set("lastCalibration", e.target.value)} />
          <FormInput label="Sonraki Kalibrasyon" type="date" value={f.nextCalibration} error={errors.nextCalibration}
            onChange={(e) => set("nextCalibration", e.target.value)} />
        </div>
        <FormInput label="Aksesuarlar (virgülle ayır)" type="text" value={f.accessories}
          onChange={(e) => set("accessories", e.target.value)} placeholder="Batarya, Pervane, Şarj cihazı" />
      </div>

      <FormInput label="Ek Bilgi" type="text" value={f.extraField}
        onChange={(e) => set("extraField", e.target.value)} placeholder="Sonradan eklenecek bilgiler için" />

      <FormTextarea label="Notlar" value={f.notes}
        onChange={(e) => set("notes", e.target.value)} rows={3} />

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={!f.name.trim()}>
          {equipment ? "Güncelle" : "Ekle"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>İptal</Button>
      </div>
    </form>
  );
}
