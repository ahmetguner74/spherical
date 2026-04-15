export const VERSION = {
  major: 0,
  minor: 8,
  patch: 174,
  buildDate: "2026-04-15 22:30",
  get full() {
    return `${this.major}.${this.minor}.${this.patch}`;
  },
  get display() {
    return `v${this.full}`;
  },
} as const;
