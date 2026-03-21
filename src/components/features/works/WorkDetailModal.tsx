"use client";

import { useCallback, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import type { Work, WorkStatus } from "@/types";
import { useWorkDetail } from "./useWorkDetail";
import { WorkFinanceSection } from "./WorkFinanceSection";
import { WorkLocationPicker } from "./WorkLocationPicker";
import { WorkLocationView } from "./WorkLocationView";
import { WorkWorkerList } from "./WorkWorkerList";
import { WorkPaymentList } from "./WorkPaymentList";

interface Props {
  work: Work | null;
  isNew?: boolean;
  onClose: () => void;
  onSave: (data: WorkSaveData) => Promise<Work | void>;
  onDelete: (id: string) => void;
}

export interface WorkSaveData {
  title: string;
  description: string;
  client: string;
  status: WorkStatus;
  startDate: string;
  endDate?: string;
  totalFee: number;
  locationLat?: number;
  locationLng?: number;
  locationAddress?: string;
}

export function WorkDetailModal({ work, isNew, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState<WorkSaveData>(workToForm(work));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedWork, setSavedWork] = useState<Work | null>(work);
  const [editLocation, setEditLocation] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const activeWork = savedWork ?? work;
  const workId = activeWork?.id ?? null;

  const {
    workers, payments, workerPayments, totalExpenses, paidAmount, payouts, totalSharePercent,
    loading, addWorker, removeWorker, updateShare,
    addExpense, removeExpense, addPayment, removePayment,
    addWorkerPayment, removeWorkerPayment,
  } = useWorkDetail(workId, form.totalFee);

  useEffect(() => {
    if (work) {
      setForm(workToForm(work));
      setSavedWork(work);
      setDirty(false);
      setConfirmDelete(false);
      setEditLocation(false);
    }
  }, [work]);

  const set = useCallback(<K extends keyof WorkSaveData>(key: K, val: WorkSaveData[K]) => {
    setForm((p) => ({ ...p, [key]: val }));
    setDirty(true);
  }, []);

  const handleSave = async () => {
    if (!form.title || !form.client || !form.startDate) return;
    setSaving(true);
    const result = await onSave(form);
    if (result) setSavedWork(result);
    setDirty(false);
    setSaving(false);
  };

  const handleDelete = () => {
    if (workId) onDelete(workId);
  };

  if (!work && !isNew) return null;

  const inputClass = "w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";
  const labelClass = "block text-xs font-medium text-[var(--muted-foreground)] mb-1";

  return (
    <Modal open onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
        <BasicFields form={form} set={set} inputClass={inputClass} labelClass={labelClass} />

        <LocationSection
          form={form}
          set={set}
          editLocation={editLocation}
          setEditLocation={setEditLocation}
          inputClass={inputClass}
        />

        {dirty && (
          <button
            type="submit"
            disabled={saving || !form.title || !form.client || !form.startDate}
            className="w-full py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : (isNew && !workId ? "Oluştur" : "Değişiklikleri Kaydet")}
          </button>
        )}
      </form>

      {workId && (
        <>
          <div className="mt-4">
            <WorkFinanceSection totalFee={form.totalFee} paidAmount={paidAmount} totalExpenses={totalExpenses} />
          </div>
          <div className="mt-4">
            <WorkPaymentList payments={payments} onAdd={addPayment} onRemove={removePayment} />
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
              </div>
            ) : (
              <WorkWorkerList
                workers={workers}
                payouts={payouts}
                workerPayments={workerPayments}
                totalSharePercent={totalSharePercent}
                onAddWorker={addWorker}
                onRemoveWorker={removeWorker}
                onUpdateShare={updateShare}
                onAddExpense={addExpense}
                onRemoveExpense={removeExpense}
                onAddWorkerPayment={addWorkerPayment}
                onRemoveWorkerPayment={removeWorkerPayment}
              />
            )}
          </div>
        </>
      )}

      <BottomActions
        workId={workId}
        confirmDelete={confirmDelete}
        onDelete={handleDelete}
        onConfirmToggle={setConfirmDelete}
        onClose={onClose}
      />
    </Modal>
  );
}

