"use client";

// ============================================
// AdimNavigasyon — Adim ileri/geri navigasyonu
// ============================================

import type { AkademiAdim } from "@/types/akademi";
import { Button } from "@/components/ui/Button";
import { IconArrowLeft, IconArrowRight } from "@/config/icons";

interface AdimNavigasyonProps {
  adimlar: AkademiAdim[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export function AdimNavigasyon({
  adimlar,
  currentIndex,
  onSelect,
}: AdimNavigasyonProps) {
  const total = adimlar.length;
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex >= total - 1;

  return (
    <div className="flex items-center justify-between gap-2 pt-4 border-t border-[var(--border)]">
      <Button
        variant="ghost"
        size="sm"
        disabled={isFirst}
        onClick={() => onSelect(currentIndex - 1)}
      >
        <IconArrowLeft className="h-4 w-4 mr-1" />
        Önceki Adım
      </Button>

      <span className="text-sm text-[var(--muted-foreground)]">
        Adım {currentIndex + 1} / {total}
      </span>

      <Button
        variant="ghost"
        size="sm"
        disabled={isLast}
        onClick={() => onSelect(currentIndex + 1)}
      >
        Sonraki Adım
        <IconArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
