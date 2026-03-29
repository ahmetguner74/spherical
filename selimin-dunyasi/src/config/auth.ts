const STORAGE_KEY = "selim-auth";
const SESSION_DAYS = 7;

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// SHA-256 of password
const PASSWORD_HASH =
  "1f3227cd4f0af30c2ed08fe5605a432aa3e33e76f8ba3d93ac4e1a62bbfcfb1d";

export async function verifyPassword(input: string): Promise<boolean> {
  const inputHash = await hashPassword(input);
  return inputHash === PASSWORD_HASH;
}

export function getSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const { expiry } = JSON.parse(raw);
    return Date.now() < expiry;
  } catch {
    return false;
  }
}

export function setSession(): void {
  const expiry = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ expiry }));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}
