"use client";

import { useState, useEffect } from "react";
import { usePermission } from "@/hooks/usePermission";
import { Button, FormInput, FormSelect } from "@/components/ui";
import * as db from "../shared/ihaStorage";
import { useIhaStore } from "../shared/ihaStore";
import { useToast } from "@/components/ui/Toast";
import type { MaintenanceRecord, MaintenanceType } from "@/types/iha";
import { MAINTENANCE_TYPE_LABELS } from "@/types/iha";

interface MaintenanceListProps {
  equipmentId: string;
  equipmentName: string;
}

const TYPES: MaintenanceType[] = ["bakim", "onarim", "kalibrasyon", "guncelleme"];

const emptyForm = () => ({
  type: "bakim" as MaintenanceType,
  date: new Date().toISOString().split("T")[0],
  description: "",
  cost: "",
  performedBy: "",
  nextDueDate: "",
});

export function MaintenanceList({ equipmentId, equipmentName }: MaintenanceListProps) {
  const can = usePermission();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const set = <K extends keyof ReturnType<typeof emptyForm>>(key: K, value: ReturnType<typeof emptyForm>[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const load = () => {
    setLoading(true);
    db.fetchMaintenance(equipmentId)
      .then(setRecords)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [equipmentId]);

  const resetForm = () => {
    setForm(emptyForm());
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (r: MaintenanceRecord) => {
    setForm({
      type: r.type,
      date: r.date,
      description: r.description,
      cost: r.cost?.toString() ?? "",
      performedBy: r.performedBy ?? "",
      nextDueDate: r.nextDueDate ?? "",
    });
    setEditingId(r.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.description.trim()) return;
    const userId = useIhaStore.getState().currentUserId ?? "bilinmiyor";
    const record = {
      equipmentId,
      type: form.type,
      date: form.date,
      description: form.description.trim(),
      cost: form.cost ? Number(form.cost) : undefined,
      performedBy: form.performedBy || undefined,
      nextDueDate: form.nextDueDate || undefined,
    };

    if (editingId) {
      db.updateMaintenance(editingId, record).then(() => {
        db.addAuditEntry({ action: "guncelledi", target: "bakim", targetId: editingId, description: `${equipmentName}: ${MAINTENANCE_TYPE_LABELS[form.type]} — ${form.description.trim()}`, performedBy: userId }).catch(() => {});
        resetForm();
        load();
      }).catch(handleError);
    } else {
      db.addMaintenance(record).then(() => {
        db.addAuditEntry({ action: "ekledi", target: "bakim", targetId: equipmentId, description: `${equipmentName}: ${MAINTENANCE_TYPE_LABELS[form.type]} — ${form.description.trim()}`, performedBy: userId }).catch(() => {});
        resetForm();
        load();
      }).catch(handleError);
    }
  };

  const handleDelete = (id: string) => {
    db.deleteMaintenance(id).then(() => {
      const userId = useIhaStore.getState().currentUserId ?? "bilinmiyor";
      db.addAuditEntry({ action: "sildi", target: "bakim", targetId: id, description: `${equipmentName}: Bakım kaydı silindi`, performedBy: userId }).catch(() => {});
      load();
    }).catch(handleError);
  };

  const handleError = (err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("row-level security") || msg.includes("policy") || msg.includes("permission denied")) {
      const userId = useIhaStore.getState().currentUserId ?? "bilinmiyor";
      db.addAuditEntry({ action: "yetki_reddedildi", target: "bakim", targetId: equipmentId, description: `Yetkisiz işlem engellendi: ${equipmentName}`, performedBy: userId }).catch(() => {});
      useToast.getState().add("Bu işlem için yetkiniz yok", "error");
    } else {
      useToast.getState().add(`Hata: ${msg}`, "error");
    }
  };

  return (
    <div className="rounded-lg p-3 space-y-3 border border-[var(--border)]">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
          Bakım Kayıtları
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}>
          {showForm ? "Kapat" : "+ Bakım Ekle"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-3 p-3 rounded-lg bg-[var(--background)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormSelect label="Tip" value={form.type} onChange={(e) => set("type", e.target.value as MaintenanceType)}>
              {TYPES.map((t) => <option key={t} value={t}>{MAINTENANCE_TYPE_LABELS[t]}</option>)}
            </FormSelect>
            <FormInput label="Tarih" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
          </div>
          <FormInput label="Açıklama" required type="text" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Yapılan işlem" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormInput label="Maliyet (TL)" type="number" value={form.cost} onChange={(e) => set("cost", e.target.value)} min={0} />
            <FormInput label="Yapan Kişi" type="text" value={form.performedBy} onChange={(e) => set("performedBy", e.target.value)} />
            <FormInput label="Sonraki Bakım" type="date" value={form.nextDueDate} onChange={(e) => set("nextDueDate", e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={!form.description.trim()}>
              {editingId ? "Güncelle" : "Kaydet"}
            </Button>
            <Button type="button" variant="ghost" onClick={resetForm}>İptal</Button>
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
              {can("maintenance.delete") && (
                <div className="flex gap-1 shrink-0 ml-2">
                  <Button type="button" variant="ghost" size="sm" className="min-h-[44px]" onClick={() => startEdit(r)}>Düzenle</Button>
                  <Button type="button" variant="danger" size="sm" className="min-h-[44px]" onClick={() => handleDelete(r.id)}>Sil</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
