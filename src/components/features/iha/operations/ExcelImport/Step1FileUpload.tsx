"use client";

import { useState, useRef } from "react";
import { IconFileUp } from "@/config/icons";
import type { ParsedExcel } from "./ExcelImportWizard";

interface Step1FileUploadProps {
  onParsed: (parsed: ParsedExcel) => void;
}

export function Step1FileUpload({ onParsed }: Step1FileUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    setError("");
    try {
      // Lazy load xlsx — bundle'a sadece kullanıldığında dahil
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const sheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      // İlk satırı başlık olarak al
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      if (json.length === 0) {
        setError("Dosya boş görünüyor");
        setLoading(false);
        return;
      }
      const headers = Object.keys(json[0]);
      onParsed({ headers, rows: json, fileName: file.name });
    } catch (err) {
      console.error(err);
      setError("Dosya okunamadı. Lütfen geçerli bir .xlsx / .xls / .csv dosyası seçin.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-[var(--muted-foreground)]">
        Sisteme aktarmak istediğiniz Excel dosyasını seçin. Desteklenen formatlar: <strong>.xlsx, .xls, .csv</strong>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center cursor-pointer hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-colors"
      >
        <IconFileUp className="w-10 h-10 mx-auto mb-2 text-[var(--muted-foreground)]" />
        <p className="text-sm font-medium text-[var(--foreground)]">
          {loading ? "Dosya okunuyor..." : "Dosya seçmek için tıkla"}
        </p>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          veya dosyayı buraya sürükle bırak
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error && (
        <div className="p-3 rounded-md bg-[var(--feedback-error-bg)] border border-[var(--feedback-error)]/30 text-sm text-[var(--feedback-error)]">
          {error}
        </div>
      )}

      <div className="text-xs text-[var(--muted-foreground)] bg-[var(--surface)] p-3 rounded-md">
        <p className="font-semibold mb-1">İpucu:</p>
        <ul className="space-y-0.5 list-disc list-inside">
          <li>İlk satır başlık (sütun adları) olmalı</li>
          <li>Her satır bir operasyon olarak aktarılır</li>
          <li>Sistemde olmayan sütunlar &quot;özel alan&quot; olarak kaydedilebilir</li>
        </ul>
      </div>
    </div>
  );
}
