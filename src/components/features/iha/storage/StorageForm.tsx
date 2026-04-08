"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { StorageUnit, StorageType } from "@/types/iha";
import { STORAGE_TYPE_LABELS } from "@/types/iha";
import { inputClass } from "../shared/styles";

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
      {/* Backend'de var, UI'da yoktu */}
      <div className="ring-2 ring-red-500 rounded-lg p-3 space-y-3">
        <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">Depolama Detayları</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Ad</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Tip</label>
            <select value={type} onChange={(e) => setType(e.target.value as StorageType)} className={inputClass}>
              {(Object.entries(STORAGE_TYPE_LABELS) as [StorageType, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Toplam Kapasite (TB)</label>
          <input type="number" value={totalCapacityTB} onChange={(e) => setTotalCapacityTB(Number(e.target.value))} className={inputClass} min={0} step={0.1} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">IP Adresi</label>
            <input type="text" value={ip} onChange={(e) => setIp(e.target.value)} className={inputClass} placeholder="192.168.1.100" />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Mount Path</label>
            <input type="text" value={mountPath} onChange={(e) => setMountPath(e.target.value)} className={inputClass} placeholder="/mnt/data" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Yol (Path)</label>
          <input type="text" value={path} onChange={(e) => setPath(e.target.value)} className={inputClass} placeholder="\\\\server\\share" />
        </div>
      </div>

      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">
          Kullanılan Alan (TB)
        </label>
        <input
          type="number"
          value={usedCapacity}
          onChange={(e) => setUsedCapacity(Number(e.target.value))}
          className={inputClass}
          min={0}
          max={storage.totalCapacityTB}
          step={0.1}
        />
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          Toplam: {storage.totalCapacityTB} TB
        </p>
      </div>

      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">Notlar</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={`${inputClass} h-16 resize-none`}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit">Kaydet</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>İptal</Button>
      </div>
    </form>
  );
}
