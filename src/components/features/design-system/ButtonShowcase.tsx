"use client";

import { Button } from "@/components/ui";

const VARIANTS = ["primary", "secondary", "ghost", "outline", "danger"] as const;
const SIZES = ["sm", "md", "lg"] as const;

export function ButtonShowcase() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {VARIANTS.map((v) => (
          <Button key={v} variant={v}>
            {v}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {SIZES.map((s) => (
          <Button key={s} size={s}>
            {s}
          </Button>
        ))}
        <Button disabled>disabled</Button>
      </div>
    </div>
  );
}
