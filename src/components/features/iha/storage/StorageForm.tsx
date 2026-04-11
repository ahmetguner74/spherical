"use client";

import { useState } from "react";
import { Button, FormInput, FormSelect, FormTextarea } from "@/components/ui";
import type { StorageUnit, StorageType } from "@/types/iha";
import { STORAGE_TYPE_LABELS } from "@/types/iha";

interface StorageFormProps {
  storage: StorageUnit;
  onSave: (updates: Partial<StorageUnit>) => void;
  onCancel: () => void;
}

export function StorageForm({ storage, onSave, onCancel }: StorageFormProps) {
  const [usedCapacity, setUsedCapacity] = useState(storage.usedCapacityTB);
  const [notes, setNotes] = useState(storage.notes ?? "");
  const [name, setName] = useState(storage.name ?? "");
  const [type, setType] = useState<StorageType>(storage.type ?? "sunucu");
  const [totalCapacityTB, setTotalCapacityTB] = useState(storage.totalCapacityTB);
  const [ip, setIp] = useState(storage.ip ?? "");
  const [mountPath, setMountPath] = useState(storage.mountPath ?? "");
  const [path, setPath] = useState(storage.path ?? "");

  const handleSubmit = () => {
    onSave({
      name: name || undefined,
      type,
      totalCapacityTB,
      usedCapacityTB: usedCapacity,
      ip: ip || undefined,
      mountPath: mountPath || undefined,
      path: path || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
      <div className="rounded-lg p-3 space-y-3 border border-[var(--border)]">
        <p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Depolama Detayları</p>
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="Ad"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <FormSelect
            label="Tip"
            value={type}
            onChange={(e) => setType(e.target.value as StorageType)}
          >
            {(Object.entries(STORAGE_TYPE_LABELS) as [StorageType, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </FormSelect>
        </div>
        <FormInput
          label="Toplam Kapasite (TB)"
          type="number"
          value={totalCapacityTB}
          onChange={(e) => setTotalCapacityTB(Number(e.target.value))}
          min={0}
          step={0.1}
        />
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="IP Adresi"
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="192.168.1.100"
          />
          <FormInput
            label="Mount Path"
            type="text"
            value={mountPath}
            onChange={(e) => setMountPath(e.target.value)}
            placeholder="/mnt/data"
          />
        </div>
        <FormInput
          label="Yol (Path)"
          type="text"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="\\\\server\\share"
        />
      </div>

      <FormInput
        label="Kullanılan Alan (TB)"
        type="number"
        value={usedCapacity}
        onChange={(e) => setUsedCapacity(Number(e.target.value))}
        min={0}
        max={storage.totalCapacityTB}
        step={0.1}
        hint={`Toplam: ${storage.totalCapacityTB} TB`}
      />

      <FormTextarea
        label="Notlar"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
      />

      <div className="flex gap-2 pt-2">
        <Button type="submit">Kaydet</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>İptal</Button>
      </div>
    </form>
  );
}
