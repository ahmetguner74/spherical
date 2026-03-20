import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface DashboardCardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  span?: "1" | "2" | "full";
}

const spanStyles = {
  "1": "",
  "2": "sm:col-span-2",
  full: "col-span-full",
};

export function DashboardCard({
  title,
  span = "1",
  className,
  children,
  ...props
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:bg-[var(--surface-hover)]",
        spanStyles[span],
        className
      )}
      {...props}
    >
      {title && (
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
