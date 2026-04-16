export const VERSION = {
  major: 0,
  minor: 8,
  patch: 186,
  buildDate: "2026-04-16 09:53",
  get full() {
    return `${this.major}.${this.minor}.${this.patch}`;
  },
  get display() {
    return `v${this.full}`;
  },
} as const;
