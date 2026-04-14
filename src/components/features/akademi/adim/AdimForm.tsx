"use client";

// ============================================
// AdimForm — Adim ekleme/duzenleme formu
// ============================================

import { useState, useCallback, useMemo, useEffect } from "react";
import { useAkademiStore } from "../shared/akademiStore";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { IconArrowLeft, IconTrash } from "@/config/icons";
import { YouTubeEmbed } from "./YouTubeEmbed";
import { GorselYukleyici } from "../gorsel/GorselYukleyici";

export function AdimForm() {
  const adimlar = useAkademiStore((s) => s.adimlar);
  const selectedAdimId = useAkademiStore((s) => s.selectedAdimId);
  const selectedKursId = useAkademiStore((s) => s.selectedKursId);
  const goBack = useAkademiStore((s) => s.goBack);
  const addAdim = useAkademiStore((s) => s.addAdim);
  const updateAdim = useAkademiStore((s) => s.updateAdim);
  const deleteAdim = useAkademiStore((s) => s.deleteAdim);
  const gorseller = useAkademiStore((s) => s.gorseller);
  const loadGorseller = useAkademiStore((s) => s.loadGorseller);

  const editingAdim = useMemo(
    () => adimlar.find((a) => a.id === selectedAdimId) ?? null,
    [adimlar, selectedAdimId]
  );

  const isEdit = !!editingAdim;

  // Form state
  const [title, setTitle] = useState(editingAdim?.title ?? "");
  const [content, setContent] = useState(editingAdim?.content ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(editingAdim?.youtubeUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Düzenleme modunda görselleri yükle
  useEffect(() => {
    if (editingAdim?.id) {
      loadGorseller(editingAdim.id);
    }
  }, [editingAdim?.id, loadGorseller]);

  // Validation
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Başlık zorunludur";
    if (!content.trim()) e.content = "İçerik zorunludur";
    return e;
  }, [title, content]);

  const isValid = Object.keys(errors).length === 0;

  // Kaydet
  const handleSave = useCallback(async () => {
    if (!isValid || !selectedKursId) return;
    setSaving(true);
    try {
      if (isEdit && editingAdim) {
        await updateAdim(editingAdim.id, {
          title: title.trim(),
          content: content.trim(),
          youtubeUrl: youtubeUrl.trim() || undefined,
        });
      } else {
        const nextStep = adimlar.length > 0
          ? Math.max(...adimlar.map((a) => a.stepNumber)) + 1
          : 1;
        await addAdim({
          kursId: selectedKursId,
          stepNumber: nextStep,
          title: title.trim(),
          content: content.trim(),
          youtubeUrl: youtubeUrl.trim() || undefined,
        });
      }
      goBack();
    } finally {
      setSaving(false);
    }
  }, [
    isValid, isEdit, editingAdim, selectedKursId,
    title, content, youtubeUrl, adimlar,
    addAdim, updateAdim, goBack,
  ]);

  // Sil
  const handleDelete = useCallback(async () => {
    if (editingAdim) {
      await deleteAdim(editingAdim.id);
    }
  }, [editingAdim, deleteAdim]);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={goBack}>
            <IconArrowLeft className="h-4 w-4 mr-1" />
            Geri
          </Button>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {isEdit ? "Adım Düzenle" : "Yeni Adım"}
          </h2>
        </div>

        {isEdit && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setConfirmOpen(true)}
          >
            <IconTrash className="h-4 w-4 mr-1" />
            Sil
          </Button>
        )}
      </div>

      {/* Form */}
      <div className="space-y-4">
        <FormInput
          label="Başlık"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Adım başlığı"
          error={title.length > 0 ? errors.title : undefined}
        />

        <FormTextarea
          label="İçerik"
          required
          rows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Adım içeriği..."
          error={content.length > 0 ? errors.content : undefined}
        />

        <FormInput
          label="YouTube Video"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="YouTube video ID veya URL"
        />

        {/* YouTube onizleme */}
        {youtubeUrl.trim() && (
          <div className="space-y-1">
            <p className="text-xs text-[var(--muted-foreground)]">Önizleme</p>
            <YouTubeEmbed videoId={youtubeUrl} title={title || "Önizleme"} />
          </div>
        )}

        {/* Görseller */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)]">
            Görseller
          </label>
          {isEdit && editingAdim && selectedKursId ? (
            <GorselYukleyici
              adimId={editingAdim.id}
              kursId={selectedKursId}
              gorseller={gorseller}
            />
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center">
              <p className="text-sm text-[var(--muted-foreground)]">
                Görselleri eklemek için önce adımı kaydedin
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Butonlar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
        <Button variant="ghost" size="sm" onClick={goBack} disabled={saving}>
          İptal
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={!isValid || saving}
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>

      {/* Silme onay */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Adımı Sil"
        description="Bu adım ve ilişkili tüm görseller kalıcı olarak silinecek. Devam etmek istiyor musunuz?"
        confirmText="Sil"
        cancelText="İptal"
      />
    </div>
  );
}
