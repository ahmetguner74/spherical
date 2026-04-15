"use client";

import { useState, useEffect } from "react";
import { Button, FormInput, FormSelect } from "@/components/ui";
import * as db from "../shared/ihaStorage";
import { useIhaStore } from "../shared/ihaStore";
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
      const userId = useIhaStore.getState().currentUserId ?? "bilinmiyor";
      db.addAuditEntry({ action: "ekledi", target: "bakim", targetId: equipmentId, description: `${equipmentName}: ${MAINTENANCE_TYPE_LABELS[type]} — ${description.trim()}`, performedBy: userId }).catch(() => {});
      setShowForm(false);
      setDescription("");
      setCost("");
      setPerformedBy("");
      setNextDueDate("");
      load();
    });
  };

  const handleDelete = (id: string) => {
    db.deleteMaintenance(id).then(() => {
      const userId = useIhaStore.getState().currentUserId ?? "bilinmiyor";
      db.addAuditEntry({ action: "sildi", target: "bakim", targetId: id, description: `${equipmentName}: Bakım kaydı silindi`, performedBy: userId }).catch(() => {});
      load();
    });
  };

  return (
    <div className="ring-2 ring-red-500 rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-[var(--feedback-error)] uppercase tracking-wider">
          Bakım Kayıtları — {equipmentName}
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Kapat" : "+ Bakım Ekle"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-3 p-3 rounded-lg bg-[var(--background)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormSelect label="Tip" value={type} onChange={(e) => setType(e.target.value as MaintenanceType)}>
              {TYPES.map((t) => <option key={t} value={t}>{MAINTENANCE_TYPE_LABELS[t]}</option>)}
            </FormSelect>
            <FormInput label="Tarih" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <FormInput label="Açıklama" required type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Yapılan işlem" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormInput label="Maliyet (TL)" type="number" value={cost} onChange={(e) => setCost(e.target.value)} min={0} />
            <FormInput label="Yapan Kişi" type="text" value={performedBy} onChange={(e) => setPerformedBy(e.target.value)} />
            <FormInput label="Sonraki Bakım" type="date" value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} />
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
              <Button type="button" variant="danger" size="sm" className="min-h-[44px]" onClick={() => handleDelete(r.id)}>Sil</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
