"use client";

import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useIhaStore } from "../shared/ihaStore";
import { useToast } from "@/components/ui/Toast";
import { WINGTRA_FIRST_13, type WingtraImportRecord } from "@/config/wingtra-import";
import type { Operation } from "@/types/iha";

interface WingtraImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WingtraImportModal({ isOpen, onClose }: WingtraImportModalProps) {
  const { operations, team, addOperation } = useIhaStore();
  const toast = useToast();
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(0);

  // Operatör isimlerini takımdaki personellere eşleştir
  const matchTeam = useMemo(() => {
    const map = new Map<string, string>();
    for (const member of team) {
      map.set(member.name.toLowerCase().trim(), member.id);
    }
    return map;
  }, [team]);

  // Mevcut paftalar (mükerrer koruması için)
  const existingTitles = useMemo(
    () => new Set(operations.map((o) => o.title.toLowerCase().trim())),
    [operations]
  );

  const analyzeRecord = (r: WingtraImportRecord) => {
    const title = r.pafta;
    const exists = existingTitles.has(title.toLowerCase().trim());
    const matchedTeamIds = r.operatorler
      .map((name) => matchTeam.get(name.toLowerCase().trim()))
      .filter(Boolean) as string[];
    const unmatchedOperators = r.operatorler.filter(
      (name) => !matchTeam.has(name.toLowerCase().trim())
    );
    return { title, exists, matchedTeamIds, unmatchedOperators };
  };

  const handleImport = async () => {
    setImporting(true);
    setDone(0);
    let added = 0;
    let skipped = 0;

    for (const record of WINGTRA_FIRST_13) {
      const { exists, matchedTeamIds } = analyzeRecord(record);
      if (exists) {
        skipped++;
        setDone((d) => d + 1);
        continue;
      }

      const notes: string[] = [];
      if (record.gsd) notes.push(`GSD: ${record.gsd}`);
      if (record.ruzgar) notes.push(`Rüzgar: ${record.ruzgar} m/s`);
      if (record.yazilim) notes.push(`WingtraPilot: ${record.yazilim}`);
      if (record.ekAciklama) notes.push(record.ekAciklama);

      const op: Omit<Operation, "id" | "createdAt" | "updatedAt" | "deliverables" | "flightLogIds" | "completionPercent"> = {
        title: record.pafta,
        description: "",
        type: "iha",
        subTypes: ["ortofoto"],
        requester: "HBB",
        status: "teslim",
        priority: "normal",
        location: {
          il: "Bursa",
          ilce: record.ilce,
          pafta: record.pafta.startsWith("H") ? record.pafta : undefined,
          alan: record.alanKm2 ? record.alanKm2 * 1000000 : undefined,
          alanBirimi: "m2",
        },
        assignedTeam: matchedTeamIds,
        assignedEquipment: [],
        startDate: record.date,
        endDate: record.date,
        notes: notes.join(" · "),
      };

      addOperation(op);
      added++;
      setDone((d) => d + 1);
      // Supabase'e sıra ile yazılsın diye küçük bekleme
      await new Promise((r) => setTimeout(r, 200));
    }

    setImporting(false);
    toast.add(`${added} kayıt eklendi${skipped > 0 ? `, ${skipped} mevcut (atlandı)` : ""}`, "success");
    setTimeout(() => onClose(), 1000);
  };

  const totalNew = WINGTRA_FIRST_13.filter((r) => !existingTitles.has(r.pafta.toLowerCase().trim())).length;
  const totalSkip = WINGTRA_FIRST_13.length - totalNew;
  const allUnmatched = new Set<string>();
  for (const r of WINGTRA_FIRST_13) {
    for (const n of analyzeRecord(r).unmatchedOperators) allUnmatched.add(n);
  }

  return (
    <Modal open={isOpen} onClose={onClose}>
      <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">
        Wingtra Uçuşları — Excel İçe Aktarma
      </h2>
      <p className="text-xs text-[var(--muted-foreground)] mb-4">
        İlk 13 kayıt Excel'den aktarılacak. Mükerrer olanlar atlanır.
      </p>

      {/* Özet */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <SummaryCard label="Toplam" value={WINGTRA_FIRST_13.length} />
        <SummaryCard label="Yeni" value={totalNew} color="text-green-400" />
        <SummaryCard label="Mevcut" value={totalSkip} color="text-yellow-400" />
      </div>

      {/* Eşleşmeyen operatörler uyarısı */}
      {allUnmatched.size > 0 && (
        <div className="mb-4 p-2.5 rounded-md border border-yellow-500/30 bg-yellow-500/5">
          <p className="text-xs text-yellow-400 font-medium mb-1">
            ⚠ {allUnmatched.size} operatör personel listesinde yok:
          </p>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            {[...allUnmatched].join(", ")}
          </p>
          <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
            Bu kayıtlar operatör atanmadan eklenecek. Sonradan manuel eşleştirebilirsin.
          </p>
        </div>
      )}

      {/* Önizleme tablosu */}
      <div className="max-h-[40vh] overflow-y-auto border border-[var(--border)] rounded-md mb-4">
        <table className="w-full text-xs">
          <thead className="bg-[var(--background)] sticky top-0">
            <tr className="text-left text-[var(--muted-foreground)]">
              <th className="p-2 font-medium">Tarih</th>
              <th className="p-2 font-medium">Pafta / Ad</th>
              <th className="p-2 font-medium">İlçe</th>
              <th className="p-2 font-medium">GSD</th>
              <th className="p-2 font-medium">Durum</th>
            </tr>
          </thead>
          <tbody>
            {WINGTRA_FIRST_13.map((r, i) => {
              const { exists } = analyzeRecord(r);
              return (
                <tr key={i} className="border-t border-[var(--border)]">
                  <td className="p-2 font-mono text-[11px]">{r.date}</td>
                  <td className="p-2 font-medium">{r.pafta}</td>
                  <td className="p-2">{r.ilce}</td>
                  <td className="p-2">{r.gsd ?? "—"}</td>
                  <td className="p-2">
                    {exists ? (
                      <Badge variant="warning">Mevcut</Badge>
                    ) : (
                      <Badge variant="success">Yeni</Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* İlerleme */}
      {importing && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-[var(--muted-foreground)] mb-1">
            <span>Aktarılıyor...</span>
            <span>{done}/{WINGTRA_FIRST_13.length}</span>
          </div>
          <div className="h-1.5 bg-[var(--surface)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-200"
              style={{ width: `${(done / WINGTRA_FIRST_13.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Butonlar */}
      <div className="flex gap-2">
        <Button onClick={handleImport} disabled={importing || totalNew === 0}>
          {importing ? "Aktarılıyor..." : `${totalNew} Kayıt Aktar`}
        </Button>
        <Button variant="ghost" onClick={onClose} disabled={importing}>
          İptal
        </Button>
      </div>
    </Modal>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-2.5">
      <p className="text-[10px] text-[var(--muted-foreground)] uppercase">{label}</p>
      <p className={`text-xl font-bold ${color ?? "text-[var(--foreground)]"}`}>{value}</p>
    </div>
  );
}
