"use client";

import { inputClass } from "@/components/features/iha/shared/styles";

export function FormShowcase() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">
          Input
        </label>
        <input className={inputClass} placeholder="Placeholder metin..." readOnly />
      </div>
      <div>
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">
          Select
        </label>
        <select className={inputClass}>
          <option>Secenek 1</option>
          <option>Secenek 2</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs text-[var(--muted-foreground)] mb-1">
          Textarea
        </label>
        <textarea
          className={`${inputClass} h-16 resize-none`}
          placeholder="Aciklama yazin..."
          readOnly
        />
      </div>
    </div>
  );
}
