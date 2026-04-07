"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type {
  Operation,
  OperationStatus,
  OperationPriority,
  OperationType,
  OperationLocation,
  Equipment,
  TeamMember,
} from "@/types/iha";
import {
  OPERATION_STATUS_LABELS,
  OPERATION_PRIORITY_LABELS,
  OPERATION_TYPE_LABELS,
} from "@/types/iha";
import { OperationLocationForm } from "./OperationLocationForm";
import { inputClass } from "../shared/styles";
import { IHA_CONFIG } from "@/config/iha";
import { toast } from "@/components/ui/Toast";

interface OperationFormProps {
  operation?: Operation;
  equipment: Equipment[];
  team: TeamMember[];
  onSave: (data: Omit<Operation, "id" | "createdAt" | "updatedAt" | "deliverables" | "flightLogIds" | "completionPercent">) => void;
  onCancel: () => void;
}

const TYPES: OperationType[] = ["lidar_el", "lidar_arac", "drone_fotogrametri", "oblik_cekim", "panorama_360"];
const STATUSES: OperationStatus[] = ["talep", "planlama", "saha", "isleme", "kontrol", "teslim", "iptal"];
const PRIORITIES: OperationPriority[] = ["dusuk", "normal", "yuksek", "acil"];

export function OperationForm({ operation, equipment, team, onSave, onCancel }: OperationFormProps) {
  const [title, setTitle] = useState(operation?.title ?? "");
  const [description, setDescription] = useState(operation?.description ?? "");
  const [type, setType] = useState<OperationType>(operation?.type ?? "drone_fotogrametri");
  const [requester, setRequester] = useState(operation?.requester ?? "");
  const [status, setStatus] = useState<OperationStatus>(operation?.status ?? "talep");
  const [priority, setPriority] = useState<OperationPriority>(operation?.priority ?? "normal");
  const [location, setLocation] = useState<OperationLocation>(operation?.location ?? IHA_CONFIG.defaultLocation);
  const [assignedTeam, setAssignedTeam] = useState<string[]>(operation?.assignedTeam ?? []);
  const [assignedEquipment, setAssignedEquipment] = useState<string[]>(operation?.assignedEquipment ?? []);
  const [startDate, setStartDate] = useState(operation?.startDate ?? "");
  const [dataStoragePath, setDataStoragePath] = useState(operation?.dataStoragePath ?? "");
  const [notes, setNotes] = useState(operation?.notes ?? "");

  const toggleItem = (list: string[], id: string, setter: (v: string[]) => void) => {
    setter(list.includes(id) ? list.filter((i) => i !== id) : [...list, id]);
  };

  const errors: string[] = [];
  if (!title.trim()) errors.push("Başlık zorunlu");
  if (!location.il.trim()) errors.push("İl zorunlu");
  if (!location.ilce.trim()) errors.push("İlçe zorunlu");

  const handleSubmit = () => {
    if (errors.length > 0) return;
    if (startDate && operation?.endDate && startDate > operation.endDate) {
      toast("Bitiş tarihi başlangıç tarihinden sonra olmalı", "error");
      return;
    }
    onSave({
      title: title.trim(),
      description: description.trim(),
      type,
      requester: requester.trim(),
      status,
      priority,
      location,
      assignedTeam,
      assignedEquipment,
      startDate: startDate || undefined,
      dataStoragePath: dataStoragePath || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">Başlık *</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Operasyon başlığı" />
      </div>

      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">Açıklama</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} h-16 resize-none`} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Operasyon Tipi</label>
          <select value={type} onChange={(e) => setType(e.target.value as OperationType)} className={inputClass}>
            {TYPES.map((t) => (
              <option key={t} value={t}>{OPERATION_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Talep Eden</label>
          <input type="text" value={requester} onChange={(e) => setRequester(e.target.value)} className={inputClass} placeholder="Birim / Kişi" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Durum</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as OperationStatus)} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{OPERATION_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Öncelik</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as OperationPriority)} className={inputClass}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{OPERATION_PRIORITY_LABELS[p]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Başlangıç</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
        </div>
      </div>

      {/* Konum */}
      <OperationLocationForm location={location} onChange={setLocation} />

      {/* Ekip */}
      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">Ekip</label>
        <div className="flex flex-wrap gap-2">
          {team.map((member) => (
            <button key={member.id} type="button" onClick={() => toggleItem(assignedTeam, member.id, setAssignedTeam)}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                assignedTeam.includes(member.id)
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface)]"
              }`}>
              {member.name}
            </button>
          ))}
        </div>
      </div>

      {/* Ekipman */}
      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">Ekipman</label>
        <div className="flex flex-wrap gap-2">
          {equipment.map((eq) => (
            <button key={eq.id} type="button" onClick={() => toggleItem(assignedEquipment, eq.id, setAssignedEquipment)}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                assignedEquipment.includes(eq.id)
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface)]"
              }`}>
              {eq.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">Veri Depolama Yolu</label>
        <input type="text" value={dataStoragePath} onChange={(e) => setDataStoragePath(e.target.value)} className={inputClass} placeholder="ör: cografidrone/2026/osmangazi/proje-adi" />
      </div>

      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">Notlar</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} h-16 resize-none`} />
      </div>

      {errors.length > 0 && (
        <div className="text-xs text-red-500 space-y-0.5">
          {errors.map((e) => <p key={e}>{e}</p>)}
        </div>
      )}

      <div className="flex gap-2 pt-2 sticky bottom-0 bg-[var(--surface)] py-3">
        <Button onClick={handleSubmit} disabled={errors.length > 0}>{operation ? "Güncelle" : "Oluştur"}</Button>
        <Button variant="ghost" onClick={onCancel}>İptal</Button>
      </div>
    </div>
  );
}
