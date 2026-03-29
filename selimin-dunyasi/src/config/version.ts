export const VERSION = {
  major: 0,
  minor: 1,
  patch: 0,
  get full() {
    return `${this.major}.${this.minor}.${this.patch}`;
  },
  get display() {
    return `v${this.full}`;
  },
} as const;
