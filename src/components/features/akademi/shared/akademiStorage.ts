"use client";

import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import type { AkademiKurs, AkademiAdim, AkademiGorsel, Annotation } from "@/types/akademi";

// ============================================
// Row → Type Mappers
// ============================================

function rowToKurs(row: Record<string, unknown>): AkademiKurs {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? "",
    software: (row.software as string) ?? "",
    icon: (row.icon as string) ?? undefined,
    difficulty: row.difficulty as AkademiKurs["difficulty"],
    sortOrder: (row.sort_order as number) ?? 0,
    status: row.status as AkademiKurs["status"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToAdim(row: Record<string, unknown>): AkademiAdim {
  return {
    id: row.id as string,
    kursId: row.kurs_id as string,
    stepNumber: (row.step_number as number) ?? 1,
    title: row.title as string,
    content: (row.content as string) ?? "",
    youtubeUrl: (row.youtube_url as string) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToGorsel(row: Record<string, unknown>): AkademiGorsel {
  return {
    id: row.id as string,
    adimId: row.adim_id as string,
    imageUrl: row.image_url as string,
    fileName: row.file_name as string,
    caption: (row.caption as string) ?? undefined,
    sortOrder: (row.sort_order as number) ?? 0,
    annotations: (row.annotations as Annotation[]) ?? [],
    createdAt: row.created_at as string,
  };
}

// ============================================
// Kurslar CRUD
// ============================================

export async function fetchKurslar(): Promise<AkademiKurs[]> {
  const { data, error } = await supabase
    .from("akademi_kurslar")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    logger.error("fetchKurslar", error);
    throw error;
  }
  return (data ?? []).map((r) => rowToKurs(r as Record<string, unknown>));
}

export async function addKurs(
  input: Omit<AkademiKurs, "id" | "createdAt" | "updatedAt">
): Promise<AkademiKurs> {
  const { data, error } = await supabase
    .from("akademi_kurslar")
    .insert({
      title: input.title,
      description: input.description,
      software: input.software,
      icon: input.icon ?? null,
      difficulty: input.difficulty,
      sort_order: input.sortOrder,
      status: input.status,
    })
    .select()
    .single();
  if (error) {
    logger.error("addKurs", error);
    throw error;
  }
  return rowToKurs(data as Record<string, unknown>);
}

export async function updateKurs(
  id: string,
  updates: Partial<AkademiKurs>
): Promise<void> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.software !== undefined) row.software = updates.software;
  if (updates.icon !== undefined) row.icon = updates.icon ?? null;
  if (updates.difficulty !== undefined) row.difficulty = updates.difficulty;
  if (updates.sortOrder !== undefined) row.sort_order = updates.sortOrder;
  if (updates.status !== undefined) row.status = updates.status;

  const { error } = await supabase
    .from("akademi_kurslar")
    .update(row)
    .eq("id", id);
  if (error) {
    logger.error("updateKurs", error);
    throw error;
  }
}

export async function deleteKurs(id: string): Promise<void> {
  const { error } = await supabase
    .from("akademi_kurslar")
    .delete()
    .eq("id", id);
  if (error) {
    logger.error("deleteKurs", error);
    throw error;
  }
}

// ============================================
// Adımlar CRUD
// ============================================

export async function fetchAdimlar(kursId: string): Promise<AkademiAdim[]> {
  const { data, error } = await supabase
    .from("akademi_adimlar")
    .select("*")
    .eq("kurs_id", kursId)
    .order("step_number", { ascending: true });
  if (error) {
    logger.error("fetchAdimlar", error);
    throw error;
  }
  return (data ?? []).map((r) => rowToAdim(r as Record<string, unknown>));
}

export async function addAdim(
  input: Omit<AkademiAdim, "id" | "createdAt" | "updatedAt">
): Promise<AkademiAdim> {
  const { data, error } = await supabase
    .from("akademi_adimlar")
    .insert({
      kurs_id: input.kursId,
      step_number: input.stepNumber,
      title: input.title,
      content: input.content,
      youtube_url: input.youtubeUrl ?? null,
    })
    .select()
    .single();
  if (error) {
    logger.error("addAdim", error);
    throw error;
  }
  return rowToAdim(data as Record<string, unknown>);
}

export async function updateAdim(
  id: string,
  updates: Partial<AkademiAdim>
): Promise<void> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.stepNumber !== undefined) row.step_number = updates.stepNumber;
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.content !== undefined) row.content = updates.content;
  if (updates.youtubeUrl !== undefined) row.youtube_url = updates.youtubeUrl ?? null;

  const { error } = await supabase
    .from("akademi_adimlar")
    .update(row)
    .eq("id", id);
  if (error) {
    logger.error("updateAdim", error);
    throw error;
  }
}

