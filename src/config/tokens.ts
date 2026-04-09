// Design Tokens — CSS değişkenleriyle senkron
// globals.css'teki değerlerle birebir eşleşir

// ─── Renkler ───
// CSS var() referansları — runtime'da tema değişikliğini destekler
export const colors = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  surface: "var(--surface)",
  surfaceHover: "var(--surface-hover)",
  accent: "var(--accent)",
  accentHover: "var(--accent-hover)",
  accentSecondary: "var(--accent-secondary)",
  muted: "var(--muted)",
  mutedForeground: "var(--muted-foreground)",
  border: "var(--border)",
} as const;

// ─── Durum Renkleri (Harita & operasyon durumları) ───
export const statusColors = {
  talep: "var(--status-talep)",
  planlama: "var(--status-planlama)",
  saha: "var(--status-saha)",
  isleme: "var(--status-isleme)",
  kontrol: "var(--status-kontrol)",
  teslim: "var(--status-teslim)",
  iptal: "var(--status-iptal)",
  userLocation: "var(--status-user-location)",
} as const;

// ─── Durum Renkleri — hafif arka plan (12% opacity) ───
export const statusBgColors = {
  talep: "var(--status-talep-bg)",
  planlama: "var(--status-planlama-bg)",
  saha: "var(--status-saha-bg)",
  isleme: "var(--status-isleme-bg)",
  kontrol: "var(--status-kontrol-bg)",
  teslim: "var(--status-teslim-bg)",
  iptal: "var(--status-iptal-bg)",
} as const;

// ─── Operasyon Tipi Renkleri ───
export const typeColors = {
  iha: "var(--type-drone-fotogrametri)",
  lidar: "var(--type-lidar-el)",
  lidar_el: "var(--type-lidar-el)",
  lidar_arac: "var(--type-lidar-arac)",
  drone_fotogrametri: "var(--type-drone-fotogrametri)",
  oblik_cekim: "var(--type-oblik-cekim)",
  panorama_360: "var(--type-panorama-360)",
} as const;

export const typeBgColors = {
  iha: "var(--type-drone-fotogrametri-bg)",
  lidar: "var(--type-lidar-el-bg)",
  lidar_el: "var(--type-lidar-el-bg)",
  lidar_arac: "var(--type-lidar-arac-bg)",
  drone_fotogrametri: "var(--type-drone-fotogrametri-bg)",
  oblik_cekim: "var(--type-oblik-cekim-bg)",
  panorama_360: "var(--type-panorama-360-bg)",
} as const;

// ─── Harita Renkleri ───
export const mapColors = {
  permission: "#22c55e",
  permissionPending: "#eab308",
  permissionRejected: "#ef4444",
  newMarker: "#3b82f6",
  iconDefault: "#333333",
  iconDisabled: "#999999",
  contrastText: "#ffffff",
  emptyText: "#888888",
} as const;

// ─── Tipografi ───
export const fontSize = {
  xs: "0.75rem",    // 12px
  sm: "0.875rem",   // 14px
  base: "1rem",     // 16px
  lg: "1.125rem",   // 18px
  xl: "1.25rem",    // 20px
  "2xl": "1.5rem",  // 24px
  "3xl": "1.875rem", // 30px
  "4xl": "2.25rem", // 36px
} as const;

export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const lineHeight = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
} as const;

// ─── Spacing (4px grid) ───
export const spacing = {
  0: "0",
  0.5: "0.125rem", // 2px
  1: "0.25rem",     // 4px
  2: "0.5rem",      // 8px
  3: "0.75rem",     // 12px
  4: "1rem",        // 16px
  5: "1.25rem",     // 20px
  6: "1.5rem",      // 24px
  8: "2rem",        // 32px
  10: "2.5rem",     // 40px
  12: "3rem",       // 48px
  16: "4rem",       // 64px
  20: "5rem",       // 80px
} as const;

// ─── Border Radius ───
export const radius = {
  none: "0",
  sm: "0.25rem",    // 4px
  md: "0.375rem",   // 6px
  lg: "0.5rem",     // 8px
  xl: "0.75rem",    // 12px
  "2xl": "1rem",    // 16px
  full: "9999px",
} as const;

// ─── Gölgeler ───
export const shadow = {
  none: "none",
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
} as const;

// ─── Animasyon ───
export const duration = {
  fast: "100ms",
  normal: "150ms",
  slow: "300ms",
  slower: "500ms",
} as const;

export const easing = {
  default: "ease-in-out",
  in: "ease-in",
  out: "ease-out",
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
} as const;

// ─── Z-Index ───
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  header: 40,
  modal: 50,
  toast: 60,
} as const;

// ─── Breakpoints ───
export const breakpoint = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// ─── Container ───
export const container = {
  sm: "48rem",      // 768px
  md: "64rem",      // 1024px
  lg: "80rem",      // 1280px
  xl: "87.5rem",    // 1400px
} as const;
