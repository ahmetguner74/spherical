// Form control class constants (ui atom seviyesi)
// FormInput, FormSelect, FormTextarea vb. component'lerin ortak stil kaynağı.
// iha feature'ı bu dosyayı shared/styles.ts üzerinden yeniden dışarı verir.

export const inputClass =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] min-h-[44px]";

export const selectClass = inputClass;

export const textareaClass = inputClass;
