"use client";

import { useCallback } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconEdit } from "@/config/icons";
import type { AkademiKurs } from "@/types/akademi";
import {
  AKADEMI_DIFFICULTY_LABELS,
  AKADEMI_DIFFICULTY_VARIANTS,
} from "@/types/akademi";
import { useAkademiStore } from "../shared/akademiStore";

interface KursKartiProps {
  kurs: AkademiKurs;
  onSelect: (id: string) => void;
  onEdit: (kurs: AkademiKurs) => void;
}

export function KursKarti({ kurs, onSelect, onEdit }: KursKartiProps) {
  const adimlar = useAkademiStore((s) => s.adimlar);

  const handleClick = useCallback(() => {
    onSelect(kurs.id);
  }, [kurs.id, onSelect]);

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(kurs);
    },
    [kurs, onEdit]
  );

  const isPublished = kurs.status === "yayinda";

  return (
    <Card
      className="relative cursor-pointer group"
      onClick={handleClick}
    >
      {/* Düzenle Butonu */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5"
        onClick={handleEdit}
        aria-label="Kursu düzenle"
      >
        <IconEdit className="h-4 w-4" />
      </Button>

      <CardHeader className="mb-2">
        {/* İkon */}
        {kurs.icon && (
          <span className="text-3xl leading-none mb-2 block" aria-hidden="true">
            {kurs.icon}
          </span>
        )}
        <h3 className="text-base font-semibold text-[var(--foreground)] pr-8">
          {kurs.title}
        </h3>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-2">
          {kurs.description || "Açıklama eklenmemiş."}
        </p>
        <p className="text-xs text-[var(--muted-foreground)]">
          {kurs.software}
        </p>
      </CardContent>

      <CardFooter className="flex items-center gap-2 flex-wrap">
        <Badge variant={AKADEMI_DIFFICULTY_VARIANTS[kurs.difficulty]}>
          {AKADEMI_DIFFICULTY_LABELS[kurs.difficulty]}
        </Badge>

        {/* Durum göstergesi */}
        <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              isPublished ? "bg-[var(--accent)]" : "bg-[var(--muted-foreground)]"
            }`}
          />
          {isPublished ? "Yayında" : "Taslak"}
        </span>
      </CardFooter>
    </Card>
  );
}
