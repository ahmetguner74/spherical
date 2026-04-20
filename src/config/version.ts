export const VERSION = {
  major: 0,
  minor: 8,
  patch: 219,
  buildDate: "2026-04-20 18:47",
  get full() {
    return `${this.major}.${this.minor}.${this.patch}`;
  },
  get display() {
    return `v${this.full}`;
  },
} as const;
