export interface Level {
  name: string;
  ikon: string;
  minXP: number;
}

export const LEVELS: Level[] = [
  { name: "Çırak", ikon: "🌱", minXP: 0 },
  { name: "Savaşçı", ikon: "⚔️", minXP: 51 },
  { name: "Şövalye", ikon: "🛡️", minXP: 151 },
  { name: "Büyücü", ikon: "🧙", minXP: 301 },
  { name: "Efsane", ikon: "🏆", minXP: 501 },
];

export function getLevel(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getNextLevel(xp: number): Level | null {
  const current = getLevel(xp);
  const idx = LEVELS.indexOf(current);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

export function getLevelProgress(xp: number): number {
  const current = getLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return 100;
  const range = next.minXP - current.minXP;
  const progress = xp - current.minXP;
  return Math.min(100, Math.round((progress / range) * 100));
}
