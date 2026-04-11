"use client";

import { useId, cloneElement, isValidElement, type ReactElement } from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }>;
}

/**
 * Accessible form field wrapper.
 * - useId() ile otomatik benzersiz id üretir
 * - <label htmlFor={id}> ve child'ın id'sini senkronize eder
 * - error varsa aria-invalid + aria-describedby
 *
 * Kullanım:
 *   <FormField label="Başlık" required>
 *     <input type="text" value={title} onChange={...} className={inputClass} />
 *   </FormField>
 */
export function FormField({ label, required, error, hint, className = "", children }: FormFieldProps) {
  const autoId = useId();
  const errorId = `${autoId}-err`;
  const hintId = `${autoId}-hint`;

  if (!isValidElement(children)) {
    return null;
  }

  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  const input = cloneElement(children, {
    id: autoId,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  });

  return (
    <div className={className}>
      <label htmlFor={autoId} className="block text-xs text-[var(--muted-foreground)] mb-1">
        {label}
        {required && <span className="text-[var(--feedback-error)] ml-0.5" aria-hidden="true">*</span>}
      </label>
      {input}
      {hint && !error && (
        <p id={hintId} className="text-[11px] text-[var(--muted-foreground)] mt-1">{hint}</p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-[var(--feedback-error)] mt-1">{error}</p>
      )}
    </div>
  );
}
