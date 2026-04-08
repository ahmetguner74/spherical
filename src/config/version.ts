export const VERSION = {
  major: 0,
  minor: 8,
  patch: 32,
  get full() {
    return `${this.major}.${this.minor}.${this.patch}`;
  },
  get display() {
    return `v${this.full}`;
  },
} as const;
