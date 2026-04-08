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
  const [installedOn, setInstalledOn] = useState(software?.installedOn?.join(", ") ?? "");
  const [notes, setNotes] = useState(software?.notes ?? "");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      version: version || undefined,
      licenseType,
      licenseExpiry: licenseExpiry || undefined,
      installedOn: installedOn ? installedOn.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      notes: notes || undefined,
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
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

      {/* Backend'de var, UI'da yoktu */}
      <div className="ring-2 ring-red-500 rounded-lg p-3 space-y-3">
        <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">Kurulum Bilgisi</p>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Yüklü Olduğu Bilgisayarlar (virgülle ayır)</label>
          <input type="text" value={installedOn} onChange={(e) => setInstalledOn(e.target.value)} className={inputClass} placeholder="İş İstasyonu 1, İş İstasyonu 2" />
        </div>
      </div>

      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">Notlar</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} h-16 resize-none`} />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={!name.trim()}>
          {software ? "Güncelle" : "Ekle"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>İptal</Button>
      </div>
    </form>
  );
}
