"use client";

import { useCallback, useState } from "react";
import { authConfig } from "@/config/auth";

type AuthState = "loading" | "locked" | "unlocked";

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function isSessionValid(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(authConfig.storageKey);
  if (!stored) return false;
  const expiry = parseInt(stored, 10);
  return Date.now() < expiry;
}

function saveSession() {
  const expiry = Date.now() + authConfig.sessionDuration;
  localStorage.setItem(authConfig.storageKey, expiry.toString());
}

function getInitialAuthState(): AuthState {
  if (!authConfig.enabled) return "unlocked";
  if (typeof window === "undefined") return "loading";
  return isSessionValid() ? "unlocked" : "locked";
}

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(getInitialAuthState);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const hash = await sha256(input);
      if (hash === authConfig.passwordHash) {
        saveSession();
        setState("unlocked");
        setError(false);
      } else {
        setError(true);
        setInput("");
      }
    },
    [input]
  );

  if (state === "loading") return null;
  if (state === "unlocked") return <>{children}</>;

  return <LockScreen onSubmit={handleSubmit} input={input} setInput={setInput} error={error} />;
}

interface LockScreenProps {
  onSubmit: (e: React.FormEvent) => void;
  input: string;
  setInput: (val: string) => void;
  error: boolean;
}

function LockScreen({ onSubmit, input, setInput, error }: LockScreenProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-xs px-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            CBS İHA BİRİMİ
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            Erişim için şifre gerekli
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Şifre"
            autoFocus
            className="w-full px-4 py-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all duration-150"
          />

          {error && (
            <p className="text-sm text-[var(--feedback-error)] text-center">
              Yanlış şifre
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors duration-150"
          >
            Giriş
          </button>
        </form>
      </div>
    </div>
  );
}
