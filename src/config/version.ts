export const VERSION = {
  major: 0,
  minor: 8,
  patch: 218,
  buildDate: "2026-04-20 18:42",
  get full() {
    return `${this.major}.${this.minor}.${this.patch}`;
  },
  get display() {
    return `v${this.full}`;
  },
} as const;
