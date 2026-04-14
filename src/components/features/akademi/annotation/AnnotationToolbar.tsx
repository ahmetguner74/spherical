"use client";

import type { AnnotationTool } from "@/types/akademi";
import { IconArrowDiag, IconSquare, IconCircle, IconType, IconUndo, IconTrash } from "@/config/icons";
import { cn } from "@/lib/utils";

interface AnnotationToolbarProps {
  activeTool: AnnotationTool;
  activeColor: string;
  onToolChange: (tool: AnnotationTool) => void;
  onColorChange: (color: string) => void;
  onUndo: () => void;
  onClear: () => void;
  canUndo: boolean;
}

const TOOLS: { tool: AnnotationTool; icon: typeof IconArrowDiag; label: string }[] = [
  { tool: "arrow", icon: IconArrowDiag, label: "Ok" },
  { tool: "rect", icon: IconSquare, label: "Dikdörtgen" },
  { tool: "circle", icon: IconCircle, label: "Elips" },
  { tool: "text", icon: IconType, label: "Metin" },
];

const PRESET_COLORS = [
  { value: "#ef4444", label: "Kırmızı" },
  { value: "#eab308", label: "Sarı" },
  { value: "#3b82f6", label: "Mavi" },
  { value: "#22c55e", label: "Yeşil" },
  { value: "#ffffff", label: "Beyaz" },
];

export function AnnotationToolbar({
  activeTool,
  activeColor,
  onToolChange,
  onColorChange,
  onUndo,
  onClear,
  canUndo,
}: AnnotationToolbarProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
      {/* Araç butonları */}
      {TOOLS.map(({ tool, icon: Icon, label }) => (
        <button
          key={tool}
          type="button"
          title={label}
          onClick={() => onToolChange(tool)}
          className={cn(
            "p-1.5 sm:p-2 rounded-lg transition-colors",
            activeTool === tool
              ? "bg-[var(--accent)] text-white"
              : "text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
          )}
        >
          <Icon size={18} />
        </button>
      ))}

      {/* Ayırıcı */}
      <div className="w-px h-6 bg-[var(--border)] mx-1" />

      {/* Renk seçici */}
      {PRESET_COLORS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          title={label}
          onClick={() => onColorChange(value)}
          className={cn(
            "w-6 h-6 rounded-full transition-shadow border-2",
            activeColor === value
              ? "border-[var(--accent)] ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--surface)]"
              : "border-[var(--border)]"
          )}
          style={{ backgroundColor: value }}
        />
      ))}

      {/* Ayırıcı */}
      <div className="w-px h-6 bg-[var(--border)] mx-1" />

      {/* Geri al */}
      <button
        type="button"
        title="Geri al"
        onClick={onUndo}
        disabled={!canUndo}
        className="p-1.5 sm:p-2 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
      >
        <IconUndo size={18} />
      </button>

      {/* Hepsini sil */}
      <button
        type="button"
        title="Hepsini temizle"
        onClick={onClear}
        disabled={!canUndo}
        className="p-1.5 sm:p-2 rounded-lg text-[var(--feedback-error,#ef4444)] hover:bg-[var(--surface-hover)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
      >
        <IconTrash size={18} />
      </button>
    </div>
  );
}
