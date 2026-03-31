export interface MapNode {
  id: string;
  label: string;
  category: string;
}

export interface MapEdge {
  source: string;
  target: string;
}

export const CATEGORIES: Record<string, { color: string; label: string }> = {
  page: { color: "#60A5FA", label: "Sayfalar" },
  layout: { color: "#FBBF24", label: "Layout" },
  provider: { color: "#A78BFA", label: "Provider" },
  ui: { color: "#34D399", label: "UI" },
  feature: { color: "#FB923C", label: "Feature" },
  hook: { color: "#F472B6", label: "Hook" },
  config: { color: "#F87171", label: "Config" },
  type: { color: "#38BDF8", label: "Type" },
  lib: { color: "#2DD4BF", label: "Lib" },
  store: { color: "#4ADE80", label: "Store" },
};

export const nodes: MapNode[] = [
  // Sayfalar
  { id: "p-home", label: "Ana Sayfa", category: "page" },
  { id: "p-blog", label: "Blog", category: "page" },
  { id: "p-projects", label: "Projeler", category: "page" },
  { id: "p-works", label: "İşlerim", category: "page" },
  { id: "p-iha", label: "İHA Birimi", category: "page" },
  { id: "p-selim", label: "Selim", category: "page" },
  { id: "p-selim-mat", label: "Matematik Quiz", category: "page" },
  { id: "p-about", label: "Hakkımda", category: "page" },

  // Layout
  { id: "l-root", label: "Root Layout", category: "layout" },
  { id: "l-marketing", label: "Marketing Layout", category: "layout" },
  { id: "lc-header", label: "Header", category: "layout" },
  { id: "lc-footer", label: "Footer", category: "layout" },
  { id: "lc-mobile", label: "MobileMenu", category: "layout" },
  { id: "lc-version", label: "VersionBadge", category: "layout" },

  // Provider
  { id: "pv-theme", label: "ThemeProvider", category: "provider" },
  { id: "pv-password", label: "PasswordGate", category: "provider" },

  // UI
  { id: "ui-btn", label: "Button", category: "ui" },
  { id: "ui-card", label: "Card", category: "ui" },
  { id: "ui-badge", label: "Badge", category: "ui" },
  { id: "ui-container", label: "Container", category: "ui" },
  { id: "ui-modal", label: "Modal", category: "ui" },
  { id: "ui-icons", label: "Icons", category: "ui" },
  { id: "ui-collapse", label: "Collapsible", category: "ui" },
  { id: "ui-toast", label: "Toast", category: "ui" },

  // Feature — Dashboard
  { id: "f-dash-grid", label: "DashboardGrid", category: "feature" },
  { id: "f-dash-card", label: "DashboardCard", category: "feature" },

  // Feature — İHA
  { id: "f-iha", label: "İHA Container", category: "feature" },
  { id: "f-iha-tab", label: "TabNav", category: "feature" },
  { id: "f-iha-dash", label: "İHA Dashboard", category: "feature" },
  { id: "f-iha-ops", label: "Operasyonlar", category: "feature" },
  { id: "f-iha-perm", label: "Uçuş İzinleri", category: "feature" },
  { id: "f-iha-flight", label: "Uçuş Defteri", category: "feature" },
  { id: "f-iha-map", label: "Harita Tab", category: "feature" },
  { id: "f-iha-inv", label: "Envanter", category: "feature" },
  { id: "f-iha-pers", label: "Personel", category: "feature" },
  { id: "f-iha-stor", label: "Depolama", category: "feature" },
  { id: "f-iha-rep", label: "Raporlar", category: "feature" },

  // Feature — Works
  { id: "f-works", label: "WorksContainer", category: "feature" },
  { id: "f-works-tbl", label: "WorksTable", category: "feature" },
  { id: "f-works-grid", label: "WorksGrid", category: "feature" },
  { id: "f-works-detail", label: "WorkDetail", category: "feature" },

  // Feature — Selim
  { id: "f-selim-quiz", label: "MatematikQuiz", category: "feature" },
  { id: "f-selim-q", label: "Sorular", category: "feature" },
  { id: "f-selim-xp", label: "XPBar", category: "feature" },
  { id: "f-selim-hearts", label: "Hearts", category: "feature" },
  { id: "f-selim-part", label: "Particles", category: "feature" },
  { id: "f-selim-frac", label: "Frac", category: "feature" },

  // Feature — Changelog
  { id: "f-changelog", label: "ChangelogModal", category: "feature" },

  // Hook
  { id: "h-theme", label: "useTheme", category: "hook" },
  { id: "h-media", label: "useMediaQuery", category: "hook" },
  { id: "h-auth", label: "useAuth", category: "hook" },
  { id: "h-iha-data", label: "useIhaData", category: "hook" },
  { id: "h-works", label: "useWorks", category: "hook" },

  // Config
  { id: "c-site", label: "site.ts", category: "config" },
  { id: "c-auth", label: "auth.ts", category: "config" },
  { id: "c-tokens", label: "tokens.ts", category: "config" },
  { id: "c-version", label: "version.ts", category: "config" },
  { id: "c-changelog", label: "changelog.ts", category: "config" },
  { id: "c-iha-seed", label: "iha-seed.ts", category: "config" },

  // Type
  { id: "t-core", label: "types/index", category: "type" },
  { id: "t-iha", label: "types/iha", category: "type" },

  // Lib
  { id: "lib-supa", label: "supabase", category: "lib" },
  { id: "lib-utils", label: "utils", category: "lib" },
  { id: "lib-iha-db", label: "ihaStorage", category: "lib" },
  { id: "lib-iha-offline", label: "offlineQueue", category: "lib" },
  { id: "lib-works-db", label: "worksStorage", category: "lib" },

  // Store
  { id: "s-theme", label: "themeStore", category: "store" },
  { id: "s-iha", label: "ihaStore", category: "store" },
];

