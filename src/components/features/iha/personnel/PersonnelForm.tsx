"use client";

import { useState, useRef } from "react";
import { Button, FormInput, FormSelect, FormTextarea, FormCheckbox } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import type { TeamMember, PersonnelStatus, PilotLicenseClass } from "@/types/iha";

const STATUS_OPTIONS: { value: PersonnelStatus; label: string }[] = [
  { value: "aktif", label: "Aktif" },
  { value: "izinli", label: "İzinli" },
  { value: "pasif", label: "Pasif" },
];

const LICENSE_OPTIONS: { value: PilotLicenseClass; label: string }[] = [
  { value: "IHA-0", label: "IHA-0" },
  { value: "IHA-1", label: "IHA-1" },
  { value: "IHA-2", label: "IHA-2" },
  { value: "IHA-3", label: "IHA-3" },
];

interface PersonnelFormProps {
  member?: TeamMember;
  onSave: (updates: Partial<TeamMember>) => void;
  onCancel: () => void;
}

async function uploadFile(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("iha-files").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("iha-files").getPublicUrl(path);
  return data.publicUrl;
}

export function PersonnelForm({ member, onSave, onCancel }: PersonnelFormProps) {
  const [name, setName] = useState(member?.name ?? "");
  const [tcKimlikNo, setTcKimlikNo] = useState(member?.tcKimlikNo ?? "");
  const [birthDate, setBirthDate] = useState(member?.birthDate ?? "");
  const [phone, setPhone] = useState(member?.phone ?? "");
  const [email, setEmail] = useState(member?.email ?? "");
  const [address, setAddress] = useState(member?.address ?? "");
  const [profession, setProfession] = useState(member?.profession ?? "");
  const [status, setStatus] = useState<PersonnelStatus>(member?.status ?? "aktif");
  const [leaveStart, setLeaveStart] = useState(member?.leaveStart ?? "");
  const [leaveEnd, setLeaveEnd] = useState(member?.leaveEnd ?? "");
  const [hasLicense, setHasLicense] = useState(!!member?.pilotLicense);
  const [licenseClass, setLicenseClass] = useState<PilotLicenseClass>(
    member?.pilotLicense?.licenseClass ?? "IHA-0"
  );
  const [licenseNumber, setLicenseNumber] = useState(member?.pilotLicense?.licenseNumber ?? "");
  const [licenseExpiry, setLicenseExpiry] = useState(member?.pilotLicense?.expiryDate ?? "");
  const [licenseDocUrl, setLicenseDocUrl] = useState(member?.pilotLicense?.documentUrl ?? "");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(member?.profilePhotoUrl ?? "");
  const [uploading, setUploading] = useState(false);

  const photoRef = useRef<HTMLInputElement>(null);
  const licenseDocRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadFile(file, "profile-photos");
      setProfilePhotoUrl(url);
    } catch { /* ignore */ }
    setUploading(false);
  };

  const handleLicenseDocUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadFile(file, "license-docs");
      setLicenseDocUrl(url);
    } catch { /* ignore */ }
    setUploading(false);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      tcKimlikNo: tcKimlikNo || undefined,
      birthDate: birthDate || undefined,
      phone: phone || undefined,
      email: email || undefined,
      address: address || undefined,
      profession: profession || undefined,
      status,
      leaveStart: status === "izinli" ? leaveStart || undefined : undefined,
      leaveEnd: status === "izinli" ? leaveEnd || undefined : undefined,
      profilePhotoUrl: profilePhotoUrl || undefined,
      pilotLicense: hasLicense
        ? {
            licenseClass,
            licenseNumber: licenseNumber || undefined,
            expiryDate: licenseExpiry || undefined,
            documentUrl: licenseDocUrl || undefined,
          }
        : undefined,
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
      {/* Profil Fotoğrafı */}
      <div className="flex items-center gap-4">
        <div
          onClick={() => photoRef.current?.click()}
          className="w-16 h-16 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-bold text-2xl cursor-pointer hover:bg-[var(--accent)]/20 transition-colors overflow-hidden flex-shrink-0"
        >
          {profilePhotoUrl ? (
            <img src={profilePhotoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            name.charAt(0) || "?"
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => photoRef.current?.click()}
            disabled={uploading}
            aria-label="Profil fotoğrafı yükle"
            className="text-xs text-[var(--accent)] hover:underline"
          >
            {uploading ? "Yükleniyor..." : "Fotoğraf Yükle"}
          </button>
          {profilePhotoUrl && (
            <button
              type="button"
              onClick={() => setProfilePhotoUrl("")}
              aria-label="Profil fotoğrafını kaldır"
              className="text-xs text-red-400 hover:underline ml-3"
            >
              Kaldır
            </button>
          )}
        </div>
        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Ad Soyad"
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FormInput
          label="TC Kimlik No"
          type="text"
          value={tcKimlikNo}
          onChange={(e) => setTcKimlikNo(e.target.value)}
          maxLength={11}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Doğum Tarihi"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
        <FormInput
          label="Meslek"
          type="text"
          value={profession}
          onChange={(e) => setProfession(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Telefon"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <FormInput
          label="E-posta"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <FormTextarea
        label="Adres"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        rows={2}
      />

      <FormSelect
        label="Durum"
        value={status}
        onChange={(e) => setStatus(e.target.value as PersonnelStatus)}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </FormSelect>

      {status === "izinli" && (
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="İzin Başlangıcı"
            type="date"
            value={leaveStart}
            onChange={(e) => setLeaveStart(e.target.value)}
          />
          <FormInput
            label="İzin Bitişi"
            type="date"
            value={leaveEnd}
            onChange={(e) => setLeaveEnd(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-3">
        <FormCheckbox
          label="Pilot Lisansı Var"
          checked={hasLicense}
          onChange={(e) => setHasLicense(e.target.checked)}
        />

        {hasLicense && (
          <div className="space-y-3 pl-6">
            <div className="grid grid-cols-3 gap-3">
              <FormSelect
                label="Sınıf"
                value={licenseClass}
                onChange={(e) => setLicenseClass(e.target.value as PilotLicenseClass)}
              >
                {LICENSE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </FormSelect>
              <FormInput
                label="Belge No"
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
              />
              <FormInput
                label="Geçerlilik Tarihi"
                type="date"
                value={licenseExpiry}
                onChange={(e) => setLicenseExpiry(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">Lisans Belgesi</label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => licenseDocRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Yükleniyor..." : "Belge Yükle"}
                </Button>
                {licenseDocUrl && (
                  <>
                    <a href={licenseDocUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--accent)] hover:underline">
                      Görüntüle
                    </a>
                    <button
                      type="button"
                      onClick={() => setLicenseDocUrl("")}
                      aria-label="Lisans belgesini kaldır"
                      className="text-xs text-red-400 hover:underline"
                    >
                      Kaldır
                    </button>
                  </>
                )}
              </div>
              <input
                ref={licenseDocRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleLicenseDocUpload(e.target.files[0])}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={!name.trim() || uploading}>Kaydet</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>İptal</Button>
      </div>
    </form>
  );
}
