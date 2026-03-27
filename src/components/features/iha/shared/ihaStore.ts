"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Equipment,
  Software,
  StorageUnit,
  TeamMember,
  Operation,
  AuditEntry,
  AuditAction,
  AuditTarget,
  IhaTab,
  EquipmentCategory,
  OperationStatus,
} from "@/types/iha";
import {
  SEED_EQUIPMENT,
  SEED_SOFTWARE,
  SEED_STORAGE,
  SEED_TEAM,
  SEED_OPERATIONS,
} from "@/config/iha-seed";

interface IhaFilters {
  equipmentCategory: EquipmentCategory | "all";
  operationStatus: OperationStatus | "all";
  searchText: string;
}

interface IhaState {
  // Data
  equipment: Equipment[];
  software: Software[];
  storage: StorageUnit[];
  team: TeamMember[];
  operations: Operation[];
  auditLog: AuditEntry[];

  // UI
  activeTab: IhaTab;
  filters: IhaFilters;
  initialized: boolean;

  // Tab
  setActiveTab: (tab: IhaTab) => void;

  // Filters
  setFilter: <K extends keyof IhaFilters>(
    key: K,
    value: IhaFilters[K]
  ) => void;

  // Equipment CRUD
  addEquipment: (item: Omit<Equipment, "id">) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;

  // Software CRUD
  addSoftware: (item: Omit<Software, "id">) => void;
  updateSoftware: (id: string, updates: Partial<Software>) => void;
  deleteSoftware: (id: string) => void;

  // Storage CRUD
  updateStorage: (id: string, updates: Partial<StorageUnit>) => void;

  // Team CRUD
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;

  // Operations CRUD
  addOperation: (item: Omit<Operation, "id" | "createdAt" | "updatedAt">) => void;
  updateOperation: (id: string, updates: Partial<Operation>) => void;
  deleteOperation: (id: string) => void;

  // Init
  initialize: () => void;
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}

function addAuditEntry(
  log: AuditEntry[],
  action: AuditAction,
  target: AuditTarget,
  targetId: string,
  description: string
): AuditEntry[] {
  const entry: AuditEntry = {
    id: generateId("audit"),
    action,
    target,
    targetId,
    description,
    performedBy: "kullanici",
    performedAt: new Date().toISOString(),
  };
  return [entry, ...log].slice(0, 200);
}

export const useIhaStore = create<IhaState>()(
  persist(
    (set) => ({
      equipment: [],
      software: [],
      storage: [],
      team: [],
      operations: [],
      auditLog: [],
      activeTab: "dashboard",
      filters: {
        equipmentCategory: "all",
        operationStatus: "all",
        searchText: "",
      },
      initialized: false,

      setActiveTab: (tab) => set({ activeTab: tab }),

      setFilter: (key, value) =>
        set((s) => ({ filters: { ...s.filters, [key]: value } })),

      initialize: () =>
        set((s) => {
          if (s.initialized) return s;
          return {
            equipment: SEED_EQUIPMENT,
            software: SEED_SOFTWARE,
            storage: SEED_STORAGE,
            team: SEED_TEAM,
            operations: SEED_OPERATIONS,
            initialized: true,
          };
        }),

      // Equipment
      addEquipment: (item) =>
        set((s) => {
          const newItem: Equipment = { ...item, id: generateId("eq") };
          return {
            equipment: [...s.equipment, newItem],
            auditLog: addAuditEntry(
              s.auditLog,
              "ekledi",
              "ekipman",
              newItem.id,
              `${newItem.name} eklendi`
            ),
          };
        }),

      updateEquipment: (id, updates) =>
        set((s) => ({
          equipment: s.equipment.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
          auditLog: addAuditEntry(
            s.auditLog,
            "guncelledi",
            "ekipman",
            id,
            `Ekipman güncellendi`
          ),
        })),

      deleteEquipment: (id) =>
        set((s) => ({
          equipment: s.equipment.filter((e) => e.id !== id),
          auditLog: addAuditEntry(
            s.auditLog,
            "sildi",
            "ekipman",
            id,
            `Ekipman silindi`
          ),
        })),

      // Software
      addSoftware: (item) =>
        set((s) => {
          const newItem: Software = { ...item, id: generateId("sw") };
          return {
            software: [...s.software, newItem],
            auditLog: addAuditEntry(
              s.auditLog,
              "ekledi",
              "yazilim",
              newItem.id,
              `${newItem.name} eklendi`
            ),
          };
        }),

      updateSoftware: (id, updates) =>
        set((s) => ({
          software: s.software.map((sw) =>
            sw.id === id ? { ...sw, ...updates } : sw
          ),
          auditLog: addAuditEntry(
            s.auditLog,
            "guncelledi",
            "yazilim",
            id,
            `Yazılım güncellendi`
          ),
        })),

      deleteSoftware: (id) =>
        set((s) => ({
          software: s.software.filter((sw) => sw.id !== id),
          auditLog: addAuditEntry(
            s.auditLog,
            "sildi",
            "yazilim",
            id,
            `Yazılım silindi`
          ),
        })),

      // Storage
      updateStorage: (id, updates) =>
        set((s) => ({
          storage: s.storage.map((st) =>
            st.id === id ? { ...st, ...updates } : st
          ),
          auditLog: addAuditEntry(
            s.auditLog,
            "guncelledi",
            "depolama",
            id,
            `Depolama güncellendi`
          ),
        })),

      // Team
      updateTeamMember: (id, updates) =>
        set((s) => ({
          team: s.team.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
          auditLog: addAuditEntry(
            s.auditLog,
            "guncelledi",
            "personel",
            id,
            `Personel güncellendi`
          ),
        })),

      // Operations
      addOperation: (item) =>
        set((s) => {
          const now = new Date().toISOString();
          const newOp: Operation = {
            ...item,
            id: generateId("op"),
            createdAt: now,
            updatedAt: now,
          };
          return {
            operations: [...s.operations, newOp],
            auditLog: addAuditEntry(
              s.auditLog,
              "ekledi",
              "operasyon",
              newOp.id,
              `${newOp.title} operasyonu eklendi`
            ),
          };
        }),

      updateOperation: (id, updates) =>
        set((s) => ({
          operations: s.operations.map((op) =>
            op.id === id
              ? { ...op, ...updates, updatedAt: new Date().toISOString() }
              : op
          ),
          auditLog: addAuditEntry(
            s.auditLog,
            "guncelledi",
            "operasyon",
            id,
            `Operasyon güncellendi`
          ),
        })),

      deleteOperation: (id) =>
        set((s) => ({
          operations: s.operations.filter((op) => op.id !== id),
          auditLog: addAuditEntry(
            s.auditLog,
            "sildi",
            "operasyon",
            id,
            `Operasyon silindi`
          ),
        })),
    }),
    {
      name: "spherical-iha-store",
      partialize: (state) => ({
        equipment: state.equipment,
        software: state.software,
        storage: state.storage,
        team: state.team,
        operations: state.operations,
        auditLog: state.auditLog,
        initialized: state.initialized,
      }),
    }
  )
);
