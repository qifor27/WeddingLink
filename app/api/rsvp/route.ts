import { createHmac } from "node:crypto";
import { revalidateTag } from "next/cache";
import { wishesTag } from "@/lib/data";
import { isProfane, rsvpInput } from "@/lib/rsvp";
import { createAdminClient } from "@/lib/supabase/admin";

const IP_LIMIT = 5; // kiriman per IP per 10 menit
const GUEST_LIMIT = 3; // kiriman per kode tamu (boleh koreksi)

const fail = (error: string, status: number) => Response.json({ error }, { status });

async function turnstileOk(token: string, ip: string) {
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!, response: token, remoteip: ip }),
    signal: AbortSignal.timeout(5000),
  }).catch(() => null);
  return (await res?.json().catch(() => null))?.success === true;
}

// PRD F6: zod + Turnstile + rate limit (IP + kode tamu) + filter kata kasar. Satu-satunya jalur insert ucapan.
export async function POST(req: Request) {
  const parsed = rsvpInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Data tidak valid.", 400);
  const { invitationId, code, name, attendance, pax, message, token } = parsed.data;

  // shortcut: x-forwarded-for dipercaya karena di-set ulang oleh Vercel; di hosting lain pakai header proxy tepercaya.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "";
  if (!(await turnstileOk(token, ip))) return fail("Verifikasi captcha gagal. Coba lagi.", 403);

  const db = createAdminClient();
  const { data: inv } = await db.from("invitations").select("id").eq("id", invitationId).eq("status", "published").maybeSingle();
  if (!inv) return fail("Undangan tidak ditemukan.", 404);

  const guestId = code
    ? (await db.from("guests").select("id").eq("invitation_id", invitationId).eq("code", code).maybeSingle()).data?.id ?? null
    : null;

  const ipHash = createHmac("sha256", process.env.SUPABASE_SECRET_KEY!).update(ip).digest("hex");
  const since = new Date(Date.now() - 10 * 60_000).toISOString();
  const [{ count: byIp }, { count: byGuest }] = await Promise.all([
    db.from("wishes").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since),
    guestId
      ? db.from("wishes").select("id", { count: "exact", head: true }).eq("guest_id", guestId)
      : Promise.resolve({ count: 0 }),
  ]);
  if ((byIp ?? 0) >= IP_LIMIT || (byGuest ?? 0) >= GUEST_LIMIT) {
    return fail("Terlalu banyak kiriman. Coba lagi nanti.", 429);
  }

  const { error } = await db.from("wishes").insert({
    invitation_id: invitationId,
    guest_id: guestId,
    name,
    attendance,
    pax: attendance === "hadir" ? pax : 0,
    message: message || null,
    is_hidden: isProfane(`${name} ${message ?? ""}`),
    ip_hash: ipHash,
  });
  if (error) return fail("Gagal menyimpan. Coba lagi.", 500);

  revalidateTag(wishesTag(invitationId), { expire: 0 }); // ucapan baru langsung tampil di kunjungan berikutnya
  return Response.json({ ok: true }, { status: 201 });
}
