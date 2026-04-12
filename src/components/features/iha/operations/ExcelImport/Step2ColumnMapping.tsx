"use client";

import { SYSTEM_FIELDS, type SystemFieldKey } from "./excelHelpers";

interface Step2ColumnMappingProps {
  headers: string[];
  sampleRows: Record<string, unknown>[];
  mapping: Record<string, SystemFieldKey>;
  setMapping: (m: Record<string, SystemFieldKey>) => void;
  customEnabled: boolean;
  setCustomEnabled: (v: boolean) => void;
}

export function Step2ColumnMapping({
  headers,
  sampleRows,
  mapping,
  setMapping,
  customEnabled,
  setCustomEnabled,
}: Step2ColumnMappingProps) {
  const requiredMissing: string[] = [];
  for (const sf of SYSTEM_FIELDS) {
    if (sf.required && !Object.values(mapping).includes(sf.key)) {
      requiredMissing.push(sf.label);
    }
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-[var(--muted-foreground)]">
        Excel sütunlarını sistem alanlarıyla eşleştir. Zorunlu alanlar (<span className="text-[var(--feedback-error)]">*</span>) mutlaka bir sütuna atanmalı.
      </div>

      {/* Custom field toggle */}
      <label className="flex items-center gap-2 p-2.5 rounded-md border border-[var(--border)] bg-[var(--surface)] cursor-pointer">
        <input
          type="checkbox"
          checked={customEnabled}
          onChange={(e) => setCustomEnabled(e.target.checked)}
          className="w-4 h-4"
        />
        <span className="text-xs text-[var(--foreground)]">
          Sistemde olmayan sütunları <strong>Özel Alan</strong> olarak kaydet
        </span>
      </label>

      {/* Eşleştirme tablosu */}
      <div className="max-h-[45vh] overflow-y-auto border border-[var(--border)] rounded-md">
        <table className="w-full text-xs">
          <thead className="bg-[var(--surface)] sticky top-0 z-10">
            <tr className="text-left">
              <th className="p-2 font-semibold">Excel Sütunu</th>
              <th className="p-2 font-semibold">Örnek Veri</th>
              <th className="p-2 font-semibold">Sistem Alanı</th>
            </tr>
          </thead>
          <tbody>
            {headers.map((header) => {
              const sample = sampleRows.map((r) => r[header]).filter(Boolean)[0];
              const currentMapping = mapping[header] ?? "__custom";
              return (
                <tr key={header} className="border-t border-[var(--border)]">
                  <td className="p-2 font-mono text-[11px] text-[var(--foreground)]">
                    {header}
                  </td>
                  <td className="p-2 text-[var(--muted-foreground)] max-w-[100px] truncate">
                    {sample ? String(sample) : "—"}
                  </td>
                  <td className="p-2">
                    <select
                      value={currentMapping}
                      onChange={(e) => setMapping({ ...mapping, [header]: e.target.value as SystemFieldKey })}
                      className="w-full px-2 py-1 text-xs rounded border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    >
                      <option value="__ignore">— Yok say —</option>
                      {SYSTEM_FIELDS.map((sf) => (
                        <option key={sf.key} value={sf.key}>
                          {sf.label}{sf.required ? " *" : ""}
                        </option>
                      ))}
                      <option value="__custom">🆕 Özel Alan</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Eksik zorunlu alan uyarısı */}
      {requiredMissing.length > 0 && (
        <div className="p-2.5 rounded-md border border-[var(--feedback-warning)]/30 bg-[var(--feedback-warning-bg)] text-xs text-[var(--feedback-warning)]">
          ⚠ Zorunlu alan(lar) eşleştirilmedi: <strong>{requiredMissing.join(", ")}</strong>
        </div>
      )}
    </div>
  );
}
