import { requireAdmin } from "@/lib/auth";
import { ORDER_STATUS, rupiah } from "@/lib/payment";
import { createAdminClient } from "@/lib/supabase/admin";
import { ReviewOrder } from "./ReviewOrder";

type Order = {
  id: string; amount: number; status: string; proof_path: string | null; reject_reason: string | null; created_at: string;
  packages: { name: string };
  users: { email: string | null };
  invitations: { slug: string; status: string; expires_at: string | null; data: { wanita: { panggilan: string }; pria: { panggilan: string } } };
};

const date = (s: string) => new Date(s).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });
const RANK: Record<string, number> = { waiting_confirmation: 0, pending: 1 };

// PRD F10: daftar pesanan, konfirmasi bayar, masa aktif. Data lewat RLS admin (aal2).
export default async function Page() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("orders")
    .select("id, amount, status, proof_path, reject_reason, created_at, packages(name), users!orders_user_id_fkey(email), invitations(slug, status, expires_at, data)")
    .order("created_at", { ascending: false }).limit(100).returns<Order[]>();
  const orders = (data ?? []).sort((a, b) => (RANK[a.status] ?? 2) - (RANK[b.status] ?? 2));

  // Bukti transfer di bucket privat: signed URL berumur pendek, hanya dibuat untuk admin.
  const paths = orders.flatMap((o) => (o.proof_path ? [o.proof_path] : []));
  const { data: signed } = paths.length ? await createAdminClient().storage.from("proofs").createSignedUrls(paths, 600) : { data: [] };
  const proofUrl = new Map((signed ?? []).flatMap((s) => (s.path && s.signedUrl ? [[s.path, s.signedUrl]] : [])));

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Pesanan</h1>
      {!orders.length && <p className="text-sm">Belum ada pesanan.</p>}
      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={o.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="flex justify-between gap-2">
              <span className="text-xl font-semibold text-gold-deep">{rupiah(o.amount)}</span>
              <span className="text-sm">{ORDER_STATUS[o.status]}</span>
            </p>
            <p className="text-sm">
              {o.invitations.data.wanita.panggilan} &amp; {o.invitations.data.pria.panggilan} · {o.packages.name} · {o.users.email}
            </p>
            <p className="text-xs text-ink/70">
              Dipesan {date(o.created_at)} · undangan {o.invitations.status}
              {o.invitations.expires_at && ` s.d. ${date(o.invitations.expires_at)}`}
              {o.reject_reason && ` · ditolak: ${o.reject_reason}`}
            </p>
            {o.proof_path && proofUrl.has(o.proof_path) && (
              <a href={proofUrl.get(o.proof_path)} target="_blank" rel="noopener noreferrer" className="text-sm text-gold-deep underline">
                Lihat bukti transfer
              </a>
            )}
            {(o.status === "pending" || o.status === "waiting_confirmation") && <ReviewOrder id={o.id} />}
          </li>
        ))}
      </ul>
    </div>
  );
}
