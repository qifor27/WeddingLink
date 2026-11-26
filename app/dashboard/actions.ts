"use server";

import { refresh, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { invTag, wishesTag } from "@/lib/data";
import { parseGuests } from "@/lib/guests";
import { randomUniqueCode } from "@/lib/payment";
import { invitationData, type InvitationData } from "@/lib/invitation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sampleData } from "@/themes/sample";

// Semua query memakai client user (RLS + GRANT kolom): pasangan hanya bisa menyentuh miliknya,
// dan tidak bisa mengubah status/slug/expires_at.

async function themeId(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("themes").select("id").eq("slug", slug).eq("is_active", true).maybeSingle();
  return data?.id as string | undefined;
}

export async function createInvitation(formData: FormData) {
  const { supabase } = await requireUser();
  const theme = await themeId(String(formData.get("theme")));
  if (!theme) throw new Error("Tema tidak ditemukan");
  const { data, error } = await supabase
    .from("invitations")
    .insert({ theme_id: theme, data: sampleData }) // mulai dari data contoh, pasangan tinggal mengganti
    .select("id")
    .single();
  if (error) throw error;
  redirect(`/dashboard/${data.id}`);
}

export async function saveInvitation(id: string, theme: string, input: InvitationData) {
  const { supabase } = await requireUser();
  const parsed = invitationData.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  const theme_id = await themeId(theme);
  if (!theme_id) return { error: "Tema tidak ditemukan" };

  const { data, error } = await supabase
    .from("invitations")
    .update({ data: parsed.data, theme_id })
    .eq("id", id)
    .select("slug, status")
    .maybeSingle();
  if (error || !data) return { error: "Gagal menyimpan" };
  if (data.status === "published") revalidateTag(invTag(data.slug), "max");
  return { ok: true as const };
}

export async function importGuests(id: string, _prev: unknown, formData: FormData) {
  const { supabase } = await requireUser();
  const guests = parseGuests(String(formData.get("list") ?? ""));
  if (!guests.length) return { message: "Tidak ada nama yang bisa diimpor." };

  // Lewati nama yang sudah ada supaya impor ulang tidak menggandakan tamu.
  const { data: existing } = await supabase.from("guests").select("name").eq("invitation_id", id);
  const known = new Set((existing ?? []).map((g) => g.name.toLowerCase()));
  const rows = guests.filter((g) => !known.has(g.name.toLowerCase())).map((g) => ({ invitation_id: id, name: g.name, group: g.group }));
  if (!rows.length) return { message: "Semua nama sudah ada di daftar." };

  const { error } = await supabase.from("guests").insert(rows);
  if (error) return { message: "Gagal mengimpor. Pastikan undangan ini milik Anda." };
  refresh();
  return { message: `${rows.length} tamu ditambahkan.` };
}

export async function deleteGuest(id: string) {
  const { supabase } = await requireUser();
  await supabase.from("guests").delete().eq("id", id);
  refresh();
}

export async function setWishHidden(id: string, hidden: boolean) {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("wishes").update({ is_hidden: hidden }).eq("id", id).select("invitation_id").maybeSingle();
  if (data) revalidateTag(wishesTag(data.invitation_id), { expire: 0 });
  refresh();
}

// PRD bagian 5 langkah 1: pilih paket -> order pending dengan nominal unik.
// Nominal dihitung server; pasangan tidak punya GRANT insert ke orders.
export async function createOrder(invitationId: string, formData: FormData) {
  const { supabase, userId } = await requireUser();
  const [{ data: inv }, { data: pkg }] = await Promise.all([
    supabase.from("invitations").select("id").eq("id", invitationId).maybeSingle(), // RLS: hanya pemilik
    supabase.from("packages").select("id, price").eq("code", String(formData.get("package"))).maybeSingle(),
  ]);
  if (!inv || !pkg) throw new Error("Undangan atau paket tidak ditemukan");

  const admin = createAdminClient();
  for (let i = 0; i < 10; i++) {
    const unique_code = randomUniqueCode();
    const { error } = await admin.from("orders").insert({
      user_id: userId, invitation_id: invitationId, package_id: pkg.id, amount: pkg.price + unique_code, unique_code,
    });
    // 23505: nominal bentrok dengan pesanan terbuka lain (coba kode lain), atau undangan sudah punya pesanan terbuka.
    if (!error || error.code !== "23505" || error.message.includes("open_invitation")) break;
  }
  refresh();
}

// PRD bagian 5 langkah 5: terbit hanya jika order paid. Status & expires_at ditulis server
// (pasangan tidak punya GRANT kolom itu), lalu cache halaman undangan di-revalidate.
export async function publishInvitation(id: string) {
  const { supabase } = await requireUser();
  const [{ data: inv }, { data: order }] = await Promise.all([
    supabase.from("invitations").select("slug, expires_at").eq("id", id).maybeSingle(), // RLS: hanya pemilik
    supabase.from("orders").select("packages(active_days)").eq("invitation_id", id).eq("status", "paid")
      .order("confirmed_at", { ascending: false }).limit(1).maybeSingle<{ packages: { active_days: number } }>(),
  ]);
  if (!inv) return { error: "Undangan tidak ditemukan" };
  if (inv.expires_at && new Date(inv.expires_at) < new Date()) return { error: "Masa aktif undangan sudah habis" };
  if (!order) return { error: "Pembayaran belum dikonfirmasi admin" };

  const expires_at = inv.expires_at ?? new Date(Date.now() + order.packages.active_days * 86_400_000).toISOString();
  const { error } = await createAdminClient().from("invitations").update({ status: "published", expires_at }).eq("id", id);
  if (error) return { error: "Gagal menerbitkan" };
  revalidateTag(invTag(inv.slug), { expire: 0 });
  refresh();
  return { ok: true as const };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/masuk");
}
