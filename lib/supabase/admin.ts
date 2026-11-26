import "server-only";
import { createClient } from "@supabase/supabase-js";

// Melewati RLS. Hanya untuk server (route handler / data ber-cache), jangan pernah ke klien.
export const createAdminClient = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
