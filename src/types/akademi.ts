// ============================================
// Akademi — Tip Tanımları
// ============================================

export interface AkademiKurs {
  id: string;
  title: string;
  description: string;
  software: string;
  icon?: string;
  difficulty: AkademiDifficulty;
  sortOrder: number;
  status: AkademiStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AkademiAdim {
  id: string;
  kursId: string;
  stepNumber: number;
  title: string;
  content: string;
  youtubeUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AkademiGorsel {
  id: string;
  adimId: string;
  imageUrl: string;
  fileName: string;
  caption?: string;
  sortOrder: number;
  annotations: Annotation[];
  createdAt: string;
}

// ─── Annotation tipleri ───
// Koordinatlar görsel boyutunun yüzdesi (0-100).
// Farklı ekran boyutlarında doğru ölçeklenir.

export type AnnotationTool = "arrow" | "rect" | "circle" | "text";

export interface AnnotationBase {
  id: string;
  tool: AnnotationTool;
  color: string;
  strokeWidth: number;
}

export interface ArrowAnnotation extends AnnotationBase {
  tool: "arrow";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface RectAnnotation extends AnnotationBase {
  tool: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CircleAnnotation extends AnnotationBase {
  tool: "circle";
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export interface TextAnnotation extends AnnotationBase {
  tool: "text";
  x: number;
  y: number;
  text: string;
  fontSize: number;
}

export type Annotation =
  | ArrowAnnotation
  | RectAnnotation
  | CircleAnnotation
  | TextAnnotation;

// ─── Enum sabitleri ───

export type AkademiDifficulty = "baslangic" | "orta" | "ileri";
export type AkademiStatus = "taslak" | "yayinda";
export type AkademiView = "kurslar" | "kursDetay" | "adimDuzenle";

export const AKADEMI_DIFFICULTY_LABELS: Record<AkademiDifficulty, string> = {
  baslangic: "Başlangıç",
  orta: "Orta",
  ileri: "İleri",
};

export const AKADEMI_STATUS_LABELS: Record<AkademiStatus, string> = {
  taslak: "Taslak",
  yayinda: "Yayında",
};

export const AKADEMI_DIFFICULTY_VARIANTS: Record<AkademiDifficulty, "success" | "warning" | "danger"> = {
  baslangic: "success",
  orta: "warning",
  ileri: "danger",
};
