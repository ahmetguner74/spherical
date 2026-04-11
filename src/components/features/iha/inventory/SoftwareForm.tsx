"use client";

import { useState } from "react";
import { Button, FormInput, FormSelect, FormTextarea } from "@/components/ui";
import type { Software, SoftwareLicenseType } from "@/types/iha";

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
      <FormInput
        label="Ad"
        required
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Versiyon"
          type="text"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
        />
        <FormSelect
          label="Lisans Tipi"
          value={licenseType}
          onChange={(e) => setLicenseType(e.target.value as SoftwareLicenseType)}
        >
          <option value="perpetual">Kalıcı</option>
          <option value="subscription">Abonelik</option>
          <option value="free">Ücretsiz</option>
        </FormSelect>
      </div>

      {licenseType !== "free" && (
        <FormInput
          label="Lisans Bitiş"
          type="date"
          value={licenseExpiry}
          onChange={(e) => setLicenseExpiry(e.target.value)}
        />
      )}

      <div className="rounded-lg p-3 space-y-3 border border-[var(--border)]">
        <p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Kurulum Bilgisi</p>
        <FormInput
          label="Yüklü Olduğu Bilgisayarlar (virgülle ayır)"
          type="text"
          value={installedOn}
          onChange={(e) => setInstalledOn(e.target.value)}
          placeholder="İş İstasyonu 1, İş İstasyonu 2"
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
          {software ? "Güncelle" : "Ekle"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>İptal</Button>
      </div>
    </form>
  );
}
