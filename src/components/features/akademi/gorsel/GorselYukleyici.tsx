"use client";

// ============================================
// GorselYukleyici — Ekran goruntusu yukleyici
// ============================================

import { useRef, useState, useCallback } from "react";
import type { AkademiGorsel, Annotation } from "@/types/akademi";
import { useAkademiStore } from "../shared/akademiStore";
import { uploadScreenshot } from "../shared/akademiStorage";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AnnotationEditor } from "../annotation/AnnotationEditor";
import { IconPlus, IconTrash, IconEdit, IconLoader } from "@/config/icons";
import { useToast } from "@/components/ui/Toast";
import { logger } from "@/lib/logger";

// ─── Props ───

interface GorselYukleyiciProps {
  adimId: string;
  kursId: string;
  gorseller: AkademiGorsel[];
}

// ─── Component ───

export function GorselYukleyici({
  adimId,
  kursId,
  gorseller,
}: GorselYukleyiciProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState<{ done: number; total: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AkademiGorsel | null>(null);
  const [annotateTarget, setAnnotateTarget] = useState<AkademiGorsel | null>(null);

  const addGorsel = useAkademiStore((s) => s.addGorsel);
  const deleteGorsel = useAkademiStore((s) => s.deleteGorsel);
  const updateGorsel = useAkademiStore((s) => s.updateGorsel);

  // ─── Çoklu dosya yükleme ───
  const uploadFiles = useCallback(
    async (files: File[]) => {
      const imageFiles = files.filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length === 0) return;

      setUploading(true);
      setUploadCount({ done: 0, total: imageFiles.length });

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        try {
          const imageUrl = await uploadScreenshot(kursId, adimId, file);
          await addGorsel({
            adimId,
            imageUrl,
            fileName: file.name,
            sortOrder: gorseller.length + i,
            annotations: [],
          });
        } catch (err) {
          logger.error("GorselYukleyici upload", err);
          useToast.getState().add(`"${file.name}" yüklenemedi`, "error");
        }
        setUploadCount({ done: i + 1, total: imageFiles.length });
      }

      setUploading(false);
      setUploadCount(null);
    },
    [kursId, adimId, gorseller.length, addGorsel]
  );

  // ─── File input handler ───
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      uploadFiles(files);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [uploadFiles]
  );

  // ─── Drag & Drop handlers ───
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files);
      uploadFiles(files);
    },
    [uploadFiles]
  );

  // ─── Delete handler ───
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteGorsel(deleteTarget.id, deleteTarget.imageUrl);
    setDeleteTarget(null);
  }, [deleteTarget, deleteGorsel]);

  // ─── Annotation save handler ───
  const handleAnnotationSave = useCallback(
    async (annotations: Annotation[]) => {
      if (!annotateTarget) return;
      try {
        await updateGorsel(annotateTarget.id, { annotations });
      } catch (err) {
        logger.error("GorselYukleyici annotation save", err);
        useToast.getState().add("Notasyonlar kaydedilemedi", "error");
      }
    },
    [annotateTarget, updateGorsel]
  );

  const uploadLabel = uploadCount
    ? `${uploadCount.done}/${uploadCount.total} yükleniyor...`
    : "Yükleniyor...";

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {gorseller.map((gorsel) => (
          <ThumbnailKart
            key={gorsel.id}
            gorsel={gorsel}
            onAnnotate={setAnnotateTarget}
            onDelete={setDeleteTarget}
          />
        ))}

        {/* Upload / Drop zone */}
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-[var(--surface)] text-[var(--muted-foreground)] transition-colors min-h-[8rem] disabled:opacity-50 disabled:pointer-events-none ${
            dragging
              ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] scale-[1.02]"
              : "border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          }`}
        >
          {uploading ? (
            <IconLoader className="h-6 w-6 animate-spin" />
          ) : (
            <IconPlus className="h-6 w-6" />
          )}
          <span className="text-xs text-center px-2">
            {uploading ? uploadLabel : "Görsel Ekle\nveya sürükle bırak"}
          </span>
        </button>
      </div>

      {/* Büyük drop zone — görseller varsa grid dışı alan */}
      {gorseller.length > 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mt-2 rounded-lg border-2 border-dashed p-4 text-center text-xs transition-colors ${
            dragging
              ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
              : "border-transparent text-transparent hover:border-[var(--border)] hover:text-[var(--muted-foreground)]"
          }`}
        >
          Görselleri buraya sürükleyebilirsiniz
        </div>
      )}

      {/* Hidden file input — çoklu seçim */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Görseli Sil"
        description="Bu görsel kalıcı olarak silinecek. Devam etmek istiyor musunuz?"
        confirmText="Sil"
        cancelText="İptal"
      />

      {/* Annotation editor modal */}
      <AnnotationEditor
        open={!!annotateTarget}
        onClose={() => setAnnotateTarget(null)}
        imageUrl={annotateTarget?.imageUrl ?? ""}
        initialAnnotations={annotateTarget?.annotations ?? []}
        onSave={handleAnnotationSave}
      />
    </>
  );
}

// ─── Thumbnail karti ───

interface ThumbnailKartProps {
  gorsel: AkademiGorsel;
  onAnnotate?: (gorsel: AkademiGorsel) => void;
  onDelete: (gorsel: AkademiGorsel) => void;
}

function ThumbnailKart({ gorsel, onAnnotate, onDelete }: ThumbnailKartProps) {
  return (
    <div className="group relative rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={gorsel.imageUrl}
        alt={gorsel.caption ?? gorsel.fileName}
        className="w-full h-32 object-cover"
        loading="lazy"
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        {onAnnotate && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onAnnotate(gorsel)}
            aria-label="Düzenle"
          >
            <IconEdit className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDelete(gorsel)}
          aria-label="Sil"
        >
          <IconTrash className="h-4 w-4" />
        </Button>
      </div>

      {/* Caption */}
      {gorsel.caption && (
        <p className="px-2 py-1.5 text-xs text-[var(--muted-foreground)] truncate">
          {gorsel.caption}
        </p>
      )}
    </div>
  );
}
