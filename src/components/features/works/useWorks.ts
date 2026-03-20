"use client";

import { useCallback, useMemo, useState } from "react";
import type { Work, WorkStatus } from "@/types";
import { loadWorks, saveWorks } from "./worksStorage";

export interface WorkFilters {
  status: WorkStatus | "all";
  client: string;
}

export function useWorks() {
  const [works, setWorks] = useState<Work[]>(loadWorks);
  const [filters, setFilters] = useState<WorkFilters>({ status: "all", client: "" });

  const clients = useMemo(() => {
    return Array.from(new Set(works.map((w) => w.client))).sort();
  }, [works]);

  const filtered = useMemo(() => {
    let result = [...works];
    if (filters.status !== "all") {
      result = result.filter((w) => w.status === filters.status);
    }
    if (filters.client) {
      result = result.filter((w) => w.client === filters.client);
    }
    return result.sort((a, b) => (a.startDate > b.startDate ? -1 : 1));
  }, [works, filters]);

  const addWork = useCallback((data: Omit<Work, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString().split("T")[0];
    const newWork: Work = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    setWorks((prev) => { const next = [newWork, ...prev]; saveWorks(next); return next; });
  }, []);

  const updateWork = useCallback((id: string, data: Partial<Work>) => {
    const now = new Date().toISOString().split("T")[0];
    setWorks((prev) => {
      const next = prev.map((w) => (w.id === id ? { ...w, ...data, updatedAt: now } : w));
      saveWorks(next);
      return next;
    });
  }, []);

  const deleteWork = useCallback((id: string) => {
    setWorks((prev) => { const next = prev.filter((w) => w.id !== id); saveWorks(next); return next; });
  }, []);

  return { works: filtered, clients, filters, setFilters, addWork, updateWork, deleteWork };
}
