"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Annotation, AnnotationTool } from "@/types/akademi";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { IconCheck, IconClose } from "@/config/icons";
import { AnnotationRenderer } from "./AnnotationRenderer";
import { AnnotationToolbar } from "./AnnotationToolbar";

interface AnnotationEditorProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  initialAnnotations: Annotation[];
  onSave: (annotations: Annotation[]) => void;
}

/** Ekran koordinatını SVG yüzde koordinatına dönüştürür. */
function toSvgCoords(e: React.PointerEvent, svgRect: DOMRect) {
  return {
    x: ((e.clientX - svgRect.left) / svgRect.width) * 100,
    y: ((e.clientY - svgRect.top) / svgRect.height) * 100,
  };
}

const DEFAULT_STROKE_WIDTH = 2;
const DEFAULT_FONT_SIZE = 4;

interface DrawState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export function AnnotationEditor({
  open,
  onClose,
  imageUrl,
  initialAnnotations,
  onSave,
}: AnnotationEditorProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const [activeTool, setActiveTool] = useState<AnnotationTool>("arrow");
  const [activeColor, setActiveColor] = useState("#ef4444");
  const [drawing, setDrawing] = useState<DrawState | null>(null);
  const [textInput, setTextInput] = useState<{ x: number; y: number; value: string } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const coords = toSvgCoords(e, rect);

      // Metin aracı: tıklayınca inline input aç
      if (activeTool === "text") {
        setTextInput({ x: coords.x, y: coords.y, value: "" });
        return;
      }

      // Çizim başlat
      (e.target as Element).setPointerCapture(e.pointerId);
      setDrawing({
        startX: coords.x,
        startY: coords.y,
        currentX: coords.x,
        currentY: coords.y,
      });
    },
    [activeTool, activeColor]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!drawing || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const coords = toSvgCoords(e, rect);
      setDrawing((prev) =>
        prev ? { ...prev, currentX: coords.x, currentY: coords.y } : null
      );
    },
    [drawing]
  );

  const handlePointerUp = useCallback(() => {
    if (!drawing) return;

    const { startX, startY, currentX, currentY } = drawing;
    let newAnnotation: Annotation | null = null;

    switch (activeTool) {
      case "arrow":
        newAnnotation = {
          id: crypto.randomUUID(),
          tool: "arrow",
          color: activeColor,
          strokeWidth: DEFAULT_STROKE_WIDTH,
          x1: startX,
          y1: startY,
          x2: currentX,
          y2: currentY,
        };
        break;
      case "rect": {
        const x = Math.min(startX, currentX);
        const y = Math.min(startY, currentY);
        newAnnotation = {
          id: crypto.randomUUID(),
          tool: "rect",
          color: activeColor,
          strokeWidth: DEFAULT_STROKE_WIDTH,
          x,
          y,
          width: Math.abs(currentX - startX),
          height: Math.abs(currentY - startY),
        };
        break;
      }
      case "circle":
        newAnnotation = {
          id: crypto.randomUUID(),
          tool: "circle",
          color: activeColor,
          strokeWidth: DEFAULT_STROKE_WIDTH,
          cx: (startX + currentX) / 2,
          cy: (startY + currentY) / 2,
          rx: Math.abs(currentX - startX) / 2,
          ry: Math.abs(currentY - startY) / 2,
        };
        break;
    }

    if (newAnnotation) {
      setAnnotations((prev) => [...prev, newAnnotation]);
    }
    setDrawing(null);
  }, [drawing, activeTool, activeColor]);

  // --- Metin input onayı ---
  const handleTextConfirm = useCallback(() => {
    if (!textInput || !textInput.value.trim()) {
      setTextInput(null);
      return;
    }
    const newAnnotation: Annotation = {
      id: crypto.randomUUID(),
      tool: "text",
      color: activeColor,
      strokeWidth: DEFAULT_STROKE_WIDTH,
      x: textInput.x,
      y: textInput.y,
      text: textInput.value.trim(),
      fontSize: DEFAULT_FONT_SIZE,
    };
    setAnnotations((prev) => [...prev, newAnnotation]);
    setTextInput(null);
  }, [textInput, activeColor]);

  // Auto-focus text input
  useEffect(() => {
    if (textInput) textInputRef.current?.focus();
  }, [textInput]);

  const handleUndo = useCallback(() => {
    setAnnotations((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setAnnotations([]);
  }, []);

  const handleSave = useCallback(() => {
    onSave(annotations);
    onClose();
  }, [annotations, onSave, onClose]);

  // --- Çizim sırasında önizleme elemanı ---
  const previewElement = drawing ? renderPreview(drawing, activeTool, activeColor) : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="!max-w-4xl !w-full"
      ariaLabel="Notasyon düzenleyici"
    >
      <div className="flex flex-col gap-3">
        {/* Üst bar: araçlar */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <AnnotationToolbar
            activeTool={activeTool}
            activeColor={activeColor}
            onToolChange={setActiveTool}
            onColorChange={setActiveColor}
            onUndo={handleUndo}
            onClear={handleClear}
            canUndo={annotations.length > 0}
          />
        </div>

        {/* Görsel + çizim alanı */}
        <div className="relative select-none rounded-lg overflow-hidden bg-black/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Düzenlenecek görsel"
            className="w-full h-auto block"
            draggable={false}
          />

          {/* Kaydedilmiş notasyonlar (salt okunur) */}
          <AnnotationRenderer annotations={annotations} />

          {/* Etkileşimli SVG katmanı */}
          <svg
            ref={svgRef}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {previewElement}
          </svg>
        </div>

        {/* Metin girişi (inline) */}
        {textInput && (
          <div className="flex items-center gap-2">
            <input
              ref={textInputRef}
              type="text"
              value={textInput.value}
              onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTextConfirm();
                if (e.key === "Escape") setTextInput(null);
              }}
              placeholder="Metin girin..."
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            <Button size="sm" onClick={handleTextConfirm}>
              <IconCheck size={16} className="mr-1" />
              Ekle
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setTextInput(null)}>
              <IconClose size={16} />
            </Button>
          </div>
        )}

        {/* Alt bar: kaydet / iptal */}
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <IconClose size={16} className="mr-1" />
            İptal
          </Button>
          <Button size="sm" onClick={handleSave}>
            <IconCheck size={16} className="mr-1" />
            Kaydet
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Çizim önizlemesi ───

