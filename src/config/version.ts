export const VERSION = {
  major: 0,
  minor: 8,
  patch: 157,
  buildDate: "2026-04-14 23:52",
  get full() {
    return `${this.major}.${this.minor}.${this.patch}`;
  },
  get display() {
    return `v${this.full}`;
  },
} as const;
