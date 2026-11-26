import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Client per request untuk Server Component / Route Handler, akses sebagai user yang login (ikut RLS).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Component tidak boleh set cookie; refresh sesi ditangani proxy.ts (minggu 4).
          }
        },
      },
    },
  );
}
