"use client";

import type { InputHTMLAttributes } from "react";
import { FormField } from "./FormField";
import { inputClass } from "./formStyles";

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  fieldClassName?: string;
  inputClassName?: string;
}

/**
 * Accessible text/number/date/time/email/tel input.
 * FormField ile sarmalanmış — label + htmlFor + aria-invalid otomatik.
 */
export function FormInput({
  label, required, error, hint,
  fieldClassName, inputClassName,
  ...inputProps
}: FormInputProps) {
  return (
    <FormField label={label} required={required} error={error} hint={hint} className={fieldClassName}>
      <input {...inputProps} className={inputClassName ?? inputClass} />
    </FormField>
  );
}
