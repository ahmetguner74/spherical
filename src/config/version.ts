export const VERSION = {
  major: 0,
  minor: 8,
  patch: 221,
  buildDate: "2026-04-21 01:21",

  get full() {
    return `${this.major}.${this.minor}.${this.patch}`;
  },
  get display() {
    return `v${this.full}`;
  },
} as const;