export const edges: MapEdge[] = [
  // Root Layout
  { source: "l-root", target: "pv-theme" },
  { source: "l-root", target: "pv-password" },

  // Marketing Layout
  { source: "l-marketing", target: "lc-header" },
  { source: "l-marketing", target: "lc-footer" },
  { source: "l-marketing", target: "ui-toast" },

  // Sayfalar → Feature
  { source: "p-home", target: "f-dash-grid" },
  { source: "p-works", target: "f-works" },
  { source: "p-iha", target: "f-iha" },
  { source: "p-selim-mat", target: "f-selim-quiz" },

  // Layout bileşenleri
  { source: "lc-header", target: "c-site" },
  { source: "lc-header", target: "h-theme" },
  { source: "lc-header", target: "ui-icons" },
  { source: "lc-header", target: "lc-mobile" },
  { source: "lc-footer", target: "lc-version" },
  { source: "lc-version", target: "c-version" },
  { source: "lc-version", target: "c-changelog" },
  { source: "lc-version", target: "f-changelog" },

  // Providers
  { source: "pv-theme", target: "s-theme" },
  { source: "pv-password", target: "h-auth" },

  // Dashboard
  { source: "f-dash-grid", target: "f-dash-card" },

  // İHA — Container → Tabs
  { source: "f-iha", target: "f-iha-tab" },
  { source: "f-iha", target: "h-iha-data" },
  { source: "f-iha", target: "f-iha-dash" },
  { source: "f-iha", target: "f-iha-ops" },
  { source: "f-iha", target: "f-iha-perm" },
  { source: "f-iha", target: "f-iha-flight" },
  { source: "f-iha", target: "f-iha-map" },
  { source: "f-iha", target: "f-iha-inv" },
  { source: "f-iha", target: "f-iha-pers" },
  { source: "f-iha", target: "f-iha-stor" },
  { source: "f-iha", target: "f-iha-rep" },

  // İHA — Veri akışı
  { source: "h-iha-data", target: "s-iha" },
  { source: "s-iha", target: "t-iha" },
  { source: "s-iha", target: "lib-iha-db" },
  { source: "s-iha", target: "lib-iha-offline" },
  { source: "s-iha", target: "ui-toast" },
  { source: "lib-iha-db", target: "lib-supa" },
  { source: "lib-iha-db", target: "t-iha" },
  { source: "f-iha-dash", target: "s-iha" },
  { source: "f-iha-ops", target: "s-iha" },

  // Works
  { source: "f-works", target: "h-works" },
  { source: "f-works", target: "f-works-tbl" },
  { source: "f-works", target: "f-works-grid" },
  { source: "f-works", target: "f-works-detail" },
  { source: "h-works", target: "lib-works-db" },
  { source: "h-works", target: "t-core" },
  { source: "lib-works-db", target: "lib-supa" },
  { source: "lib-works-db", target: "t-core" },

  // Selim
  { source: "f-selim-quiz", target: "f-selim-q" },
  { source: "f-selim-quiz", target: "f-selim-xp" },
  { source: "f-selim-quiz", target: "f-selim-hearts" },
  { source: "f-selim-quiz", target: "f-selim-part" },
  { source: "f-selim-q", target: "f-selim-frac" },

  // Hooks
  { source: "h-auth", target: "c-auth" },
  { source: "h-theme", target: "pv-theme" },

  // UI → utils
  { source: "ui-btn", target: "lib-utils" },
  { source: "ui-card", target: "lib-utils" },
  { source: "ui-badge", target: "lib-utils" },
  { source: "ui-container", target: "lib-utils" },
];