function BasicFields({ form, set, inputClass, labelClass }: {
  form: WorkSaveData;
  set: <K extends keyof WorkSaveData>(key: K, val: WorkSaveData[K]) => void;
  inputClass: string;
  labelClass: string;
}) {
  return (
    <>
      <div>
        <label className={labelClass}>İş Adı *</label>
        <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputClass} placeholder="Proje adı" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Müşteri *</label>
          <input value={form.client} onChange={(e) => set("client", e.target.value)} className={inputClass} placeholder="Müşteri adı" />
        </div>
        <div>
          <label className={labelClass}>Toplam Ücret (₺)</label>
          <input type="number" min={0} value={form.totalFee || ""} onChange={(e) => set("totalFee", Number(e.target.value) || 0)} className={inputClass} placeholder="0" />
        </div>
      </div>
      <div>
        <label className={labelClass}>Açıklama</label>
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)} className={`${inputClass} min-h-[60px] resize-y`} placeholder="Kısa açıklama" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Durum</label>
          <select value={form.status} onChange={(e) => set("status", e.target.value as WorkStatus)} className={inputClass}>
            <option value="in_progress">Devam Ediyor</option>
            <option value="completed">Tamamlandı</option>
            <option value="pending">Beklemede</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Başlangıç *</label>
          <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Bitiş</label>
          <input type="date" value={form.endDate ?? ""} onChange={(e) => set("endDate", e.target.value || undefined)} className={inputClass} />
        </div>
      </div>
    </>
  );
}

function LocationSection({ form, set, editLocation, setEditLocation, inputClass }: {
  form: WorkSaveData;
  set: <K extends keyof WorkSaveData>(key: K, val: WorkSaveData[K]) => void;
  editLocation: boolean;
  setEditLocation: (v: boolean) => void;
  inputClass: string;
}) {
  if (editLocation) {
    return (
      <div className="space-y-2">
        <WorkLocationPicker
          lat={form.locationLat}
          lng={form.locationLng}
          address={form.locationAddress ?? ""}
          onLatLngChange={(lat, lng) => { set("locationLat", lat); set("locationLng", lng); }}
          onAddressChange={(a) => set("locationAddress", a)}
        />
        <button type="button" onClick={() => setEditLocation(false)} className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          Haritayı gizle
        </button>
      </div>
    );
  }

  if (form.locationLat && form.locationLng) {
    return (
      <div className="space-y-1">
        <WorkLocationView lat={form.locationLat} lng={form.locationLng} address={form.locationAddress} />
        <button type="button" onClick={() => setEditLocation(true)} className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]">
          Konumu değiştir
        </button>
      </div>
    );
  }

  return (
    <button type="button" onClick={() => setEditLocation(true)} className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]">
      + Konum ekle
    </button>
  );
}

function BottomActions({ workId, confirmDelete, onDelete, onConfirmToggle, onClose }: {
  workId: string | null;
  confirmDelete: boolean;
  onDelete: () => void;
  onConfirmToggle: (v: boolean) => void;
  onClose: () => void;
}) {
  return (
    <div className="mt-6 flex items-center gap-2">
      {workId && (
        confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-yellow-400">Silmek istediğinize emin misiniz?</span>
            <button onClick={onDelete} className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors">Evet</button>
            <button onClick={() => onConfirmToggle(false)} className="rounded-lg bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)] transition-colors">Hayır</button>
          </div>
        ) : (
          <button onClick={() => onConfirmToggle(true)} className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/20 transition-colors">
            Sil
          </button>
        )
      )}
      <button onClick={onClose} className="ml-auto rounded-lg bg-[var(--surface-hover)] px-4 py-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--border)] transition-colors">
        Kapat
      </button>
    </div>
  );
}

function workToForm(work: Work | null): WorkSaveData {
  if (!work) {
    return {
      title: "", description: "", client: "",
      status: "in_progress", startDate: new Date().toISOString().split("T")[0],
      totalFee: 0,
    };
  }
  return {
    title: work.title, description: work.description, client: work.client,
    status: work.status, startDate: work.startDate, endDate: work.endDate,
    totalFee: work.totalFee,
    locationLat: work.locationLat, locationLng: work.locationLng,
    locationAddress: work.locationAddress,
  };
}
