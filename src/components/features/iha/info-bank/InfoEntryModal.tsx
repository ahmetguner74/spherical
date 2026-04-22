"use client";

import { useState } from "react";
import { usePermission } from "@/hooks/usePermission";
import { Modal } from "@/components/ui/Modal";
import { Button, FormInput, FormSelect } from "@/components/ui";
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
  if (!isOpen) {
    return null;
  }

  return (
    <InfoEntryModalContent
      key={entry?.id ?? "new"}
      entry={entry}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
    />
  );
}

function InfoEntryModalContent({
  entry,
  onClose,
  onSave,
  onDelete,
}: Omit<InfoEntryModalProps, "isOpen">) {
  const can = usePermission();
  const [editing, setEditing] = useState(() => !entry);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [title, setTitle] = useState(() => entry?.title ?? "");
  const [category, setCategory] = useState<InfoCategory>(() => entry?.category ?? "hesap");
  const [fields, setFields] = useState<InfoField[]>(() => entry?.fields?.map((field) => ({ ...field })) ?? [{ key: "", value: "" }]);
  const [notes, setNotes] = useState(() => entry?.notes ?? "");

  const addField = () => setFields([...fields, { key: "", value: "" }]);
  const updateField = (idx: number, updates: Partial<InfoField>) =>
    setFields(fields.map((field, i) => (i === idx ? { ...field, ...updates } : field)));
  const removeField = (idx: number) => setFields(fields.filter((_, i) => i !== idx));

  const handleSave = () => {
    if (!title.trim()) return;
    const validFields = fields.filter((field) => field.key.trim() && field.value.trim());
    onSave({ title: title.trim(), category, fields: validFields, notes: notes || undefined });
  };

  const copy = (text: string) => navigator.clipboard.writeText(text);

  const labelClass = "block text-xs text-[var(--muted-foreground)] mb-1";

  if (!editing && entry) {
    return (
      <Modal open onClose={onClose}>
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
                  type="button"
                  onClick={() => copy(field.value)}
                  title="TÄ±kla kopyala"
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
            <Button
              type="button"
              onClick={() => {
                setTitle(entry.title);
                setCategory(entry.category);
                setFields(entry.fields.map((field) => ({ ...field })));
                setNotes(entry.notes ?? "");
                setEditing(true);
              }}
            >
              DÃ¼zenle
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>Kapat</Button>
          </div>

          {can("infobank.delete") && (
            <>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => setConfirmOpen(true)}
                className="w-full"
              >
                Sil
              </Button>
              <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={() => onDelete(entry.id)}
                title="Bilgi KaydÄ±nÄ± Sil"
                description={`"${entry.title}" kalÄ±cÄ± olarak silinecek. Bu iÅŸlem geri alÄ±namaz.`}
              />
            </>
          )}
        </div>
      </Modal>
    );
  }

  return (
    <Modal open onClose={onClose}>
      <h2 className="text-base font-bold text-[var(--foreground)] mb-4">
        {entry ? "DÃ¼zenle" : "Yeni Bilgi"}
      </h2>

      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormInput label="BaÅŸlÄ±k" required type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          <FormSelect label="Kategori" value={category} onChange={(e) => setCategory(e.target.value as InfoCategory)}>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>{INFO_CATEGORY_LABELS[item]}</option>
            ))}
          </FormSelect>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={labelClass}>Alanlar</label>
            <Button type="button" variant="ghost" size="sm" onClick={addField} className="text-[var(--accent)]">+ Ekle</Button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-[var(--muted-foreground)]">
                <th className="text-left pb-1 w-[30%]">Alan AdÄ±</th>
                <th className="text-left pb-1">DeÄŸer</th>
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
                      placeholder="DeÄŸer"
                      className={`${inputClass} text-xs font-mono w-full`}
                    />
                  </td>
                  <td className="py-0.5">
                    <button
                      type="button"
                      onClick={() => removeField(idx)}
                      className="text-[var(--feedback-error)] hover:text-red-300 text-sm"
                      aria-label="AlanÄ± sil"
                      title="AlanÄ± sil"
                    >Ã—</button>
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
          <Button type="button" onClick={handleSave} disabled={!title.trim()}>Kaydet</Button>
          <Button type="button" variant="ghost" onClick={() => entry ? setEditing(false) : onClose()}>Ä°ptal</Button>
        </div>
      </div>
    </Modal>
  );
}
