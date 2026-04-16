export const VERSION = {
  major: 0,
  minor: 8,
  patch: 187,
  buildDate: "2026-04-16 10:07",
  get full() {
    return `${this.major}.${this.minor}.${this.patch}`;
  },
  get display() {
    return `v${this.full}`;
  },
} as const;
