import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zkudizhpzcjanoisqzcs.supabase.co";
const SUPABASE_ANON_KEY =
  "sb_publishable_SCwp8SEAY_YQzNNHijFoyQ_r1nk5syX";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
