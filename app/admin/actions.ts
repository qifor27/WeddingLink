"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const reason = z.string().trim().min(3, "Isi alasan penolakan").max(200);

// PRD bagian 5 langkah 4: Konfirmasi (-> paid) atau Tolak + alasan (-> rejected).
// Hanya admin aal2; audit ditulis trigger orders_audit_status di transaksi yang sama.
export async function reviewOrder(id: string, decision: "paid" | "rejected", _prev: unknown, formData: FormData) {
  const { userId } = await requireAdmin();
  const r = decision === "rejected" ? reason.safeParse(formData.get("reason")) : null;
  if (r && !r.success) return { error: r.error.issues[0].message };

  const { data } = await createAdminClient().from("orders")
    .update({ status: decision, confirmed_by: userId, confirmed_at: new Date().toISOString(), reject_reason: r?.data ?? null })
    .eq("id", id).in("status", ["pending", "waiting_confirmation"])
    .select("id").maybeSingle();
  if (!data) return { error: "Pesanan sudah diproses" };
  refresh();
  return { ok: true as const };
}
