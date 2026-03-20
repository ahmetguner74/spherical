"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Work, WorkStatus } from "@/types";
import { fetchWorks, insertWork, patchWork, removeWork } from "./worksStorage";

export interface WorkFilters {
  status: WorkStatus | "all";
  client: string;
}

export function useWorks() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WorkFilters>({ status: "all", client: "" });

  useEffect(() => {
    fetchWorks()
      .then(setWorks)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

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

  const addWork = useCallback(
    async (data: Omit<Work, "id" | "createdAt" | "updatedAt">) => {
      const newWork = await insertWork(data);
      setWorks((prev) => [newWork, ...prev]);
    },
    [],
  );

  const updateWork = useCallback(
    async (id: string, data: Partial<Work>) => {
      const updated = await patchWork(id, data);
      setWorks((prev) => prev.map((w) => (w.id === id ? updated : w)));
    },
    [],
  );

  const deleteWork = useCallback(async (id: string) => {
    await removeWork(id);
    setWorks((prev) => prev.filter((w) => w.id !== id));
  }, []);

  return {
    works: filtered,
    clients,
    filters,
    setFilters,
    addWork,
    updateWork,
    deleteWork,
    loading,
    error,
  };
}
