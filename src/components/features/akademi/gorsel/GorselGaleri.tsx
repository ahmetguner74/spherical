"use client";

// ============================================
// GorselGaleri — Adim gorselleri galeri gorunumu
// ============================================

import { useState } from "react";
import type { AkademiGorsel } from "@/types/akademi";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { IconClose } from "@/config/icons";
import { AnnotationRenderer } from "../annotation/AnnotationRenderer";

interface GorselGaleriProps {
  gorseller: AkademiGorsel[];
}

export function GorselGaleri({ gorseller }: GorselGaleriProps) {
  const [selectedGorsel, setSelectedGorsel] = useState<AkademiGorsel | null>(
    null
  );

  if (gorseller.length === 0) return null;

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {gorseller.map((gorsel) => (
          <GorselKart
            key={gorsel.id}
            gorsel={gorsel}
            onClick={() => setSelectedGorsel(gorsel)}
          />
        ))}
      </div>

      {/* Tam ekran modal */}
      <Modal
        open={!!selectedGorsel}
        onClose={() => setSelectedGorsel(null)}
        className="max-w-4xl p-2 sm:p-4"
        ariaLabel="Gorsel onizleme"
      >
        {selectedGorsel && (
          <div className="space-y-3">
            {/* Kapat */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedGorsel(null)}
              >
                <IconClose className="h-4 w-4" />
              </Button>
            </div>

            {/* Gorsel */}
            <div className="relative rounded-lg overflow-hidden border border-[var(--border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedGorsel.imageUrl}
                alt={selectedGorsel.caption ?? selectedGorsel.fileName}
                className="w-full h-auto object-contain max-h-[75vh]"
              />
              {selectedGorsel.annotations.length > 0 && (
                <AnnotationRenderer annotations={selectedGorsel.annotations} />
              )}
            </div>

            {/* Alt yazi */}
            {selectedGorsel.caption && (
              <p className="text-sm text-[var(--muted-foreground)] text-center">
                {selectedGorsel.caption}
              </p>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

// ─── Kucuk gorsel karti ───

interface GorselKartProps {
  gorsel: AkademiGorsel;
  onClick: () => void;
}

function GorselKart({ gorsel, onClick }: GorselKartProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--surface)] hover:border-[var(--accent)] transition-colors text-left"
    >
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={gorsel.imageUrl}
          alt={gorsel.caption ?? gorsel.fileName}
          className="w-full h-40 object-cover group-hover:opacity-90 transition-opacity"
          loading="lazy"
        />
        {gorsel.annotations.length > 0 && (
          <AnnotationRenderer annotations={gorsel.annotations} />
        )}
      </div>
      {gorsel.caption && (
        <p className="px-2 py-1.5 text-xs text-[var(--muted-foreground)] truncate">
          {gorsel.caption}
        </p>
      )}
    </button>
  );
}
