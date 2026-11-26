import "server-only";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Dipanggil di setiap halaman & server action area pasangan (server action bisa di-POST langsung).
export async function requireUser() {
  await connection(); // selalu per request: getClaims memakai jam saat ini (cek kedaluwarsa token)
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data) redirect("/masuk");
  return { supabase, userId: data.claims.sub };
}
