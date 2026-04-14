"use client";

import { useState, useCallback } from "react";
import { useAkademiStore } from "../shared/akademiStore";
import { Modal } from "@/components/ui/Modal";
import { Button, FormInput, FormSelect, FormTextarea } from "@/components/ui";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { IconTrash } from "@/config/icons";
import type { AkademiKurs, AkademiDifficulty, AkademiStatus } from "@/types/akademi";
import {
  AKADEMI_DIFFICULTY_LABELS,
  AKADEMI_STATUS_LABELS,
} from "@/types/akademi";

interface KursFormProps {
  open: boolean;
  onClose: () => void;
  kurs?: AkademiKurs;
}

export function KursForm({ open, onClose, kurs }: KursFormProps) {
  const addKurs = useAkademiStore((s) => s.addKurs);
  const updateKurs = useAkademiStore((s) => s.updateKurs);
  const deleteKurs = useAkademiStore((s) => s.deleteKurs);

  const isEdit = !!kurs;

  const [title, setTitle] = useState(kurs?.title ?? "");
  const [software, setSoftware] = useState(kurs?.software ?? "");
  const [description, setDescription] = useState(kurs?.description ?? "");
  const [icon, setIcon] = useState(kurs?.icon ?? "");
  const [difficulty, setDifficulty] = useState<AkademiDifficulty>(
    kurs?.difficulty ?? "baslangic"
  );
  const [status, setStatus] = useState<AkademiStatus>(
    kurs?.status ?? "taslak"
  );
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Form kurs degistiginde resetlensin
  const resetAndClose = useCallback(() => {
    setTitle(kurs?.title ?? "");
    setSoftware(kurs?.software ?? "");
    setDescription(kurs?.description ?? "");
    setIcon(kurs?.icon ?? "");
    setDifficulty(kurs?.difficulty ?? "baslangic");
    setStatus(kurs?.status ?? "taslak");
    setSaving(false);
    setConfirmOpen(false);
    onClose();
  }, [kurs, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || !software.trim()) return;
    setSaving(true);
    try {
      if (isEdit && kurs) {
        await updateKurs(kurs.id, {
          title: title.trim(),
          software: software.trim(),
          description: description.trim(),
          icon: icon.trim() || undefined,
          difficulty,
          status,
        });
      } else {
        await addKurs({
          title: title.trim(),
          software: software.trim(),
          description: description.trim(),
          icon: icon.trim() || undefined,
          difficulty,
          status,
          sortOrder: 0,
        });
      }
      resetAndClose();
    } finally {
      setSaving(false);
    }
  }, [
    title, software, description, icon, difficulty, status,
    isEdit, kurs, addKurs, updateKurs, resetAndClose,
  ]);

  const handleDelete = useCallback(async () => {
    if (!kurs) return;
    await deleteKurs(kurs.id);
    resetAndClose();
  }, [kurs, deleteKurs, resetAndClose]);

  return (
    <>
      <Modal
        open={open}
        onClose={resetAndClose}
        ariaLabel={isEdit ? "Kurs Duzenle" : "Yeni Kurs"}
      >
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          {isEdit ? "Kursu Duzenle" : "Yeni Kurs"}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          <FormInput
            label="Kurs Adi"
            required
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ornegin: Metashape Is Akisi"
          />

          <FormInput
            label="Yazilim"
            required
            type="text"
            value={software}
            onChange={(e) => setSoftware(e.target.value)}
            placeholder="ornegin: Agisoft Metashape"
          />

          <FormTextarea
            label="Aciklama"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Kurs hakkinda kisa aciklama..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="Ikon (Emoji)"
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="ornegin: &#128247;"
            />

            <FormSelect
              label="Zorluk"
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value as AkademiDifficulty)
              }
            >
              {Object.entries(AKADEMI_DIFFICULTY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </FormSelect>

            <FormSelect
              label="Durum"
              value={status}
              onChange={(e) => setStatus(e.target.value as AkademiStatus)}
            >
              {Object.entries(AKADEMI_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </FormSelect>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {isEdit && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => setConfirmOpen(true)}
                >
                  <IconTrash className="h-4 w-4 mr-1" />
                  Sil
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetAndClose}
                disabled={saving}
              >
                Iptal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!title.trim() || !software.trim() || saving}
              >
                {saving ? "Kaydediliyor..." : isEdit ? "Guncelle" : "Olustur"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Silme Onay Dialogu */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Kursu Sil"
        description="Bu kurs ve tum adimlari kalici olarak silinecek. Bu islem geri alinamaz."
        confirmText="Sil"
        cancelText="Iptal"
      />
    </>
  );
}
