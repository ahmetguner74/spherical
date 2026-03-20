import { Badge } from "@/components/ui";
import type { WorkStatus } from "@/types";

const STATUS_MAP: Record<WorkStatus, { label: string; variant: "success" | "warning" | "danger" }> = {
  completed: { label: "Tamamlandı", variant: "success" },
  in_progress: { label: "Devam Ediyor", variant: "warning" },
  pending: { label: "Beklemede", variant: "danger" },
};

export function WorkStatusBadge({ status }: { status: WorkStatus }) {
  const { label, variant } = STATUS_MAP[status];
  return <Badge variant={variant}>{label}</Badge>;
}
