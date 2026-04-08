"use client";

import { DesignSection } from "./DesignSection";
import { ColorSwatch } from "./ColorSwatch";
import { TypographyScale } from "./TypographyScale";
import { SpacingScale } from "./SpacingScale";
import { RadiusScale } from "./RadiusScale";
import { ShadowScale } from "./ShadowScale";
import { ButtonShowcase } from "./ButtonShowcase";
import { BadgeShowcase } from "./BadgeShowcase";
import { CardShowcase } from "./CardShowcase";
import { StatusColors } from "./StatusColors";
import { TypeColors } from "./TypeColors";
import { ZIndexScale } from "./ZIndexScale";
import { FormShowcase } from "./FormShowcase";
import { VERSION } from "@/config/version";

const CORE_COLORS = [
  { name: "Background", variable: "--background" },
  { name: "Foreground", variable: "--foreground" },
  { name: "Surface", variable: "--surface" },
  { name: "Surface Hover", variable: "--surface-hover" },
  { name: "Accent", variable: "--accent" },
  { name: "Accent Hover", variable: "--accent-hover" },
  { name: "Accent Secondary", variable: "--accent-secondary" },
  { name: "Muted", variable: "--muted" },
  { name: "Muted Foreground", variable: "--muted-foreground" },
  { name: "Border", variable: "--border" },
] as const;

export function DesignSystemContent() {
  return (
    <div className="space-y-8 py-8">
      <header>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Design System
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Spherical {VERSION.display} — Tek tasarim referans kaynagi
        </p>
      </header>

      <DesignSection title="Temel Renkler" description="Tema renkleri — light ve dark modda otomatik degisir">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CORE_COLORS.map((c) => (
            <ColorSwatch key={c.variable} name={c.name} variable={c.variable} />
          ))}
        </div>
      </DesignSection>

      <DesignSection title="Durum Renkleri" description="Operasyon durumlari icin kullanilir">
        <StatusColors />
      </DesignSection>

      <DesignSection title="Operasyon Tipi Renkleri" description="5 farkli operasyon tipi icin renk kodlari">
        <TypeColors />
      </DesignSection>

      <DesignSection title="Tipografi" description="Font boyutlari — sistem fontlari kullanilir">
        <TypographyScale />
      </DesignSection>

      <DesignSection title="Spacing" description="4px grid sistemi">
        <SpacingScale />
      </DesignSection>

      <DesignSection title="Border Radius" description="Koselerin yuvarlatilma olcekleri">
        <RadiusScale />
      </DesignSection>

      <DesignSection title="Golge" description="Derinlik hissi icin golge seviyeleri">
        <ShadowScale />
      </DesignSection>

      <DesignSection title="Z-Index Katmanlari" description="Elemanlarin ust uste siralama duzenı">
        <ZIndexScale />
      </DesignSection>

      <DesignSection title="Button" description="5 varyant, 3 boyut">
        <ButtonShowcase />
      </DesignSection>

      <DesignSection title="Badge" description="Etiket ve durum gostergesi">
        <BadgeShowcase />
      </DesignSection>

      <DesignSection title="Card" description="Icerik kartlari — hover acik/kapali">
        <CardShowcase />
      </DesignSection>

      <DesignSection title="Form Alanlari" description="Input, select, textarea">
        <FormShowcase />
      </DesignSection>

      <footer className="text-xs text-[var(--muted-foreground)] border-t border-[var(--border)] pt-4">
        Bu sayfa projenin tek canli tasarim referansidir. Degisiklik icin kullanicidan onay alinmalidir.
      </footer>
    </div>
  );
}
