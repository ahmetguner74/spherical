"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { inputClass } from "../shared/styles";
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

  const labelClass = "block text-xs text-[var(--muted-foreground)] mb-1";

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
            className="text-xs text-[var(--accent)] hover:underline"
          >
            {uploading ? "Yükleniyor..." : "Fotoğraf Yükle"}
          </button>
          {profilePhotoUrl && (
            <button
              type="button"
              onClick={() => setProfilePhotoUrl("")}
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
        <div>
          <label className={labelClass}>Ad Soyad <span className="text-red-400">*</span></label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>TC Kimlik No</label>
          <input type="text" value={tcKimlikNo} onChange={(e) => setTcKimlikNo(e.target.value)} className={inputClass} maxLength={11} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Doğum Tarihi</label>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Meslek</label>
          <input type="text" value={profession} onChange={(e) => setProfession(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Telefon</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>E-posta</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Adres</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={2}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Durum</label>
        <select value={status} onChange={(e) => setStatus(e.target.value as PersonnelStatus)} className={inputClass}>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {status === "izinli" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>İzin Başlangıcı</label>
            <input type="date" value={leaveStart} onChange={(e) => setLeaveStart(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>İzin Bitişi</label>
            <input type="date" value={leaveEnd} onChange={(e) => setLeaveEnd(e.target.value)} className={inputClass} />
          </div>
        </div>
      )}

      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={hasLicense}
            onChange={(e) => setHasLicense(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-[var(--foreground)]">Pilot Lisansı Var</span>
        </label>

        {hasLicense && (
          <div className="space-y-3 pl-6">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Sınıf</label>
                <select value={licenseClass} onChange={(e) => setLicenseClass(e.target.value as PilotLicenseClass)} className={inputClass}>
                  {LICENSE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Belge No</label>
                <input type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Geçerlilik Tarihi</label>
                <input type="date" value={licenseExpiry} onChange={(e) => setLicenseExpiry(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Lisans Belgesi</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => licenseDocRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-1.5 text-xs rounded-md border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface)] transition-colors"
                >
                  {uploading ? "Yükleniyor..." : "Belge Yükle"}
                </button>
                {licenseDocUrl && (
                  <>
                    <a href={licenseDocUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--accent)] hover:underline">
                      Görüntüle
                    </a>
                    <button type="button" onClick={() => setLicenseDocUrl("")} className="text-xs text-red-400 hover:underline">
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
