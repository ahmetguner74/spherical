"use client";

import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

/**
 * Boş liste durumlarında gösterilen ortak bileşen.
 * Tüm sekmelerde aynı görsel ile boş durumlar gösterilir:
 * - Opsiyonel emoji/ikon
 * - Başlık (ör: "Henüz operasyon yok")
 * - Açıklama (ör: "İlk operasyonunu oluşturmak için aşağıdaki butona bas")
 * - CTA butonu (ör: "+ Yeni Operasyon")
 */
export function EmptyState({ icon, title, description, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      {icon && <div className="text-4xl mb-3">{icon}</div>}
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-[var(--muted-foreground)] mb-4 max-w-xs mx-auto">
          {description}
        </p>
      )}
      {ctaLabel && onCta && (
        <Button onClick={onCta} size="sm">
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