export async function deleteAdim(id: string): Promise<void> {
  const { error } = await supabase
    .from("akademi_adimlar")
    .delete()
    .eq("id", id);
  if (error) {
    logger.error("deleteAdim", error);
    throw error;
  }
}

// ============================================
// Görseller CRUD
// ============================================

export async function fetchGorseller(adimId: string): Promise<AkademiGorsel[]> {
  const { data, error } = await supabase
    .from("akademi_gorseller")
    .select("*")
    .eq("adim_id", adimId)
    .order("sort_order", { ascending: true });
  if (error) {
    logger.error("fetchGorseller", error);
    throw error;
  }
  return (data ?? []).map((r) => rowToGorsel(r as Record<string, unknown>));
}

export async function addGorsel(
  input: Omit<AkademiGorsel, "id" | "createdAt">
): Promise<AkademiGorsel> {
  const { data, error } = await supabase
    .from("akademi_gorseller")
    .insert({
      adim_id: input.adimId,
      image_url: input.imageUrl,
      file_name: input.fileName,
      caption: input.caption ?? null,
      sort_order: input.sortOrder,
      annotations: input.annotations ?? [],
    })
    .select()
    .single();
  if (error) {
    logger.error("addGorsel", error);
    throw error;
  }
  return rowToGorsel(data as Record<string, unknown>);
}

export async function updateGorsel(
  id: string,
  updates: Partial<AkademiGorsel>
): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.caption !== undefined) row.caption = updates.caption ?? null;
  if (updates.sortOrder !== undefined) row.sort_order = updates.sortOrder;
  if (updates.annotations !== undefined) row.annotations = updates.annotations;

  const { error } = await supabase
    .from("akademi_gorseller")
    .update(row)
    .eq("id", id);
  if (error) {
    logger.error("updateGorsel", error);
    throw error;
  }
}

export async function deleteGorsel(id: string, imageUrl: string): Promise<void> {
  // Supabase Storage'dan dosyayı sil
  const path = extractStoragePath(imageUrl);
  if (path) {
    const { error: storageError } = await supabase.storage
      .from("akademi-files")
      .remove([path]);
    if (storageError) {
      logger.error("deleteGorsel storage", storageError);
    }
  }

  // DB'den kaydı sil
  const { error } = await supabase
    .from("akademi_gorseller")
    .delete()
    .eq("id", id);
  if (error) {
    logger.error("deleteGorsel", error);
    throw error;
  }
}

// ============================================
// File Upload
// ============================================

export async function uploadScreenshot(
  kursId: string,
  adimId: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "png";
  const fileName = `${kursId}/${adimId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("akademi-files")
    .upload(fileName, file, { upsert: false });
  if (error) {
    logger.error("uploadScreenshot", error);
    throw error;
  }

  const { data: urlData } = supabase.storage
    .from("akademi-files")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

// ============================================
// Internal Helpers
// ============================================

/** Public URL'den storage path'i çıkar */
function extractStoragePath(publicUrl: string): string | null {
  const marker = "/object/public/akademi-files/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}
