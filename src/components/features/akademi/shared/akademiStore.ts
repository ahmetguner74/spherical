"use client";

import { create } from "zustand";
import type { AkademiKurs, AkademiAdim, AkademiGorsel, AkademiView } from "@/types/akademi";
import * as db from "./akademiStorage";
import { logger } from "@/lib/logger";

// ============================================
// State
// ============================================

interface AkademiState {
  kurslar: AkademiKurs[];
  adimlar: AkademiAdim[];
  gorseller: AkademiGorsel[];
  view: AkademiView;
  selectedKursId: string | null;
  selectedAdimId: string | null;
  loading: boolean;
  initialized: boolean;

  // Navigation
  setView: (view: AkademiView) => void;
  selectKurs: (id: string) => void;
  selectAdim: (id: string) => void;
  goBack: () => void;

  // Init
  initialize: () => Promise<void>;

  // Kurs CRUD
  addKurs: (data: Omit<AkademiKurs, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateKurs: (id: string, updates: Partial<AkademiKurs>) => Promise<void>;
  deleteKurs: (id: string) => Promise<void>;

  // Adım CRUD
  loadAdimlar: (kursId: string) => Promise<void>;
  addAdim: (data: Omit<AkademiAdim, "id" | "createdAt" | "updatedAt">) => Promise<string | null>;
  updateAdim: (id: string, updates: Partial<AkademiAdim>) => Promise<void>;
  deleteAdim: (id: string) => Promise<void>;
  reorderAdim: (id: string, direction: "up" | "down") => Promise<void>;

  // Görsel CRUD
  loadGorseller: (adimId: string) => Promise<void>;
  addGorsel: (data: Omit<AkademiGorsel, "id" | "createdAt">) => Promise<void>;
  updateGorsel: (id: string, updates: Partial<AkademiGorsel>) => Promise<void>;
  deleteGorsel: (id: string, imageUrl: string) => Promise<void>;
}

// ============================================
// Store
// ============================================

export const useAkademiStore = create<AkademiState>()((set, get) => ({
  kurslar: [],
  adimlar: [],
  gorseller: [],
  view: "kurslar",
  selectedKursId: null,
  selectedAdimId: null,
  loading: false,
  initialized: false,

  // --- Navigation ---
  setView: (view) => set({ view }),

  selectKurs: (id) => {
    set({ selectedKursId: id, selectedAdimId: null, view: "kursDetay", adimlar: [], gorseller: [] });
    get().loadAdimlar(id);
  },

  selectAdim: (id) => {
    set({ selectedAdimId: id, view: "adimDuzenle", gorseller: [] });
    get().loadGorseller(id);
  },

  goBack: () => {
    const { view } = get();
    if (view === "adimDuzenle") {
      set({ selectedAdimId: null, gorseller: [], view: "kursDetay" });
    } else if (view === "kursDetay") {
      set({ selectedKursId: null, selectedAdimId: null, adimlar: [], gorseller: [], view: "kurslar" });
    }
  },

  // --- Init ---
  initialize: async () => {
    const s = get();
    if (s.initialized || s.loading) return;
    set({ loading: true });
    try {
      const kurslar = await db.fetchKurslar();
      set({ kurslar, initialized: true, loading: false });
    } catch (err) {
      logger.error("akademi initialize", err);
      set({ initialized: true, loading: false });
    }
  },

  // --- Kurs CRUD ---
  addKurs: async (data) => {
    try {
      await db.addKurs(data);
      const kurslar = await db.fetchKurslar();
      set({ kurslar });
    } catch (err) {
      logger.error("addKurs", err);
    }
  },

  updateKurs: async (id, updates) => {
    try {
      await db.updateKurs(id, updates);
      const kurslar = await db.fetchKurslar();
      set({ kurslar });
    } catch (err) {
      logger.error("updateKurs", err);
    }
  },

  deleteKurs: async (id) => {
    try {
      await db.deleteKurs(id);
      const kurslar = await db.fetchKurslar();
      set({ kurslar, selectedKursId: null, adimlar: [], gorseller: [], view: "kurslar" });
    } catch (err) {
      logger.error("deleteKurs", err);
    }
  },

  // --- Adım CRUD ---
  loadAdimlar: async (kursId) => {
    try {
      const adimlar = await db.fetchAdimlar(kursId);
      set({ adimlar });
    } catch (err) {
      logger.error("loadAdimlar", err);
      set({ adimlar: [] });
    }
  },

  addAdim: async (data) => {
    try {
      const created = await db.addAdim(data);
      const adimlar = await db.fetchAdimlar(data.kursId);
      set({ adimlar });
      return created.id;
    } catch (err) {
      logger.error("addAdim", err);
      return null;
    }
  },

  updateAdim: async (id, updates) => {
    try {
      await db.updateAdim(id, updates);
      const { selectedKursId } = get();
      if (selectedKursId) {
        const adimlar = await db.fetchAdimlar(selectedKursId);
        set({ adimlar });
      }
    } catch (err) {
      logger.error("updateAdim", err);
    }
  },

  deleteAdim: async (id) => {
    try {
      await db.deleteAdim(id);
      const { selectedKursId } = get();
      if (selectedKursId) {
        const adimlar = await db.fetchAdimlar(selectedKursId);
        set({ adimlar, selectedAdimId: null, gorseller: [], view: "kursDetay" });
      }
    } catch (err) {
      logger.error("deleteAdim", err);
    }
  },

  reorderAdim: async (id, direction) => {
    const { adimlar, selectedKursId } = get();
    const idx = adimlar.findIndex((a) => a.id === id);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= adimlar.length) return;

    const current = adimlar[idx];
    const target = adimlar[swapIdx];
    try {
      await db.updateAdim(current.id, { stepNumber: target.stepNumber });
      await db.updateAdim(target.id, { stepNumber: current.stepNumber });
      if (selectedKursId) {
        const fresh = await db.fetchAdimlar(selectedKursId);
        set({ adimlar: fresh });
      }
    } catch (err) {
      logger.error("reorderAdim", err);
    }
  },

  // --- Görsel CRUD ---
  loadGorseller: async (adimId) => {
    try {
      const gorseller = await db.fetchGorseller(adimId);
      set({ gorseller });
    } catch (err) {
      logger.error("loadGorseller", err);
      set({ gorseller: [] });
    }
  },

  addGorsel: async (data) => {
    try {
      await db.addGorsel(data);
      const gorseller = await db.fetchGorseller(data.adimId);
      set({ gorseller });
    } catch (err) {
      logger.error("addGorsel", err);
      const { selectedAdimId } = get();
      if (selectedAdimId) {
        const gorseller = await db.fetchGorseller(selectedAdimId);
        set({ gorseller });
      }
    }
  },

  updateGorsel: async (id, updates) => {
    try {
      await db.updateGorsel(id, updates);
      const { selectedAdimId } = get();
      if (selectedAdimId) {
        const gorseller = await db.fetchGorseller(selectedAdimId);
        set({ gorseller });
      }
    } catch (err) {
      logger.error("updateGorsel", err);
      const { selectedAdimId } = get();
      if (selectedAdimId) {
        const gorseller = await db.fetchGorseller(selectedAdimId);
        set({ gorseller });
      }
    }
  },

  deleteGorsel: async (id, imageUrl) => {
    try {
      await db.deleteGorsel(id, imageUrl);
      const { selectedAdimId } = get();
      if (selectedAdimId) {
        const gorseller = await db.fetchGorseller(selectedAdimId);
        set({ gorseller });
      }
    } catch (err) {
      logger.error("deleteGorsel", err);
      const { selectedAdimId } = get();
      if (selectedAdimId) {
        const gorseller = await db.fetchGorseller(selectedAdimId);
        set({ gorseller });
      }
    }
  },
}));
