export const VERSION = {
  major: 0,
  minor: 8,
  patch: 214,
  buildDate: "2026-04-19 03:30",
  get full() {
    return `${this.major}.${this.minor}.${this.patch}`;
  },
  get display() {
    return `v${this.full}`;
  },
} as const;
