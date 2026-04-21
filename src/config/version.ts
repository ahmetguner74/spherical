export const VERSION = {
  major: 0,
  minor: 8,
  patch: 223,
  buildDate: "2026-04-21 12:28",

  get full() {
    return `${this.major}.${this.minor}.${this.patch}`;
  },
  get display() {
    return `v${this.full}`;
  },
} as const;
