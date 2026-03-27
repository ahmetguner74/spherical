"use client";

import type { TeamMember, Operation } from "@/types/iha";
import { Badge } from "@/components/ui/Badge";

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
        <div>
          <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-bold text-lg mb-2">
            {member.name.charAt(0)}
          </div>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            {member.name}
          </h3>
          <p className="text-xs text-[var(--muted-foreground)]">{member.role}</p>
        </div>
        {currentOperation ? (
          <Badge variant="warning">Görevde</Badge>
        ) : (
          <Badge variant="success">Müsait</Badge>
        )}
      </div>

      {currentOperation && (
        <p className="text-xs text-[var(--muted-foreground)] mt-2 truncate">
          {currentOperation.title}
        </p>
      )}

      {member.skills && member.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {member.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="text-xs px-1.5 py-0.5 rounded bg-[var(--background)] text-[var(--muted-foreground)]"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
