export const VERSION = {
  major: 0,
  minor: 8,
  patch: 164,
  buildDate: "2026-04-15 03:00",
  get full() {
    return `${this.major}.${this.minor}.${this.patch}`;
  },
  get display() {
    return `v${this.full}`;
  },
} as const;
