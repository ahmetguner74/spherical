import type { Work } from "@/types";
import seedData from "@/data/works.json";

const STORAGE_KEY = "spherical-works";

export function loadWorks(): Work[] {
  if (typeof window === "undefined") return seedData as Work[];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored) as Work[];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
  return seedData as Work[];
}

export function saveWorks(works: Work[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(works));
}
