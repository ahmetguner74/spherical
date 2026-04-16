import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zkudizhpzcjanoisqzcs.supabase.co";
const SUPABASE_ANON_KEY =
  "sb_publishable_SCwp8SEAY_YQzNNHijFoyQ_r1nk5syX";

/**
 * DLP uzantıları (Check Point Harmony Endpoint gibi) HTTPS trafiğini MITM eder.
 * Keep-alive ve cache'li bağlantılarda "failed to decrypt" hatası verip cevabı
 * siler — istek sessizce hang eder. Her isteği taze bağlantı + cache'siz açmak
 * bu tür güvenlik uzantılarının atlatılma şansını artırır.
 *
 * Ref: https://supabase.com/docs/guides/troubleshooting/failed-to-fetch-in-dashboard-and-other-areas----browser-extension-dyDTRU
 */
const dlpTolerantFetch: typeof fetch = (input, init) => {
  return fetch(input, {
    ...init,
    cache: "no-store",
    keepalive: false,
  });
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: dlpTolerantFetch,
  },
});
