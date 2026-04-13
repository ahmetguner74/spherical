"use client";

import { FormInput, FormSelect } from "@/components/ui";
import type { Equipment, TeamMember } from "@/types/iha";

interface ApplicantSectionProps {
  // Başvuru Sahibi
  applicantOrg: string;
  applicantDepartment: string;
  applicantAddress: string;
  applicantPhone: string;
  applicantEmail: string;
  insurancePolicyNo: string;
  // İHA
  equipmentId: string;
  ihaRegistrationNo: string;
  ihaClass: string;
  // Pilot
  pilotId: string;
  pilotLicenseNo: string;
  // Data
  equipment: Equipment[];
  team: TeamMember[];
  // Setters
  onUpdate: (field: string, value: string) => void;
}

export function ApplicantSection({
  applicantOrg, applicantDepartment, applicantAddress,
  applicantPhone, applicantEmail, insurancePolicyNo,
  equipmentId, ihaRegistrationNo, ihaClass,
  pilotId, pilotLicenseNo,
  equipment, team,
  onUpdate,
}: ApplicantSectionProps) {
  const drones = equipment.filter((e) => e.category === "drone");
  const pilots = team.filter((t) => t.status === "aktif");

  const handleDroneChange = (eqId: string) => {
    onUpdate("equipmentId", eqId);
    const drone = drones.find((d) => d.id === eqId);
    if (drone) {
      onUpdate("ihaRegistrationNo", drone.registrationNo ?? "");
    }
  };

  const handlePilotChange = (pId: string) => {
    onUpdate("pilotId", pId);
    const person = team.find((t) => t.id === pId);
    if (person) {
      onUpdate("pilotLicenseNo", person.pilotLicense?.licenseNumber ?? "");
      onUpdate("applicantPhone", person.phone ?? "");
      onUpdate("applicantEmail", person.email ?? "");
      // İmzalayan = pilot
      onUpdate("applicantPersonId", pId);
      onUpdate("applicantPersonTitle", person.profession ?? "");
    }
  };

  return (
    <div className="space-y-4">
      {/* Başvuru Sahibi */}
      <SectionHeader title="Başvuru Sahibi" />
      <div className="grid grid-cols-1 gap-3">
        <FormInput label="Kurum" value={applicantOrg} onChange={(e) => onUpdate("applicantOrg", e.target.value)} />
        <FormInput label="Birim" value={applicantDepartment} onChange={(e) => onUpdate("applicantDepartment", e.target.value)} />
        <FormInput label="Adres" value={applicantAddress} onChange={(e) => onUpdate("applicantAddress", e.target.value)} />
      </div>

      {/* Pilot Seçimi */}
      <SectionHeader title="Pilot / İşletme Temsilcisi" />
      <FormSelect label="Personel" value={pilotId} onChange={(e) => handlePilotChange(e.target.value)}>
        <option value="">Seçiniz</option>
        {pilots.map((p) => (
          <option key={p.id} value={p.id}>{p.name}{p.pilotLicense ? ` (${p.pilotLicense.licenseClass})` : ""}</option>
        ))}
      </FormSelect>
      <div className="grid grid-cols-2 gap-3">
        <FormInput label="Telefon" value={applicantPhone} onChange={(e) => onUpdate("applicantPhone", e.target.value)} placeholder="444 16 00" />
        <FormInput label="E-posta" value={applicantEmail} onChange={(e) => onUpdate("applicantEmail", e.target.value)} placeholder="ad@kurum.gov.tr" />
      </div>
      <FormInput label="Pilot Lisans No" value={pilotLicenseNo} onChange={(e) => onUpdate("pilotLicenseNo", e.target.value)} placeholder="TR-IHA1T..." />

      {/* Sigorta */}
      <FormInput label="Sigorta Poliçe No" value={insurancePolicyNo} onChange={(e) => onUpdate("insurancePolicyNo", e.target.value)} placeholder="(Ticari ve Ar-Ge Amaçlı Uçuşlar İçin)" />

      {/* İHA Seçimi */}
      <SectionHeader title="İHA Bilgileri" />
      <FormSelect label="İHA" value={equipmentId} onChange={(e) => handleDroneChange(e.target.value)}>
        <option value="">Seçiniz</option>
        {drones.map((d) => (
          <option key={d.id} value={d.id}>{d.name} — {d.model}</option>
        ))}
      </FormSelect>
      <div className="grid grid-cols-2 gap-3">
        <FormInput label="İHA Kayıt No" value={ihaRegistrationNo} onChange={(e) => onUpdate("ihaRegistrationNo", e.target.value)} placeholder="TR-IHA1-000560" />
        <FormSelect label="İHA Tipi" value={ihaClass} onChange={(e) => onUpdate("ihaClass", e.target.value)}>
          <option value="">Seçiniz</option>
          <option value="0-499gr">0-499gr. arasında</option>
          <option value="iha0">İHA0 [500gr(dahil)-4kg]</option>
          <option value="iha1">İHA1 [4kg(dahil)-25kg]</option>
          <option value="iha2">İHA2 [25(dahil)-150kg]</option>
          <option value="iha3">İHA3 [150kg(dahil) ve üzeri]</option>
        </FormSelect>
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="pt-2 border-t border-[var(--border)]">
      <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">{title}</h4>
    </div>
  );
}
