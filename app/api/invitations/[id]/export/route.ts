import { requireUser } from "@/lib/auth";
import { guestLink, toCsv } from "@/lib/guests";

type Wish = { guest_id: string | null; name: string; attendance: string; pax: number; message: string | null; created_at: string };

// PRD bagian 10: CSV tamu & RSVP, hanya pemilik (RLS lewat client user).
export async function GET(_req: Request, { params }: RouteContext<"/api/invitations/[id]/export">) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const [{ data: inv }, { data: guests }, { data: wishes }] = await Promise.all([
    supabase.from("invitations").select("slug").eq("id", id).maybeSingle(),
    supabase.from("guests").select("id, name, code, group").eq("invitation_id", id).order("created_at"),
    supabase.from("wishes").select("guest_id, name, attendance, pax, message, created_at")
      .eq("invitation_id", id).order("created_at", { ascending: false }).returns<Wish[]>(),
  ]);
  if (!inv) return new Response("Tidak ditemukan", { status: 404 });

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const latest = new Map<string, Wish>();
  for (const w of wishes ?? []) if (w.guest_id && !latest.has(w.guest_id)) latest.set(w.guest_id, w);
  const resp = (w?: Wish) => [w?.attendance ?? "", w?.attendance === "hadir" ? w.pax : "", w?.message ?? "", w?.created_at ?? ""];

  const csv = toCsv([
    ["Nama", "Grup", "Link", "Kehadiran", "Jumlah", "Ucapan", "Waktu respon"],
    ...(guests ?? []).map((g) => [g.name, g.group, guestLink(site, inv.slug, g.name, g.code), ...resp(latest.get(g.id))]),
    ...(wishes ?? []).filter((w) => !w.guest_id).map((w) => [w.name, "(tanpa link tamu)", "", ...resp(w)]),
  ]);
  return new Response(`﻿${csv}`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="tamu-${inv.slug}.csv"`,
      "cache-control": "private, no-store",
    },
  });
}
