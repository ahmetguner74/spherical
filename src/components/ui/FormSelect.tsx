"use client";

import type { SelectHTMLAttributes, ReactNode } from "react";
import { FormField } from "./FormField";
import { selectClass } from "./formStyles";

interface FormSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  fieldClassName?: string;
  selectClassName?: string;
  children: ReactNode;
}

/**
 * Accessible native select.
 * FormField ile sarmalanmış — label + htmlFor + aria-invalid otomatik.
 */
export function FormSelect({
  label, required, error, hint,
  fieldClassName, selectClassName,
  children, ...selectProps
}: FormSelectProps) {
  return (
    <FormField label={label} required={required} error={error} hint={hint} className={fieldClassName}>
      <select {...selectProps} className={selectClassName ?? selectClass}>
        {children}
      </select>
    </FormField>
  );
}
