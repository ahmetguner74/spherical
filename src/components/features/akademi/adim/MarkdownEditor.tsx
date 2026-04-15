"use client";

// ============================================
// MarkdownEditor — Toolbar + yazma/önizleme sekmeli editör
// ============================================

import { useRef, useState, useCallback } from "react";
import {
  IconBold, IconItalic, IconHeading, IconList,
  IconLink, IconQuote, IconCode, IconEye, IconEdit,
} from "@/config/icons";
import { renderMarkdown } from "@/lib/markdown";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  minRows?: number;
}

type Tab = "write" | "preview";

interface ToolbarAction {
  icon: typeof IconBold;
  label: string;
  prefix: string;
  suffix: string;
  block?: boolean;
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { icon: IconBold, label: "Kalın", prefix: "**", suffix: "**" },
  { icon: IconItalic, label: "İtalik", prefix: "*", suffix: "*" },
  { icon: IconHeading, label: "Başlık", prefix: "## ", suffix: "", block: true },
  { icon: IconList, label: "Liste", prefix: "- ", suffix: "", block: true },
  { icon: IconQuote, label: "Alıntı", prefix: "> ", suffix: "", block: true },
  { icon: IconCode, label: "Kod", prefix: "`", suffix: "`" },
  { icon: IconLink, label: "Link", prefix: "[", suffix: "](url)" },
];

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Markdown ile yazın...",
  error,
  minRows = 12,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<Tab>("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = useCallback(
    (action: ToolbarAction) => {
      const ta = textareaRef.current;
      if (!ta) return;

      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = value.slice(start, end);
      const before = value.slice(0, start);
      const after = value.slice(end);

      let newText: string;
      let cursorPos: number;

      if (action.block) {
        // Satır başına ekleme — seçili metin yoksa prefix + placeholder
        const lineStart = before.lastIndexOf("\n") + 1;
        const beforeLine = value.slice(0, lineStart);
        const lineText = selected || "metin";
        newText = beforeLine + action.prefix + lineText + action.suffix + after;
        cursorPos = lineStart + action.prefix.length + lineText.length;
      } else {
        // Wrap — seçili metnin etrafına ekle
        const inner = selected || "metin";
        newText = before + action.prefix + inner + action.suffix + after;
        cursorPos = start + action.prefix.length + inner.length;
      }

      onChange(newText);

      // Cursor pozisyonunu ayarla
      requestAnimationFrame(() => {
        ta.focus();
        if (!selected) {
          // Seçim yoksa placeholder metnini seç
          const selectStart = action.block
            ? before.lastIndexOf("\n") + 1 + action.prefix.length
            : start + action.prefix.length;
          ta.setSelectionRange(selectStart, selectStart + "metin".length);
        } else {
          ta.setSelectionRange(cursorPos, cursorPos);
        }
      });
    },
    [value, onChange]
  );

  const borderColor = error ? "border-red-500" : "border-[var(--border)]";

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-[var(--foreground)]">
        İçerik <span className="text-red-500">*</span>
      </label>

      <div className={`rounded-lg border ${borderColor} bg-[var(--surface)] overflow-hidden`}>
        {/* Sekme başlıkları + toolbar */}
        <div className="flex items-center gap-1 border-b border-[var(--border)] px-2 py-1.5">
          {/* Sekmeler */}
          <button
            type="button"
            onClick={() => setTab("write")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === "write"
                ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <IconEdit className="h-3.5 w-3.5" />
            Yaz
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === "preview"
                ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <IconEye className="h-3.5 w-3.5" />
            Önizle
          </button>

          {/* Ayırıcı */}
          {tab === "write" && (
            <>
              <div className="w-px h-5 bg-[var(--border)] mx-1" />

              {/* Toolbar butonları */}
              <div className="flex items-center gap-0.5">
                {TOOLBAR_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => applyFormat(action)}
                    title={action.label}
                    className="p-1.5 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    <action.icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* İçerik alanı */}
        {tab === "write" ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={minRows}
            className="w-full px-3 py-2.5 text-sm text-[var(--foreground)] bg-transparent placeholder:text-[var(--muted-foreground)] resize-none outline-none font-mono leading-relaxed"
          />
        ) : (
          <div
            className="px-3 py-2.5 text-sm text-[var(--foreground)] leading-relaxed space-y-1 min-h-[12rem]"
            dangerouslySetInnerHTML={{
              __html: value.trim()
                ? renderMarkdown(value)
                : '<p class="text-[var(--muted-foreground)] italic">Henüz içerik yok</p>',
            }}
          />
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
