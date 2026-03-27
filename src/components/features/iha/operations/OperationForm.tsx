"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Operation, OperationStatus, OperationPriority } from "@/types/iha";
import { OPERATION_STATUS_LABELS, OPERATION_PRIORITY_LABELS } from "@/types/iha";
import type { Equipment, TeamMember } from "@/types/iha";

interface OperationFormProps {
  operation?: Operation;
  equipment: Equipment[];
  team: TeamMember[];
  onSave: (data: Omit<Operation, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

const STATUSES: OperationStatus[] = [
  "talep", "planlama", "saha", "isleme", "kontrol", "teslim", "iptal",
];

const PRIORITIES: OperationPriority[] = ["dusuk", "normal", "yuksek", "acil"];

export function OperationForm({
  operation,
  equipment,
  team,
  onSave,
  onCancel,
}: OperationFormProps) {
  const [title, setTitle] = useState(operation?.title ?? "");
  const [description, setDescription] = useState(operation?.description ?? "");
  const [requester, setRequester] = useState(operation?.requester ?? "");
  const [status, setStatus] = useState<OperationStatus>(operation?.status ?? "talep");
  const [priority, setPriority] = useState<OperationPriority>(operation?.priority ?? "normal");
  const [assignedTeam, setAssignedTeam] = useState<string[]>(operation?.assignedTeam ?? []);
  const [assignedEquipment, setAssignedEquipment] = useState<string[]>(operation?.assignedEquipment ?? []);
  const [startDate, setStartDate] = useState(operation?.startDate ?? "");
  const [dataStoragePath, setDataStoragePath] = useState(operation?.dataStoragePath ?? "");
  const [outputDescription, setOutputDescription] = useState(operation?.outputDescription ?? "");

  const inputClass =
    "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      requester: requester.trim(),
      status,
      priority,
      assignedTeam,
      assignedEquipment,
      startDate: startDate || undefined,
      dataStoragePath: dataStoragePath || undefined,
      outputDescription: outputDescription || undefined,
    });
  };

  const toggleTeamMember = (id: string) => {
    setAssignedTeam((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const toggleEquipment = (id: string) => {
    setAssignedEquipment((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">
          Başlık *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="Operasyon başlığı"
        />
      </div>

      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">
          Açıklama
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass} h-20 resize-none`}
          placeholder="Operasyon açıklaması"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">
            Talep Eden
          </label>
          <input
            type="text"
            value={requester}
            onChange={(e) => setRequester(e.target.value)}
            className={inputClass}
            placeholder="Birim / Kişi"
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">
            Başlangıç Tarihi
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">
            Durum
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OperationStatus)}
            className={inputClass}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {OPERATION_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">
            Öncelik
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as OperationPriority)}
            className={inputClass}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {OPERATION_PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ekip Ataması */}
      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">
          Ekip
        </label>
        <div className="flex flex-wrap gap-2">
          {team.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => toggleTeamMember(member.id)}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                assignedTeam.includes(member.id)
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface)]"
              }`}
            >
              {member.name}
            </button>
          ))}
        </div>
      </div>

      {/* Ekipman Ataması */}
      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">
          Ekipman
        </label>
        <div className="flex flex-wrap gap-2">
          {equipment.map((eq) => (
            <button
              key={eq.id}
              type="button"
              onClick={() => toggleEquipment(eq.id)}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                assignedEquipment.includes(eq.id)
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface)]"
              }`}
            >
              {eq.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">
          Veri Depolama Yolu
        </label>
        <input
          type="text"
          value={dataStoragePath}
          onChange={(e) => setDataStoragePath(e.target.value)}
          className={inputClass}
          placeholder="ör: cografidrone/2026/proje-adi"
        />
      </div>

      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">
          Çıktı Açıklaması
        </label>
        <input
          type="text"
          value={outputDescription}
          onChange={(e) => setOutputDescription(e.target.value)}
          className={inputClass}
          placeholder="Teslim edilen çıktılar"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleSubmit} disabled={!title.trim()}>
          {operation ? "Güncelle" : "Oluştur"}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          İptal
        </Button>
      </div>
    </div>
  );
}
