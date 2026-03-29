import type { ReactNode } from "react";

export interface Soru {
  konu: string;
  seviye: "Normal" | "Zor";
  ikon: string;
  soru: ReactNode;
  soruAlt?: ReactNode;
  secenekler: ReactNode[];
  dogruCevap: number;
  ipuclari: ReactNode[];
}
