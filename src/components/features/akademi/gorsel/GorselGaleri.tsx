"use client";

// ============================================
// GorselGaleri — Adim gorselleri galeri gorunumu
// ============================================

import { useState, useCallback, useEffect, useRef } from "react";
import type { AkademiGorsel } from "@/types/akademi";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { IconClose, IconArrowLeft, IconArrowRight } from "@/config/icons";
import { AnnotationRenderer } from "../annotation/AnnotationRenderer";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <div className="flex flex-col gap-6">
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
        className="w-[95vw] max-w-[1400px] sm:max-w-[1400px] p-2 sm:p-4"
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
            <div className="relative rounded-lg overflow-hidden border border-[var(--border)] bg-black/5 dark:bg-white/5">
              <ZoomableImage gorsel={selectedGorsel} />

              {/* Sol ok */}
              {selectedIndex > 0 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 p-3 sm:p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center z-20 shadow-lg"
                  aria-label="Önceki"
                >
                  <IconArrowLeft className="h-5 w-5" />
                </button>
              )}
              {/* Sağ ok */}
              {selectedIndex < gorseller.length - 1 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 p-3 sm:p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center z-20 shadow-lg"
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
      className="group flex flex-col items-center rounded-xl border border-[var(--border)] overflow-hidden bg-black/5 dark:bg-white/5 hover:border-[var(--accent)] shadow-sm hover:shadow-md transition-all text-left w-full cursor-zoom-in"
    >
      <div className="relative inline-block max-w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={gorsel.imageUrl}
          alt={gorsel.caption ?? gorsel.fileName}
          className="max-w-full w-auto h-auto block opacity-95 group-hover:opacity-100 transition-opacity"
          style={{ maxHeight: "60vh" }}
          loading="lazy"
        />
        {gorsel.annotations && gorsel.annotations.length > 0 && (
          <AnnotationRenderer annotations={gorsel.annotations} />
        )}
      </div>
      {gorsel.caption && (
        <div className="w-full bg-[var(--surface)] p-3 border-t border-[var(--border)] mt-auto">
          <p className="text-sm font-medium text-center text-[var(--foreground)]">
            {gorsel.caption}
          </p>
        </div>
      )}
    </button>
  );
}

// ─── Zoom Edilebilir Görsel Bileşeni ───

function ZoomableImage({ gorsel }: { gorsel: AkademiGorsel }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [gorsel.id]);

  const updateZoom = (delta: number) => {
    setScale((prev) => {
      const newScale = Math.min(Math.max(1, prev + delta), 10);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSensitivity = 0.005;
      updateZoom(-e.deltaY * zoomSensitivity);
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || scale === 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale === 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full flex items-center justify-center touch-none outline-none overflow-hidden min-h-[300px]",
        scale > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
      )}
      style={{ maxHeight: "clamp(300px, calc(100vh - 8rem), 900px)" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="relative transition-transform duration-75 origin-center inline-flex justify-center items-center"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={gorsel.imageUrl}
          alt={gorsel.caption ?? gorsel.fileName}
          className="max-w-full w-auto h-auto object-contain pointer-events-none"
          style={{ maxHeight: "clamp(300px, calc(100vh - 8rem), 900px)" }}
        />
        {gorsel.annotations && gorsel.annotations.length > 0 && (
          <AnnotationRenderer annotations={gorsel.annotations} />
        )}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/70 text-white rounded-full p-1.5 backdrop-blur-sm shadow-xl z-30 pointer-events-auto">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); updateZoom(-0.5); }}
          className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Uzaklaş"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="text-xs font-medium w-12 text-center select-none shadow-sm">
          {Math.round(scale * 100)}%
        </span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); updateZoom(0.5); }}
          className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Yakınlaş"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <div className="w-px h-4 bg-white/30 mx-1" />
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setScale(1); setPosition({x:0, y:0}); }}
          className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Sıfırla"
        >
          <Maximize className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
