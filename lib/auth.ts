import "server-only";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Dipanggil di setiap halaman & server action area pasangan (server action bisa di-POST langsung).
export async function requireUser() {
  await connection(); // selalu per request: getClaims memakai jam saat ini (cek kedaluwarsa token)
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data) redirect("/masuk");
  return { supabase, userId: data.claims.sub };
}

// Admin = role admin di public.users. Halaman admin juga wajib aal2 (TOTP); RLS memeriksa hal yang sama
// lewat private.is_admin(), jadi ini lapis kedua + pengalihan yang ramah.
export async function requireAdmin({ allowAal1 = false } = {}) {
  const { supabase, userId } = await requireUser();
  const [{ data: me }, { data: claims }] = await Promise.all([
    supabase.from("users").select("role").eq("id", userId).maybeSingle(),
    supabase.auth.getClaims(),
  ]);
  if (me?.role !== "admin") notFound();
  const aal2 = claims?.claims.aal === "aal2";
  if (!allowAal1 && !aal2) redirect("/admin/2fa");
  return { supabase, userId, aal2 };
}
