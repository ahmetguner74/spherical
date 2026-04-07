// ============================================
// Spherical Platform - Core Type Definitions
// ============================================

// --- Navigation ---
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
  requiresAuth?: boolean;
}

// --- Theme ---
export type Theme = "light" | "dark" | "system";

// --- User ---
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "editor" | "viewer";
}

// --- Project ---
export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  tags: string[];
  status: "draft" | "active" | "archived";
  createdAt: string;
  updatedAt: string;
}

// --- 3D / Viewer ---
export interface ViewerScene {
  id: string;
  name: string;
  modelUrl: string;
  thumbnailUrl?: string;
  projectId: string;
  settings: ViewerSettings;
}

export interface ViewerSettings {
  backgroundColor: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  lightIntensity: number;
  showGrid: boolean;
  showAxes: boolean;
}

// --- API Response ---
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// --- Pagination ---
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
