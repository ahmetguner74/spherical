"use client";

import { Badge } from "@/components/ui/Badge";
import { OPERATION_STATUS_LABELS } from "@/types/iha";
import type { OperationStatus } from "@/types/iha";

interface OperationStatusBadgeProps {
  status: OperationStatus;
}

const VARIANT_MAP: Record<OperationStatus, "default" | "success" | "warning" | "danger" | "info"> = {
  talep: "info",
  planlama: "warning",
  saha: "success",
  isleme: "warning",
  kontrol: "info",
  teslim: "success",
  iptal: "danger",
};

export function OperationStatusBadge({ status }: OperationStatusBadgeProps) {
  return (
    <Badge variant={VARIANT_MAP[status]}>
      {OPERATION_STATUS_LABELS[status]}
    </Badge>
  );
}
