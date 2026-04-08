"use client";

import { Badge } from "@/components/ui";

const VARIANTS = ["default", "success", "warning", "danger", "info"] as const;

export function BadgeShowcase() {
  return (
    <div className="flex flex-wrap gap-3">
      {VARIANTS.map((v) => (
        <Badge key={v} variant={v}>
          {v}
        </Badge>
      ))}
    </div>
  );
}
