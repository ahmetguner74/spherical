import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zkudizhpzcjanoisqzcs.supabase.co";
const SUPABASE_ANON_KEY =
  "sb_publishable_SCwp8SEAY_YQzNNHijFoyQ_r1nk5syX";

const globalForSupabase = globalThis as unknown as {
  supabase: SupabaseClient | undefined;
};

export const supabase =
  globalForSupabase.supabase ??
  createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.supabase = supabase;
}
