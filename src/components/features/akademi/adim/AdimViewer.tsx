"use client";

// ============================================
// AdimViewer — Kurs detay gorunumu (adimlar ile)
// ============================================

import { useState, useEffect, useCallback } from "react";
import { useAkademiStore } from "../shared/akademiStore";
import { Button } from "@/components/ui/Button";
import { IconArrowLeft, IconEdit, IconPlus } from "@/config/icons";
import { AdimNavigasyon } from "./AdimNavigasyon";
import { YouTubeEmbed } from "./YouTubeEmbed";
import { GorselGaleri } from "../gorsel/GorselGaleri";
import type { AkademiAdim, AkademiGorsel } from "@/types/akademi";

// ─── Sidebar (Desktop) ───

interface AdimSidebarProps {
  adimlar: AkademiAdim[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

function AdimSidebar({ adimlar, activeIndex, onSelect }: AdimSidebarProps) {
  return (
    <nav className="w-64 shrink-0 space-y-1" aria-label="Adim listesi">
      {adimlar.map((adim, i) => (
        <button
          key={adim.id}
          type="button"
          onClick={() => onSelect(i)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
            i === activeIndex
              ? "bg-[var(--accent)]/15 text-[var(--accent)] font-medium"
              : "text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
          }`}
        >
          <span className="mr-2 font-mono text-xs opacity-60">
            {adim.stepNumber}.
          </span>
          {adim.title}
        </button>
      ))}
    </nav>
  );
}

// ─── Progress Dots (Mobile) ───

interface ProgressDotsProps {
  total: number;
  current: number;
}

function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`inline-block w-2 h-2 rounded-full transition-colors ${
            i === current
              ? "bg-[var(--accent)]"
              : "bg-[var(--border)]"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Adim Icerik ───

interface AdimIcerikProps {
  adim: AkademiAdim;
  gorseller: AkademiGorsel[];
  onEdit: () => void;
}

function AdimIcerik({ adim, gorseller, onEdit }: AdimIcerikProps) {
  return (
    <div className="space-y-4">
      {/* Baslik + duzenle */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-[var(--foreground)]">
          {adim.title}
        </h3>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <IconEdit className="h-4 w-4 mr-1" />
          Düzenle
        </Button>
      </div>

      {/* Icerik */}
      <div
        className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-line"
      >
        {adim.content}
      </div>

      {/* Gorseller */}
      <GorselGaleri gorseller={gorseller} />

      {/* YouTube */}
      {adim.youtubeUrl && (
        <YouTubeEmbed videoId={adim.youtubeUrl} title={adim.title} />
      )}
    </div>
  );
}

// ─── Ana Component ───

export function AdimViewer() {
  const kurslar = useAkademiStore((s) => s.kurslar);
  const selectedKursId = useAkademiStore((s) => s.selectedKursId);
  const adimlar = useAkademiStore((s) => s.adimlar);
  const gorseller = useAkademiStore((s) => s.gorseller);
  const goBack = useAkademiStore((s) => s.goBack);
  const setView = useAkademiStore((s) => s.setView);
  const selectAdim = useAkademiStore((s) => s.selectAdim);
  const loadGorseller = useAkademiStore((s) => s.loadGorseller);

  const kurs = kurslar.find((k) => k.id === selectedKursId);
  const [activeIndex, setActiveIndex] = useState(0);

  // Ilk adimi sec
  useEffect(() => {
    if (adimlar.length > 0 && activeIndex >= adimlar.length) {
      setActiveIndex(0);
    }
  }, [adimlar, activeIndex]);

  // Aktif adimin gorsellerini yukle
  const aktifAdim = adimlar[activeIndex] ?? null;

  useEffect(() => {
    if (aktifAdim) {
      loadGorseller(aktifAdim.id);
    }
  }, [aktifAdim, loadGorseller]);

  const handleSelectStep = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const handleEdit = useCallback(() => {
    if (aktifAdim) {
      selectAdim(aktifAdim.id);
    }
  }, [aktifAdim, selectAdim]);

  const handleNewAdim = useCallback(() => {
    setView("adimDuzenle");
  }, [setView]);

  // Bos durum
  const emptyState = (
    <div className="flex flex-col items-center justify-center py-16 text-[var(--muted-foreground)] gap-3">
      <p className="text-sm">Bu kursta henüz adım yok.</p>
      <Button variant="primary" size="sm" onClick={handleNewAdim}>
        <IconPlus className="h-4 w-4 mr-1" />
        İlk Adımı Ekle
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={goBack}>
            <IconArrowLeft className="h-4 w-4 mr-1" />
            Kurslara Dön
          </Button>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {kurs?.title ?? "Kurs Detayı"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleNewAdim}>
            <IconPlus className="h-4 w-4 mr-1" />
            Yeni Adım
          </Button>
        </div>
      </div>

      {adimlar.length === 0 ? (
        emptyState
      ) : (
        <>
          {/* Mobile: progress dots + adim metni */}
          <div className="md:hidden space-y-3">
            <div className="space-y-1">
              <ProgressDots total={adimlar.length} current={activeIndex} />
              <p className="text-xs text-center text-[var(--muted-foreground)]">
                Adım {activeIndex + 1} / {adimlar.length}
              </p>
            </div>

            {aktifAdim && (
              <AdimIcerik
                adim={aktifAdim}
                gorseller={gorseller}
                onEdit={handleEdit}
              />
            )}

            <AdimNavigasyon
              adimlar={adimlar}
              currentIndex={activeIndex}
              onSelect={handleSelectStep}
            />
          </div>

          {/* Desktop: iki kolon */}
          <div className="hidden md:flex gap-6">
            <AdimSidebar
              adimlar={adimlar}
              activeIndex={activeIndex}
              onSelect={handleSelectStep}
            />
            <div className="flex-1 min-w-0">
              {aktifAdim ? (
                <div className="space-y-4">
                  <AdimIcerik
                    adim={aktifAdim}
                    gorseller={gorseller}
                    onEdit={handleEdit}
                  />
                  <AdimNavigasyon
                    adimlar={adimlar}
                    currentIndex={activeIndex}
                    onSelect={handleSelectStep}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center py-16 text-[var(--muted-foreground)] text-sm">
                  Bir adım seçin
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
