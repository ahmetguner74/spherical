"use client";

import { useState, useCallback } from "react";
import { useAkademiStore } from "../shared/akademiStore";
import { KursKarti } from "./KursKarti";
import { KursForm } from "./KursForm";
import { Button } from "@/components/ui/Button";
import { IconPlus, IconAkademi } from "@/config/icons";
import type { AkademiKurs } from "@/types/akademi";

export function KursListesi() {
  const kurslar = useAkademiStore((s) => s.kurslar);
  const selectKurs = useAkademiStore((s) => s.selectKurs);

  const [formOpen, setFormOpen] = useState(false);
  const [editingKurs, setEditingKurs] = useState<AkademiKurs | undefined>(undefined);

  const handleAdd = useCallback(() => {
    setEditingKurs(undefined);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((kurs: AkademiKurs) => {
    setEditingKurs(kurs);
    setFormOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setFormOpen(false);
    setEditingKurs(undefined);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <IconAkademi className="h-6 w-6 text-[var(--accent)]" />
            Akademi
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Yazılım iş akışları ve eğitim rehberleri.
          </p>
        </div>
        <Button size="sm" onClick={handleAdd}>
          <IconPlus className="h-4 w-4 mr-1" />
          Yeni Kurs
        </Button>
      </div>

      {/* Grid veya Boş Durum */}
      {kurslar.length === 0 ? (
        <EmptyState onAdd={handleAdd} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kurslar.map((kurs) => (
            <KursKarti
              key={kurs.id}
              kurs={kurs}
              onSelect={selectKurs}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Kurs Ekle/Düzenle Modalı */}
      <KursForm open={formOpen} onClose={handleClose} kurs={editingKurs} />
    </div>
  );
}

// ─── Boş Durum ───

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <IconAkademi className="h-12 w-12 text-[var(--muted-foreground)] mb-4" />
      <p className="text-[var(--muted-foreground)] mb-4">
        Henüz kurs eklenmedi. İlk kursunuzu oluşturun!
      </p>
      <Button size="sm" onClick={onAdd}>
        <IconPlus className="h-4 w-4 mr-1" />
        İlk Kursu Oluştur
      </Button>
    </div>
  );
}
