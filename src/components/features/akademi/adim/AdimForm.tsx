"use client";

// ============================================
// AdimForm — Adim ekleme/duzenleme formu
// ============================================

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useAkademiStore } from "../shared/akademiStore";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { IconArrowLeft, IconTrash } from "@/config/icons";
import { YouTubeEmbed } from "./YouTubeEmbed";
import { GorselYukleyici } from "../gorsel/GorselYukleyici";
import { MarkdownEditor } from "./MarkdownEditor";

export function AdimForm() {
  const adimlar = useAkademiStore((s) => s.adimlar);
  const selectedAdimId = useAkademiStore((s) => s.selectedAdimId);
  const selectedKursId = useAkademiStore((s) => s.selectedKursId);
  const goBack = useAkademiStore((s) => s.goBack);
  const addAdim = useAkademiStore((s) => s.addAdim);
  const updateAdim = useAkademiStore((s) => s.updateAdim);
  const deleteAdim = useAkademiStore((s) => s.deleteAdim);
  const selectAdim = useAkademiStore((s) => s.selectAdim);
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
  const [saved, setSaved] = useState(false);

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
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        // Yeni adım — kaydedilince düzenleme modunda kal
        const nextStep = adimlar.length > 0
          ? Math.max(...adimlar.map((a) => a.stepNumber)) + 1
          : 1;
        const newId = await addAdim({
          kursId: selectedKursId,
          stepNumber: nextStep,
          title: title.trim(),
          content: content.trim(),
          youtubeUrl: youtubeUrl.trim() || undefined,
        });
        if (newId) {
          selectAdim(newId);
        } else {
          goBack();
        }
      }
    } finally {
      setSaving(false);
    }
  }, [
    isValid, isEdit, editingAdim, selectedKursId,
    title, content, youtubeUrl, adimlar,
    addAdim, updateAdim, selectAdim, goBack,
  ]);

  // ─── Auto-save (sadece düzenleme modunda, 3sn debounce) ───
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    if (!isEdit || !editingAdim) return;

    // Değişiklik var mı kontrol et
    const hasChange =
      title.trim() !== editingAdim.title ||
      content.trim() !== editingAdim.content ||
      (youtubeUrl.trim() || "") !== (editingAdim.youtubeUrl || "");

    if (!hasChange || !title.trim() || !content.trim()) {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      return;
    }

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(async () => {
      setAutoSaveStatus("saving");
      await updateAdim(editingAdim.id, {
        title: title.trim(),
        content: content.trim(),
        youtubeUrl: youtubeUrl.trim() || undefined,
      });
      setAutoSaveStatus("saved");
      setTimeout(() => setAutoSaveStatus("idle"), 2000);
    }, 3000);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [title, content, youtubeUrl, isEdit, editingAdim, updateAdim]);

  // Sil
  const handleDelete = useCallback(async () => {
    if (editingAdim) {
      await deleteAdim(editingAdim.id);
    }
  }, [editingAdim, deleteAdim]);

  return (
    <div className="space-y-6">
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

        <div className="flex items-center gap-2">
          {/* Auto-save göstergesi */}
          {isEdit && autoSaveStatus !== "idle" && (
            <span className="text-xs text-[var(--muted-foreground)] animate-pulse">
              {autoSaveStatus === "saving" ? "Kaydediliyor..." : "✓ Kaydedildi"}
            </span>
          )}
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
          <Button variant="ghost" size="sm" onClick={goBack} disabled={saving}>
            {isEdit ? "Geri" : "İptal"}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={!isValid || saving}
          >
            {saving ? "Kaydediliyor..." : saved ? "✓ Kaydedildi" : "Kaydet"}
          </Button>
        </div>
      </div>

      {/* Form — iki kolon desktop, tek kolon mobil */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol: İçerik editörü */}
        <div className="lg:col-span-2 space-y-4">
          <FormInput
            label="Başlık"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Adım başlığı"
            error={title.length > 0 ? errors.title : undefined}
          />

          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="**Kalın**, *italik*, ## Başlık, - Liste, > Alıntı, `kod`, [link](url) kullanabilirsiniz..."
            error={content.length > 0 ? errors.content : undefined}
          />
        </div>

        {/* Sağ: Medya + ek bilgiler */}
        <div className="space-y-4">
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

          {/* YouTube */}
          <FormInput
            label="YouTube Video"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="YouTube video ID veya URL"
          />

          {youtubeUrl.trim() && (
            <YouTubeEmbed videoId={youtubeUrl} title={title || "Önizleme"} />
          )}
        </div>
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
