export const VERSION = {
  major: 0,
  minor: 8,
  patch: 161,
  buildDate: "2026-04-15 01:30",
  get full() {
    return `${this.major}.${this.minor}.${this.patch}`;
  },
  get display() {
    return `v${this.full}`;
  },
} as const;
