import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[var(--background)] text-[var(--muted-foreground)]",
  success: "bg-[var(--accent)]/10 text-[var(--accent)]",
  warning: "bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)]",
  danger: "bg-[var(--feedback-error)]/10 text-[var(--feedback-error)]",
  info: "bg-[var(--feedback-info)]/10 text-[var(--feedback-info)]",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
