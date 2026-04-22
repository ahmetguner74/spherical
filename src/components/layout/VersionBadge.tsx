"use client";

import { useState } from "react";
import { VERSION } from "@/config/version";
import { ChangelogModal } from "@/components/features/changelog";

import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/config/permissions";

export function VersionBadge() {
  const [open, setOpen] = useState(false);
  const { profile } = useAuth();
  
  const canSeeChangelog = profile && hasPermission(profile.role, "system.changelog");

  if (!canSeeChangelog) {
    return (
      <span className="px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
        {VERSION.display}
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md px-2 py-0.5 text-xs text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--accent)]"
      >
        {VERSION.display}
      </button>

      {open && <ChangelogModal onClose={() => setOpen(false)} />}
    </>
  );
}
