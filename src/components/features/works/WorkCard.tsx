"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { Work } from "@/types";
import { WorkStatusBadge } from "./WorkStatusBadge";

interface WorkCardProps {
  work: Work;
  onClick: () => void;
}

export function WorkCard({ work, onClick }: WorkCardProps) {
  const remaining = work.totalFee - work.paidAmount;

  return (
    <Card className="cursor-pointer" onClick={onClick}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{work.title}</CardTitle>
          <WorkStatusBadge status={work.status} />
        </div>
        <CardDescription className="mt-1 line-clamp-2">
          {work.description}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex-wrap text-xs text-[var(--muted-foreground)]">
        <span>{work.client}</span>
        <span className="mx-1">·</span>
        <span>{formatDate(work.startDate)}</span>
        {work.totalFee > 0 && (
          <>
            <span className="mx-1">·</span>
            <span className={remaining > 0 ? "text-yellow-400" : "text-green-400"}>
              ₺{remaining.toLocaleString("tr-TR")} kalan
            </span>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
