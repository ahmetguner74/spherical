"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Software, SoftwareLicenseType } from "@/types/iha";
import { inputClass } from "../shared/styles";

interface SoftwareFormProps {
  software?: Software;
  onSave: (data: Omit<Software, "id">) => void;
  onCancel: () => void;
}

export function SoftwareForm({ software, onSave, onCancel }: SoftwareFormProps) {
  const [name, setName] = useState(software?.name ?? "");
  const [version, setVersion] = useState(software?.version ?? "");
  const [licenseType, setLicenseType] = useState<SoftwareLicenseType>(
    software?.licenseType ?? "perpetual"
  );
  const [licenseExpiry, setLicenseExpiry] = useState(software?.licenseExpiry ?? "");
  const [notes, setNotes] = useState(software?.notes ?? "");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      version: version || undefined,
      licenseType,
      licenseExpiry: licenseExpiry || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">Ad *</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Versiyon</label>
          <input type="text" value={version} onChange={(e) => setVersion(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Lisans Tipi</label>
          <select value={licenseType} onChange={(e) => setLicenseType(e.target.value as SoftwareLicenseType)} className={inputClass}>
            <option value="perpetual">Kalıcı</option>
            <option value="subscription">Abonelik</option>
            <option value="free">Ücretsiz</option>
          </select>
        </div>
      </div>

      {licenseType !== "free" && (
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Lisans Bitiş</label>
          <input type="date" value={licenseExpiry} onChange={(e) => setLicenseExpiry(e.target.value)} className={inputClass} />
        </div>
      )}

      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">Notlar</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} h-16 resize-none`} />
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleSubmit} disabled={!name.trim()}>
          {software ? "Güncelle" : "Ekle"}
        </Button>
        <Button variant="ghost" onClick={onCancel}>İptal</Button>
      </div>
    </div>
  );
}
