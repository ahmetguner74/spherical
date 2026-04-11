"use client";

import type { TextareaHTMLAttributes } from "react";
import { FormField } from "./FormField";
import { textareaClass } from "./formStyles";

interface FormTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  fieldClassName?: string;
  textareaClassName?: string;
}

/**
 * Accessible textarea.
 * FormField ile sarmalanmış — label + htmlFor + aria-invalid otomatik.
 * Default: resize-none + rows'a göre yükseklik.
 */
export function FormTextarea({
  label, required, error, hint,
  fieldClassName, textareaClassName,
  ...textareaProps
}: FormTextareaProps) {
  return (
    <FormField label={label} required={required} error={error} hint={hint} className={fieldClassName}>
      <textarea {...textareaProps} className={textareaClassName ?? `${textareaClass} resize-none`} />
    </FormField>
  );
}
