"use client";

import type { InputHTMLAttributes } from "react";
import { useId } from "react";

interface FormCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> {
  label: string;
  error?: string;
}

/**
 * Accessible checkbox with inline label.
 * Label tıklanabilir (htmlFor), 44px touch target sağlanmış.
 */
export function FormCheckbox({ label, error, id, ...inputProps }: FormCheckboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div>
      <label
        htmlFor={inputId}
        className="flex items-center gap-2 text-sm text-[var(--foreground)] cursor-pointer min-h-[44px]"
      >
        <input
          id={inputId}
          type="checkbox"
          {...inputProps}
          aria-invalid={error ? true : undefined}
          className="w-4 h-4 rounded border-[var(--border)] accent-[var(--accent)]"
        />
        <span>{label}</span>
      </label>
      {error && <p className="text-xs text-[var(--feedback-error)] mt-1">{error}</p>}
    </div>
  );
}
