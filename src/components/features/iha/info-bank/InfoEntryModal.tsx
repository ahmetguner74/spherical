"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { inputClass } from "../shared/styles";
import { INFO_CATEGORY_LABELS } from "@/types/iha";
import type { InfoEntry, InfoCategory, InfoField } from "@/types/iha";

const CATEGORIES: InfoCategory[] = ["hesap", "lisans", "ag", "sigorta", "diger"];

interface InfoEntryModalProps {
  entry?: InfoEntry;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<InfoEntry, "id" | "createdAt" | "updatedAt">) => void;
  onDelete: (id: string) => void;
}

export function InfoEntryModal({ entry, isOpen, onClose, onSave, onDelete }: InfoEntryModalProps) {
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<InfoCategory>("hesap");
  const [fields, setFields] = useState<InfoField[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitle(entry?.title ?? "");
      setCategory(entry?.category ?? "hesap");
      setFields(entry?.fields?.map((f) => ({ ...f })) ?? [{ key: "", value: "" }]);
      setNotes(entry?.notes ?? "");
      setEditing(!entry);
    }
  }, [isOpen, entry]);

  const addField = () => setFields([...fields, { key: "", value: "" }]);
  const updateField = (idx: number, updates: Partial<InfoField>) =>
    setFields(fields.map((f, i) => (i === idx ? { ...f, ...updates } : f)));
  const removeField = (idx: number) => setFields(fields.filter((_, i) => i !== idx));

  const handleSave = () => {
    if (!title.trim()) return;
    const validFields = fields.filter((f) => f.key.trim() && f.value.trim());
    onSave({ title: title.trim(), category, fields: validFields, notes: notes || undefined });
  };

  const copy = (text: string) => navigator.clipboard.writeText(text);

  const labelClass = "block text-xs text-[var(--muted-foreground)] mb-1";

  // Görüntüleme modu
  if (!editing && entry) {
    return (
      <Modal open={isOpen} onClose={onClose}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--foreground)]">{entry.title}</h2>
            <span className="text-[10px] text-[var(--muted-foreground)] uppercase">{INFO_CATEGORY_LABELS[entry.category]}</span>
          </div>

          <div className="space-y-1">
            {entry.fields.map((field, idx) => (
              <div key={idx} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                <span className="text-xs text-[var(--muted-foreground)]">{field.key}</span>
                <button
                  onClick={() => copy(field.value)}
                  title="Tıkla kopyala"
                  className="text-xs font-mono text-[var(--foreground)] hover:text-[var(--accent)] transition-colors select-all text-right max-w-[65%] truncate"
                >
                  {field.value}
                </button>
              </div>
            ))}
          </div>

          {entry.notes && (
            <p className="text-xs text-[var(--muted-foreground)] bg-[var(--background)] rounded p-2">{entry.notes}</p>
          )}

          <div className="flex gap-2 pt-2">
            <Button onClick={() => {
              setTitle(entry.title);
              setCategory(entry.category);
              setFields(entry.fields.map((f) => ({ ...f })));
              setNotes(entry.notes ?? "");
              setEditing(true);
            }}>Düzenle</Button>
            <Button variant="ghost" onClick={onClose}>Kapat</Button>
          </div>

          <button
            onClick={() => setConfirmOpen(true)}
            className="w-full py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            Sil
          </button>
          <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={() => onDelete(entry.id)}
            title="Bilgi Kaydını Sil"
            description={`"${entry.title}" kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
          />
        </div>
      </Modal>
    );
  }

  // Düzenleme modu
  return (
    <Modal open={isOpen} onClose={onClose}>
      <h2 className="text-base font-bold text-[var(--foreground)] mb-4">
        {entry ? "Düzenle" : "Yeni Bilgi"}
      </h2>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Başlık *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Kategori</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as InfoCategory)} className={inputClass}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{INFO_CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={labelClass}>Alanlar</label>
            <button type="button" onClick={addField} className="text-xs text-[var(--accent)] hover:underline">+ Ekle</button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-[var(--muted-foreground)]">
                <th className="text-left pb-1 w-[30%]">Alan Adı</th>
                <th className="text-left pb-1">Değer</th>
                <th className="w-6"></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, idx) => (
                <tr key={idx}>
                  <td className="pr-1.5 py-0.5">
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) => updateField(idx, { key: e.target.value })}
                      placeholder="Alan"
                      className={`${inputClass} text-xs w-full`}
                    />
                  </td>
                  <td className="pr-1.5 py-0.5">
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => updateField(idx, { value: e.target.value })}
                      placeholder="Değer"
                      className={`${inputClass} text-xs font-mono w-full`}
                    />
                  </td>
                  <td className="py-0.5">
                    <button type="button" onClick={() => removeField(idx)} className="text-red-400 hover:text-red-300 text-sm">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <label className={labelClass}>Notlar</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`${inputClass} text-xs`} />
        </div>

        <div className="flex gap-2 pt-1">
          <Button onClick={handleSave} disabled={!title.trim()}>Kaydet</Button>
          <Button variant="ghost" onClick={() => entry ? setEditing(false) : onClose()}>İptal</Button>
        </div>
      </div>
    </Modal>
  );
}
