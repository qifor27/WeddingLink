import "server-only";
import type { Pkg } from "@/lib/marketing";
import { cacheLife, cacheTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

// Tag cache: publish (minggu 5) me-revalidate invTag, RSVP & moderasi me-revalidate wishesTag.
export const invTag = (slug: string) => `inv:${slug}`;
export const wishesTag = (invitationId: string) => `wishes:${invitationId}`;

export type Wish = { id: string; name: string; attendance: string; message: string; created_at: string };

// Error DB dilempar (bukan null) supaya kegagalan sesaat tidak ter-cache sebagai 404.
export async function getPublishedInvitation(slug: string) {
  "use cache";
  cacheTag(invTag(slug));
  cacheLife("max");
  const { data, error } = await createAdminClient()
    .from("invitations")
    .select("id, data, themes(slug)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<{ id: string; data: unknown; themes: { slug: string } }>();
  if (error) throw error;
  return data;
}

export async function getWishes(invitationId: string) {
  "use cache";
  cacheTag(wishesTag(invitationId));
  cacheLife("max");
  const { data, error } = await createAdminClient()
    .from("wishes")
    .select("id, name, attendance, message, created_at")
    .eq("invitation_id", invitationId)
    .eq("is_hidden", false)
    .not("message", "is", null)
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<Wish[]>();
  if (error) throw error;
  return data;
}

// Harga di landing & halaman tema (PRD bagian 6: harga dari DB). Diperbarui tiap jam.
export async function getPackages() {
  "use cache";
  cacheTag("packages");
  cacheLife("hours");
  const { data, error } = await createAdminClient()
    .from("packages").select("code, name, price, active_days, features").order("price").returns<Pkg[]>();
  if (error) throw error;
  return data;
}
