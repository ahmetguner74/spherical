"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { inputClass } from "../shared/styles";
import * as db from "../shared/ihaStorage";
import type { MaintenanceRecord, MaintenanceType } from "@/types/iha";
import { MAINTENANCE_TYPE_LABELS } from "@/types/iha";

interface MaintenanceListProps {
  equipmentId: string;
  equipmentName: string;
}

const TYPES: MaintenanceType[] = ["bakim", "onarim", "kalibrasyon", "guncelleme"];

export function MaintenanceList({ equipmentId, equipmentName }: MaintenanceListProps) {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [type, setType] = useState<MaintenanceType>("bakim");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [performedBy, setPerformedBy] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");

  const load = () => {
    setLoading(true);
    db.fetchMaintenance(equipmentId)
      .then(setRecords)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [equipmentId]);

  const handleSubmit = () => {
    if (!description.trim()) return;
    db.addMaintenance({
      equipmentId,
      type,
      date,
      description: description.trim(),
      cost: cost ? Number(cost) : undefined,
      performedBy: performedBy || undefined,
      nextDueDate: nextDueDate || undefined,
    }).then(() => {
      setShowForm(false);
      setDescription("");
      setCost("");
      setPerformedBy("");
      setNextDueDate("");
      load();
    });
  };

  const handleDelete = (id: string) => {
    db.deleteMaintenance(id).then(load);
  };

  return (
    <div className="ring-2 ring-red-500 rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">
          Bakım Kayıtları — {equipmentName}
        </p>
        <button onClick={() => setShowForm(!showForm)} className="text-xs text-[var(--accent)] hover:underline">
          {showForm ? "Kapat" : "+ Bakım Ekle"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-3 p-3 rounded-lg bg-[var(--background)]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">Tip</label>
              <select value={type} onChange={(e) => setType(e.target.value as MaintenanceType)} className={inputClass}>
                {TYPES.map((t) => <option key={t} value={t}>{MAINTENANCE_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">Tarih</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Açıklama *</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} placeholder="Yapılan işlem" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">Maliyet (TL)</label>
              <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} className={inputClass} min={0} />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">Yapan Kişi</label>
              <input type="text" value={performedBy} onChange={(e) => setPerformedBy(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">Sonraki Bakım</label>
              <input type="date" value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={!description.trim()}>Kaydet</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>İptal</Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-xs text-[var(--muted-foreground)]">Yükleniyor...</p>
      ) : records.length === 0 ? (
        <p className="text-xs text-[var(--muted-foreground)]">Henüz bakım kaydı yok</p>
      ) : (
        <div className="space-y-1.5">
          {records.map((r) => (
            <div key={r.id} className="flex items-center justify-between text-xs py-1.5 border-b border-[var(--border)] last:border-0">
              <div>
                <span className="text-[var(--foreground)] font-medium">{r.date}</span>
                <span className="text-[var(--muted-foreground)] ml-2">{MAINTENANCE_TYPE_LABELS[r.type]}</span>
                <span className="text-[var(--muted-foreground)] ml-2">— {r.description}</span>
                {r.cost && <span className="text-[var(--accent)] ml-2">{r.cost} TL</span>}
              </div>
              <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:bg-red-500/10 px-1.5 py-0.5 rounded text-[10px]">Sil</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
