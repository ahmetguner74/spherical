"use client";

import { useState } from "react";
import type { Operation, OperationType, TeamMember } from "@/types/iha";
import { OPERATION_TYPE_LABELS } from "@/types/iha";
import { inputClass } from "../shared/styles";
import { BURSA_ILCELER } from "@/config/iha";

interface QuickCreateFormProps {
  team: TeamMember[];
  onSave: (data: Omit<Operation, "id" | "createdAt" | "updatedAt" | "deliverables" | "flightLogIds" | "completionPercent">) => void;
  onCancel: () => void;
  defaultDate?: string;
  defaultLat?: number;
  defaultLng?: number;
}

const TYPES: { key: OperationType; icon: string }[] = [
  { key: "drone_fotogrametri", icon: "🛩️" },
  { key: "lidar_el", icon: "📡" },
  { key: "lidar_arac", icon: "🚗" },
  { key: "oblik_cekim", icon: "📐" },
  { key: "panorama_360", icon: "🌐" },
];

export function QuickCreateForm({ team, onSave, onCancel, defaultDate, defaultLat, defaultLng }: QuickCreateFormProps) {
  const [ilce, setIlce] = useState("");
  const [type, setType] = useState<OperationType>("drone_fotogrametri");
  const [title, setTitle] = useState("");
  const [assignedTeam, setAssignedTeam] = useState<string[]>([]);
  const [error, setError] = useState("");

  const toggleMember = (id: string) => {
    setAssignedTeam((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleSubmit = () => {
    if (!ilce) {
      setError("İlçe seçin");
      return;
    }

    const startDate = defaultDate ?? new Date().toISOString().slice(0, 10);
    const autoTitle = title.trim() || `${ilce} ${OPERATION_TYPE_LABELS[type]}`;

    onSave({
      title: autoTitle,
      description: "",
      type,
      requester: "",
      status: "talep",
      priority: "normal",
      location: {
        il: "Bursa",
        ilce,
        lat: defaultLat,
        lng: defaultLng,
      },
      assignedTeam,
      assignedEquipment: [],
      startDate,
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
      {/* 1. İlçe */}
      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Nerede? *</label>
        <select
          value={ilce}
          onChange={(e) => { setIlce(e.target.value); setError(""); }}
          autoFocus
          className={`${inputClass} text-base py-3 ${error ? "border-red-500" : ""}`}
        >
          <option value="">İlçe seçin</option>
          {BURSA_ILCELER.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      {/* 2. Tip */}
      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Ne yapılacak?</label>
        <div className="grid grid-cols-5 gap-2">
          {TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setType(t.key)}
              className={`flex flex-col items-center gap-1 py-3 rounded-lg border transition-colors min-h-[60px] ${
                type === t.key
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              <span className="text-[10px] leading-tight text-center">{OPERATION_TYPE_LABELS[t.key].split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. İsim */}
      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Operasyon Adı</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={ilce ? `${ilce} ${OPERATION_TYPE_LABELS[type]}` : "Otomatik oluşturulur"}
          className={`${inputClass} py-2.5`}
        />
      </div>

      {/* 4. Kim gidecek */}
      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Kim gidecek?</label>
        <div className="flex flex-wrap gap-2">
          {team.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => toggleMember(m.id)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors min-h-[44px] ${
                assignedTeam.includes(m.id)
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Koordinat (haritadan geliyorsa) */}
      {defaultLat && defaultLng && (
        <p className="text-xs text-[var(--muted-foreground)]">
          📍 {defaultLat.toFixed(5)}, {defaultLng.toFixed(5)}
        </p>
      )}

      {/* Butonlar */}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 py-3 rounded-lg bg-[var(--accent)] text-white font-semibold text-sm hover:opacity-90 transition-opacity min-h-[48px]"
        >
          Oluştur
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-3 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] text-sm hover:bg-[var(--surface-hover)] transition-colors min-h-[48px]"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
