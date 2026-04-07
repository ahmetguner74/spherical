"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { inputClass } from "../shared/styles";
import type { TeamMember } from "@/types/iha";

interface PersonnelFormProps {
  member: TeamMember;
  onSave: (updates: Partial<TeamMember>) => void;
  onCancel: () => void;
}

export function PersonnelForm({ member, onSave, onCancel }: PersonnelFormProps) {
  const [name, setName] = useState(member.name);
  const [role, setRole] = useState(member.role);
  const [phone, setPhone] = useState(member.phone ?? "");
  const [email, setEmail] = useState(member.email ?? "");
  const [skillsText, setSkillsText] = useState(
    member.skills?.join(", ") ?? ""
  );

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      role: role.trim(),
      phone: phone || undefined,
      email: email || undefined,
      skills: skillsText
        ? skillsText.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Ad *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Rol</label>
          <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Telefon</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">E-posta</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">
          Yetenekler (virgülle ayırın)
        </label>
        <input
          type="text"
          value={skillsText}
          onChange={(e) => setSkillsText(e.target.value)}
          className={inputClass}
          placeholder="ör: Drone pilotu, Fotogrametri, GPS"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleSubmit} disabled={!name.trim()}>Kaydet</Button>
        <Button variant="ghost" onClick={onCancel}>İptal</Button>
      </div>
    </div>
  );
}
