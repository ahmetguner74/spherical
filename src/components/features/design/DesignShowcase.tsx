"use client";

import { ColorPalette } from "./ColorPalette";
import { IconGrid } from "./IconGrid";
import { TypographyDemo } from "./TypographyDemo";
import { ComponentDemo } from "./ComponentDemo";

export function DesignShowcase() {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Tasarım Rehberi</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Tüm renk, ikon, tipografi ve bileşen kuralları.
        </p>
      </header>
      <ColorPalette />
      <IconGrid />
      <TypographyDemo />
      <ComponentDemo />
    </div>
  );
}
