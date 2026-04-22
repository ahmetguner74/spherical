"use client";

import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useIhaStore } from "../../shared/ihaStore";
import { useToast } from "@/components/ui/Toast";
import { Step1FileUpload } from "./Step1FileUpload";
import { Step2ColumnMapping } from "./Step2ColumnMapping";
import { Step3Preview } from "./Step3Preview";
import { Step4Loading } from "./Step4Loading";
import { autoMatchField, mapRowToOperation, type SystemFieldKey, type RowMappingResult } from "./excelHelpers";

interface ExcelImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ParsedExcel {
  headers: string[];
  rows: Record<string, unknown>[];
  fileName: string;
}

type Step = 1 | 2 | 3 | 4;

export function ExcelImportWizard({ isOpen, onClose }: ExcelImportWizardProps) {
  const { operations, addOperation } = useIhaStore();
  const toast = useToast();

  const [step, setStep] = useState<Step>(1);
  const [parsed, setParsed] = useState<ParsedExcel | null>(null);
  const [mapping, setMapping] = useState<Record<string, SystemFieldKey>>({});
  const [customEnabled, setCustomEnabled] = useState(true);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0, added: 0, skipped: 0, failed: 0 });

  // Mevcut operasyon başlıkları (mükerrer kontrolü için)
  const existingTitles = useMemo(
    () => new Set(operations.map((o) => o.title.toLowerCase().trim())),
    [operations]
  );

  // Dönüşüm sonuçları (preview + import için)
  const results = useMemo<RowMappingResult[]>(() => {
    if (!parsed || step < 3) return [];
    return parsed.rows.map((row) => mapRowToOperation(row, mapping, customEnabled));
  }, [parsed, mapping, customEnabled, step]);

  const stats = useMemo(() => {
    let ok = 0, failed = 0, duplicate = 0;
    for (const r of results) {
      if (!r.ok) failed++;
      else if (r.operation?.title && existingTitles.has(r.operation.title.toLowerCase().trim())) duplicate++;
      else ok++;
    }
    return { ok, failed, duplicate, total: results.length };
  }, [results, existingTitles]);

  const reset = () => {
    setStep(1);
    setParsed(null);
    setMapping({});
    setImportProgress({ done: 0, total: 0, added: 0, skipped: 0, failed: 0 });
  };

  const handleClose = () => {
    if (step === 4 && importProgress.done < importProgress.total) return; // yükleme sırasında kapatma
    reset();
    onClose();
  };

  const handleImport = async () => {
    setStep(4);
    const toImport = results.filter(
      (r) => r.ok && r.operation?.title && !existingTitles.has(r.operation.title.toLowerCase().trim())
    );
    setImportProgress({ done: 0, total: toImport.length, added: 0, skipped: 0, failed: 0 });

    let added = 0;
    for (let i = 0; i < toImport.length; i++) {
      const r = toImport[i];
      try {
        addOperation(r.operation as Parameters<typeof addOperation>[0]);
        added++;
      } catch {
        setImportProgress((p) => ({ ...p, failed: p.failed + 1 }));
      }
      setImportProgress((p) => ({ ...p, done: i + 1, added }));
      await new Promise((res) => setTimeout(res, 150));
    }

    toast.add(`${added} kayıt aktarıldı`, "success");
  };

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <div className="space-y-4">
        {/* Üst bar: başlık + adım göstergesi */}
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">
            Excel&apos;den İçe Aktar
          </h2>
          <StepIndicator current={step} />
        </div>

        {/* Adım içerikleri */}
        {step === 1 && (
          <Step1FileUpload
            onParsed={(p) => {
              setParsed(p);
              // Otomatik eşleştirme başlat
              const auto: Record<string, SystemFieldKey> = {};
              for (const h of p.headers) {
                auto[h] = autoMatchField(h);
              }
              setMapping(auto);
              setStep(2);
            }}
          />
        )}

        {step === 2 && parsed && (
          <Step2ColumnMapping
            headers={parsed.headers}
            sampleRows={parsed.rows.slice(0, 3)}
            mapping={mapping}
            setMapping={setMapping}
            customEnabled={customEnabled}
            setCustomEnabled={setCustomEnabled}
          />
        )}

        {step === 3 && parsed && (
          <Step3Preview
            results={results}
            stats={stats}
            existingTitles={existingTitles}
          />
        )}

        {step === 4 && (
          <Step4Loading progress={importProgress} />
        )}

        {/* Alt butonlar */}
        <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
          {step > 1 && step < 4 && (
            <Button variant="ghost" onClick={() => setStep((step - 1) as Step)}>
              ← Geri
            </Button>
          )}
          <div className="flex-1" />
          {step === 1 && (
            <Button variant="ghost" onClick={handleClose}>İptal</Button>
          )}
          {step === 2 && (
            <Button
              onClick={() => setStep(3)}
              disabled={Object.values(mapping).filter((v) => v === "title").length === 0 || Object.values(mapping).filter((v) => v === "ilce").length === 0}
            >
              Önizle →
            </Button>
          )}
          {step === 3 && (
            <Button onClick={handleImport} disabled={stats.ok === 0}>
              {stats.ok} Kayıt İçe Aktar →
            </Button>
          )}
          {step === 4 && importProgress.done >= importProgress.total && (
            <Button onClick={handleClose}>Tamam</Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ─── Adım Göstergesi ─── */
function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { n: 1, label: "Dosya" },
    { n: 2, label: "Eşleştir" },
    { n: 3, label: "Önizle" },
    { n: 4, label: "Aktar" },
  ];
  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center flex-1">
          <div
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold ${
              current === s.n
                ? "bg-[var(--accent)] text-white"
                : current > s.n
                ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                : "bg-[var(--surface)] text-[var(--muted-foreground)] border border-[var(--border)]"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[9px]">
              {current > s.n ? "✓" : s.n}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 ${current > s.n ? "bg-[var(--accent)]/40" : "bg-[var(--border)]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
