export const VERSION = {
  major: 0,
  minor: 8,
  patch: 213,
  buildDate: "2026-04-18 20:16",
  get full() {
    return `${this.major}.${this.minor}.${this.patch}`;
  },
  get display() {
    return `v${this.full}`;
  },
} as const;