function renderPreview(
  draw: DrawState,
  tool: AnnotationTool,
  color: string
): React.ReactElement | null {
  const { startX, startY, currentX, currentY } = draw;

  switch (tool) {
    case "arrow":
      return (
        <line
          x1={startX}
          y1={startY}
          x2={currentX}
          y2={currentY}
          stroke={color}
          strokeWidth={DEFAULT_STROKE_WIDTH}
          strokeDasharray="2 1"
          opacity={0.7}
        />
      );
    case "rect": {
      const x = Math.min(startX, currentX);
      const y = Math.min(startY, currentY);
      return (
        <rect
          x={x}
          y={y}
          width={Math.abs(currentX - startX)}
          height={Math.abs(currentY - startY)}
          fill="none"
          stroke={color}
          strokeWidth={DEFAULT_STROKE_WIDTH}
          strokeDasharray="2 1"
          opacity={0.7}
        />
      );
    }
    case "circle":
      return (
        <ellipse
          cx={(startX + currentX) / 2}
          cy={(startY + currentY) / 2}
          rx={Math.abs(currentX - startX) / 2}
          ry={Math.abs(currentY - startY) / 2}
          fill="none"
          stroke={color}
          strokeWidth={DEFAULT_STROKE_WIDTH}
          strokeDasharray="2 1"
          opacity={0.7}
        />
      );
    default:
      return null;
  }
}
