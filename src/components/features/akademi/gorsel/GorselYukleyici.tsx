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
  const [deleteTarget, setDeleteTarget] = useState<AkademiGorsel | null>(null);
  const [annotateTarget, setAnnotateTarget] = useState<AkademiGorsel | null>(null);

  const addGorsel = useAkademiStore((s) => s.addGorsel);
  const deleteGorsel = useAkademiStore((s) => s.deleteGorsel);
  const updateGorsel = useAkademiStore((s) => s.updateGorsel);

  // ─── Upload handler ───
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      try {
        const imageUrl = await uploadScreenshot(kursId, adimId, file);
        await addGorsel({
          adimId,
          imageUrl,
          fileName: file.name,
          sortOrder: gorseller.length,
          annotations: [],
        });
      } catch (err) {
        logger.error("GorselYukleyici upload", err);
      } finally {
        setUploading(false);
        // Reset input so same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [kursId, adimId, gorseller.length, addGorsel]
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
      }
    },
    [annotateTarget, updateGorsel]
  );

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

        {/* Upload button */}
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors min-h-[8rem] disabled:opacity-50 disabled:pointer-events-none"
        >
          {uploading ? (
            <IconLoader className="h-6 w-6 animate-spin" />
          ) : (
            <IconPlus className="h-6 w-6" />
          )}
          <span className="text-xs">
            {uploading ? "Yükleniyor..." : "Görsel Ekle"}
          </span>
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
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
      {annotateTarget && (
        <AnnotationEditor
          open={!!annotateTarget}
          onClose={() => setAnnotateTarget(null)}
          imageUrl={annotateTarget.imageUrl}
          initialAnnotations={annotateTarget.annotations ?? []}
          onSave={handleAnnotationSave}
        />
      )}
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
      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
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
