"use client";

// ============================================
// GorselGaleri — Adim gorselleri galeri gorunumu
// ============================================

import { useState, useCallback, useEffect } from "react";
import type { AkademiGorsel } from "@/types/akademi";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { IconClose, IconArrowLeft, IconArrowRight } from "@/config/icons";
import { AnnotationRenderer } from "../annotation/AnnotationRenderer";

interface GorselGaleriProps {
  gorseller: AkademiGorsel[];
}

export function GorselGaleri({ gorseller }: GorselGaleriProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const isOpen = selectedIndex >= 0 && selectedIndex < gorseller.length;
  const selectedGorsel = isOpen ? gorseller[selectedIndex] : null;

  const close = useCallback(() => setSelectedIndex(-1), []);
  const prev = useCallback(() => setSelectedIndex((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => setSelectedIndex((i) => Math.min(gorseller.length - 1, i + 1)), [gorseller.length]);

  // Klavye ile gezinme
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, prev, next]);

  if (gorseller.length === 0) return null;

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {gorseller.map((gorsel, i) => (
          <GorselKart
            key={gorsel.id}
            gorsel={gorsel}
            onClick={() => setSelectedIndex(i)}
          />
        ))}
      </div>

      {/* Lightbox modal */}
      <Modal
        open={isOpen}
        onClose={close}
        className="sm:max-w-5xl p-2 sm:p-4"
        ariaLabel="Gorsel onizleme"
      >
        {selectedGorsel && (
          <div className="space-y-3">
            {/* Üst bar: sayaç + kapat */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--muted-foreground)]">
                {selectedIndex + 1} / {gorseller.length}
              </span>
              <Button variant="ghost" size="sm" onClick={close} aria-label="Kapat">
                <IconClose className="h-4 w-4" />
              </Button>
            </div>

            {/* Görsel + navigasyon okları */}
            <div className="relative rounded-lg overflow-hidden border border-[var(--border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedGorsel.imageUrl}
                alt={selectedGorsel.caption ?? selectedGorsel.fileName}
                className="w-full h-auto object-contain max-h-[80vh]"
              />
              {selectedGorsel.annotations?.length > 0 && (
                <AnnotationRenderer annotations={selectedGorsel.annotations} />
              )}

              {/* Sol ok */}
              {selectedIndex > 0 && (
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 p-3 sm:p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Önceki"
                >
                  <IconArrowLeft className="h-5 w-5" />
                </button>
              )}
              {/* Sağ ok */}
              {selectedIndex < gorseller.length - 1 && (
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 p-3 sm:p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Sonraki"
                >
                  <IconArrowRight className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Alt yazı */}
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
        {gorsel.annotations?.length > 0 && (
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
