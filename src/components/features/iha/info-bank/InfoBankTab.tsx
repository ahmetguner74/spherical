"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchInfoBank, upsertInfoEntry, deleteInfoEntry, addAuditEntry } from "../shared/ihaStorage";
import { useIhaStore } from "../shared/ihaStore";
import { useToast } from "@/components/ui/Toast";
import { InfoCard } from "./InfoCard";
import { InfoEntryModal } from "./InfoEntryModal";
import { VehicleEventsPanel } from "./VehicleEventsPanel";
import { ViewToolbar } from "../shared/ViewToolbar";
import { EmptyState } from "../shared/EmptyState";
import { inputClass } from "../shared/styles";
import { INFO_CATEGORY_LABELS } from "@/types/iha";
import type { InfoEntry, InfoCategory } from "@/types/iha";

type InfoBankView = InfoCategory | "arac_takip";

const CATEGORIES: InfoCategory[] = ["hesap", "lisans", "ag", "sigorta", "diger"];

const VIEWS = [
  ...CATEGORIES.map((c) => ({ key: c, label: INFO_CATEGORY_LABELS[c] })),
  { key: "arac_takip", label: "Araç Takip" },
];

export function InfoBankTab() {
  const [view, setView] = useState<InfoBankView>("hesap");
  const [entries, setEntries] = useState<InfoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<InfoEntry | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchInfoBank()
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const isCategory = view !== "arac_takip";
  const currentCategory = isCategory ? (view as InfoCategory) : null;

  const filtered = entries.filter((e) => {
    if (currentCategory && e.category !== currentCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      const searchable = [e.title, e.notes, ...e.fields.map((f) => f.key + " " + f.value)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });

  const handleAdd = () => {
    setSelected(undefined);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Omit<InfoEntry, "id" | "createdAt" | "updatedAt">) => {
    const entry: InfoEntry = {
      ...data,
      category: currentCategory ?? data.category,
      id: selected?.id ?? crypto.randomUUID(),
      createdAt: selected?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await upsertInfoEntry(entry);
    setIsModalOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInfoEntry(id);
      setIsModalOpen(false);
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("row-level security") || msg.includes("policy") || msg.includes("permission denied")) {
        const userId = useIhaStore.getState().currentUserId ?? "bilinmiyor";
        addAuditEntry({ action: "yetki_reddedildi", target: "ekipman", targetId: id, description: "Yetkisiz bilgi bankası silme engellendi", performedBy: userId }).catch(() => {});
        useToast.getState().add("Bu işlem için yetkiniz yok", "error");
      } else {
        useToast.getState().add(`Hata: ${msg}`, "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-[var(--muted-foreground)]">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ViewToolbar
        views={VIEWS}
        activeView={view}
        onViewChange={(v) => { setView(v as InfoBankView); setSearch(""); }}
        addLabel={isCategory ? "Yeni Kayıt" : ""}
        onAdd={isCategory ? handleAdd : () => {}}
        filters={
          isCategory ? (
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Ara..."
              className={`${inputClass} w-full max-w-[160px]`}
            />
          ) : undefined
        }
      />

      {isCategory ? (
        <CategoryView
          entries={filtered}
          categoryLabel={currentCategory ? INFO_CATEGORY_LABELS[currentCategory] : ""}
          onSelect={(entry) => { setSelected(entry); setIsModalOpen(true); }}
          onAdd={handleAdd}
        />
      ) : (
        <VehicleEventsPanel />
      )}

      <InfoEntryModal
        entry={selected}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}

/* ─── Kategori Görünümü ─── */
function CategoryView({ entries, categoryLabel, onSelect, onAdd }: {
  entries: InfoEntry[];
  categoryLabel: string;
  onSelect: (entry: InfoEntry) => void;
  onAdd: () => void;
}) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon="📚"
        title={categoryLabel ? `${categoryLabel} kategorisinde kayıt yok` : "Bu kategoride kayıt yok"}
        description="Bu kategoride henüz kayıt yok"
        ctaLabel="+ Yeni Kayıt"
        onCta={onAdd}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
      {entries.map((entry) => (
        <InfoCard key={entry.id} entry={entry} onClick={() => onSelect(entry)} />
      ))}
    </div>
  );
}
