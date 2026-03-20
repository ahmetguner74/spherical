"use client";

import { useCallback, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import type { Work, WorkStatus } from "@/types";
import { useAuth } from "@/hooks";
import { WorkFinanceFields } from "./WorkFinanceFields";
import { WorkLocationPicker } from "./WorkLocationPicker";

interface WorkFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: WorkFormData) => void;
  initial?: Work;
}

export interface WorkFormData {
  title: string;
  description: string;
  client: string;
  status: WorkStatus;
  startDate: string;
  endDate: string;
  totalFee: number;
  paidAmount: number;
  locationLat?: number;
  locationLng?: number;
  locationAddress: string;
}

const EMPTY: WorkFormData = {
  title: "", description: "", client: "",
  status: "in_progress", startDate: "", endDate: "",
  totalFee: 0, paidAmount: 0, locationAddress: "",
};

function workToForm(work?: Work): WorkFormData {
  if (!work) return EMPTY;
  return {
    title: work.title, description: work.description, client: work.client,
    status: work.status, startDate: work.startDate, endDate: work.endDate ?? "",
    totalFee: work.totalFee, paidAmount: work.paidAmount,
    locationLat: work.locationLat, locationLng: work.locationLng,
    locationAddress: work.locationAddress ?? "",
  };
}

export function WorkFormModal({ open, onClose, onSave, initial }: WorkFormModalProps) {
  const [form, setForm] = useState<WorkFormData>(workToForm(initial));
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (open) setForm(workToForm(initial));
  }, [open, initial]);

  const set = useCallback((field: keyof WorkFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.client || !form.startDate) return;
    onSave(form);
    setForm(EMPTY);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
        {initial ? "İşi Düzenle" : "Yeni İş Ekle"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormFields form={form} set={set} />
        {isAdmin && (
          <WorkFinanceFields
            totalFee={form.totalFee}
            paidAmount={form.paidAmount}
            onTotalFeeChange={(v) => setForm((p) => ({ ...p, totalFee: v }))}
            onPaidAmountChange={(v) => setForm((p) => ({ ...p, paidAmount: v }))}
          />
        )}
        <WorkLocationPicker
          lat={form.locationLat}
          lng={form.locationLng}
          address={form.locationAddress}
          onLatLngChange={(lat, lng) => setForm((p) => ({ ...p, locationLat: lat, locationLng: lng }))}
          onAddressChange={(a) => setForm((p) => ({ ...p, locationAddress: a }))}
        />
        <FormActions onClose={onClose} isEdit={!!initial} />
      </form>
    </Modal>
  );
}

function FormFields({ form, set }: { form: WorkFormData; set: (f: keyof WorkFormData, v: string) => void }) {
  const inputClass = "w-full rounded-lg bg-[var(--background)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";
  const labelClass = "block text-sm font-medium text-[var(--foreground)] mb-1";

  return (
    <>
      <div>
        <label className={labelClass}>İş Adı *</label>
        <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputClass} placeholder="Proje adı" required />
      </div>
      <div>
        <label className={labelClass}>Açıklama</label>
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)} className={`${inputClass} min-h-[80px] resize-y`} placeholder="Kısa açıklama" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Müşteri *</label>
          <input value={form.client} onChange={(e) => set("client", e.target.value)} className={inputClass} placeholder="Müşteri adı" required />
        </div>
        <div>
          <label className={labelClass}>Durum</label>
          <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputClass}>
            <option value="in_progress">Devam Ediyor</option>
            <option value="completed">Tamamlandı</option>
            <option value="pending">Beklemede</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Başlangıç *</label>
          <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Bitiş</label>
          <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className={inputClass} />
        </div>
      </div>
    </>
  );
}

function FormActions({ onClose, isEdit }: { onClose: () => void; isEdit: boolean }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <button type="submit" className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]">
        {isEdit ? "Kaydet" : "Ekle"}
      </button>
      <button type="button" onClick={onClose} className="rounded-lg bg-[var(--surface-hover)] px-4 py-2 text-sm text-[var(--muted-foreground)] transition-colors hover:bg-[var(--border)]">
        İptal
      </button>
    </div>
  );
}
