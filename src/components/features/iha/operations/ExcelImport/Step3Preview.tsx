"use client";

import { Badge } from "@/components/ui/Badge";
import type { RowMappingResult } from "./excelHelpers";

interface Step3PreviewProps {
  results: RowMappingResult[];
  stats: { ok: number; failed: number; duplicate: number; total: number };
  existingTitles: Set<string>;
}

const MAX_PREVIEW = 30;

export function Step3Preview({ results, stats, existingTitles }: Step3PreviewProps) {
  const preview = results.slice(0, MAX_PREVIEW);

  return (
    <div className="space-y-3">
      {/* Özet kartlar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <SummaryCard label="Toplam" value={stats.total} />
        <SummaryCard label="Hazır" value={stats.ok} color="text-[var(--feedback-success)]" />
        <SummaryCard label="Mevcut" value={stats.duplicate} color="text-[var(--feedback-warning)]" />
        <SummaryCard label="Hatalı" value={stats.failed} color="text-[var(--feedback-error)]" />
      </div>

      {/* Açıklama */}
      <div className="text-xs text-[var(--muted-foreground)]">
        {stats.duplicate > 0 && <p>⚠ {stats.duplicate} kayıt aynı isimle sistemde var, aktarılmayacak.</p>}
        {stats.failed > 0 && <p>⚠ {stats.failed} kayıt zorunlu alan eksikliğinden atlanacak.</p>}
        {preview.length < results.length && <p>ℹ İlk {MAX_PREVIEW} kayıt önizlemede. Aktarılınca tümü işlenir.</p>}
      </div>

      {/* Önizleme tablosu */}
      <div className="max-h-[45vh] overflow-y-auto border border-[var(--border)] rounded-md">
        <table className="w-full text-xs">
          <thead className="bg-[var(--surface)] sticky top-0 z-10">
            <tr className="text-left">
              <th className="p-2 font-semibold">#</th>
              <th className="p-2 font-semibold">Başlık</th>
              <th className="p-2 font-semibold">İlçe</th>
              <th className="p-2 font-semibold">Tarih</th>
              <th className="p-2 font-semibold">Durum</th>
            </tr>
          </thead>
          <tbody>
            {preview.map((r, i) => {
              const isDuplicate = r.ok && r.operation?.title && existingTitles.has(r.operation.title.toLowerCase().trim());
              const statusBadge = !r.ok
                ? <Badge variant="danger">Hata</Badge>
                : isDuplicate
                ? <Badge variant="warning">Mevcut</Badge>
                : <Badge variant="success">Hazır</Badge>;
              return (
                <tr key={i} className="border-t border-[var(--border)]">
                  <td className="p-2 text-[var(--muted-foreground)]">{i + 1}</td>
                  <td className="p-2 font-medium">
                    {r.operation?.title ?? <span className="text-[var(--feedback-error)]">—</span>}
                  </td>
                  <td className="p-2">{r.operation?.location?.ilce ?? "—"}</td>
                  <td className="p-2 font-mono text-[10px]">{r.operation?.startDate ?? "—"}</td>
                  <td className="p-2">{statusBadge}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Hata detayları (varsa) */}
      {stats.failed > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-[var(--feedback-error)] font-medium">
            Hatalı satırları göster ({stats.failed})
          </summary>
          <div className="mt-2 p-2 rounded-md border border-[var(--feedback-error)]/30 bg-[var(--feedback-error-bg)] max-h-[20vh] overflow-y-auto space-y-1">
            {results
              .map((r, i) => ({ r, i }))
              .filter(({ r }) => !r.ok)
              .slice(0, 20)
              .map(({ r, i }) => (
                <div key={i} className="text-[11px]">
                  <span className="text-[var(--muted-foreground)]">Satır {i + 1}:</span>{" "}
                  <span className="text-[var(--feedback-error)]">{r.errors.join(", ")}</span>
                </div>
              ))}
          </div>
        </details>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-2 text-center">
      <p className="text-[10px] text-[var(--muted-foreground)] uppercase">{label}</p>
      <p className={`text-lg font-bold ${color ?? "text-[var(--foreground)]"}`}>{value}</p>
    </div>
  );
}
