export const VERSION = {
  major: 0,
  minor: 8,
  patch: 212,
  buildDate: "2026-04-17 00:30",
  get full() {
    return `${this.major}.${this.minor}.${this.patch}`;
  },
  get display() {
    return `v${this.full}`;
  },
} as const;
