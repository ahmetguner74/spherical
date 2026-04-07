"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { StorageUnit } from "@/types/iha";
import { inputClass } from "../shared/styles";

interface StorageFormProps {
  storage: StorageUnit;
  onSave: (updates: Partial<StorageUnit>) => void;
  onCancel: () => void;
}

export function StorageForm({ storage, onSave, onCancel }: StorageFormProps) {
  const [usedCapacity, setUsedCapacity] = useState(storage.usedCapacityTB);
  const [notes, setNotes] = useState(storage.notes ?? "");

  const handleSubmit = () => {
    onSave({
      usedCapacityTB: usedCapacity,
      notes: notes || undefined,
    });
  };

  return (
    <div className="space-y-4">
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
        <Button onClick={handleSubmit}>Kaydet</Button>
        <Button variant="ghost" onClick={onCancel}>İptal</Button>
      </div>
    </div>
  );
}
