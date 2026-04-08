"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useIhaStore } from "./ihaStore";
import type { RealtimeChannel } from "@supabase/supabase-js";

const TABLE_MAP: Record<string, "operations" | "equipment" | "software" | "team" | "storage" | "flightLogs" | "flightPermissions"> = {
  iha_operations: "operations",
  iha_equipment: "equipment",
  iha_software: "software",
  iha_team: "team",
  iha_storage: "storage",
  iha_flight_logs: "flightLogs",
  iha_flight_permissions: "flightPermissions",
};

export function useRealtimeSync() {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reloadTable = useIhaStore((s) => s.reloadTable);
  const initialized = useIhaStore((s) => s.initialized);

  useEffect(() => {
    if (!initialized) return;

    const channel = supabase
      .channel("iha-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "iha_operations" },
        () => reloadTable("operations")
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "iha_equipment" },
        () => reloadTable("equipment")
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "iha_flight_permissions" },
        () => reloadTable("flightPermissions")
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "iha_flight_logs" },
        () => reloadTable("flightLogs")
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "iha_team" },
        () => reloadTable("team")
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "iha_storage" },
        () => reloadTable("storage")
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "iha_software" },
        () => reloadTable("software")
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [initialized, reloadTable]);
}
