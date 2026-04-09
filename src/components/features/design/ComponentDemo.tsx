"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function ComponentDemo() {
  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-[var(--foreground)]">Bileşen Örnekleri</h2>

      {/* Butonlar */}
      <div>
        <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Butonlar</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="danger">Danger</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>

      {/* Badge'ler */}
      <div>
        <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Badge</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="info">Info</Badge>
        </div>
      </div>

      {/* Kartlar */}
      <div>
        <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Kart</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <h4 className="text-sm font-semibold text-[var(--foreground)]">Kart Başlığı</h4>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Surface arka plan, border kenarlık.</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <h4 className="text-sm font-semibold text-[var(--foreground)]">Background Kart</h4>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Background arka plan, border kenarlık.</p>
          </div>
        </div>
      </div>

      {/* Input */}
      <div>
        <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Form Elemanları</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
          <input
            type="text"
            placeholder="Text input"
            className="px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
          <select className="px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]">
            <option>Select</option>
            <option>Option 1</option>
          </select>
        </div>
      </div>
    </section>
  );
}
