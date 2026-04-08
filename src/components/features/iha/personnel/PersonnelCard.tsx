"use client";

import type { TeamMember, Operation } from "@/types/iha";
import { Badge } from "@/components/ui/Badge";

const STATUS_LABELS: Record<string, string> = {
  aktif: "Aktif",
  izinli: "İzinli",
  pasif: "Pasif",
};

const STATUS_VARIANTS: Record<string, "success" | "warning" | "danger"> = {
  aktif: "success",
  izinli: "warning",
  pasif: "danger",
};

interface PersonnelCardProps {
  member: TeamMember;
  currentOperation?: Operation;
  onClick: () => void;
}

export function PersonnelCard({ member, currentOperation, onClick }: PersonnelCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 hover:bg-[var(--surface-hover)] transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-bold text-lg flex-shrink-0 overflow-hidden">
            {member.profilePhotoUrl ? (
              <img src={member.profilePhotoUrl} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              member.name.charAt(0)
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              {member.name}
            </h3>
            <p className="text-xs text-[var(--muted-foreground)]">{member.profession ?? "-"}</p>
          </div>
        </div>
        <Badge variant={STATUS_VARIANTS[member.status] ?? "success"}>
          {STATUS_LABELS[member.status] ?? "Aktif"}
        </Badge>
      </div>

      {member.pilotLicense && (
        <div className="mt-2">
          <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)]">
            {member.pilotLicense.licenseClass}
          </span>
        </div>
      )}

      {member.status === "izinli" && member.leaveStart && (
        <p className="text-xs text-[var(--muted-foreground)] mt-2">
          İzin: {member.leaveStart}{member.leaveEnd ? ` — ${member.leaveEnd}` : ""}
        </p>
      )}

      {currentOperation && (
        <p className="text-xs text-[var(--muted-foreground)] mt-2 truncate">
          Görev: {currentOperation.title}
        </p>
      )}
    </button>
  );
}
