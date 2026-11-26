import { createHash, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { invTag } from "@/lib/data";
import { createAdminClient } from "@/lib/supabase/admin";

const digest = (s: string) => createHash("sha256").update(s).digest();

// Masa aktif otomatis (PRD bagian 5): undangan terbit yang lewat expires_at -> expired,
// lalu cache halamannya dibuang supaya link tamu berhenti tampil. Dipanggil Vercel Cron (vercel.json)
// dengan header Authorization: Bearer $CRON_SECRET.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !timingSafeEqual(digest(req.headers.get("authorization") ?? ""), digest(`Bearer ${secret}`)))
    return new Response("Unauthorized", { status: 401 });

  const { data, error } = await createAdminClient().from("invitations")
    .update({ status: "expired" })
    .eq("status", "published").lt("expires_at", new Date().toISOString())
    .select("slug");
  if (error) return Response.json({ error: error.message }, { status: 500 });
  for (const { slug } of data) revalidateTag(invTag(slug), { expire: 0 });
  return Response.json({ expired: data.length });
}
