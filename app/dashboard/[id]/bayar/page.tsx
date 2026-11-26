import { notFound } from "next/navigation";
import { CopyButton } from "@/components/sections/client";
import { requireUser } from "@/lib/auth";
import { ORDER_STATUS, rupiah } from "@/lib/payment";
import { createOrder } from "../../actions";
import { UploadProof } from "./UploadProof";

type Order = { id: string; amount: number; status: string; reject_reason: string | null; proof_path: string | null; packages: { name: string } };

// PRD bagian 5: pilih paket -> transfer nominal unik -> unggah bukti -> admin konfirmasi.
export default async function Page({ params }: PageProps<"/dashboard/[id]/bayar">) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const [{ data: inv }, { data: orders }, { data: packages }] = await Promise.all([
    supabase.from("invitations").select("id").eq("id", id).maybeSingle(),
    supabase.from("orders").select("id, amount, status, reject_reason, proof_path, packages(name)")
      .eq("invitation_id", id).order("created_at", { ascending: false }).returns<Order[]>(),
    supabase.from("packages").select("code, name, price, active_days").order("price"),
  ]);
  if (!inv) notFound();

  const order = orders?.[0];
  const open = order && (order.status === "pending" || order.status === "waiting_confirmation");
  const bank = { name: process.env.PAYMENT_BANK, no: process.env.PAYMENT_ACCOUNT_NO, holder: process.env.PAYMENT_ACCOUNT_NAME };
  const qris = process.env.PAYMENT_QRIS_URL;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Pembayaran</h1>

      {order && (
        <p className="rounded-xl bg-blush px-3 py-2 text-sm">
          Pesanan {order.packages.name}: <strong>{ORDER_STATUS[order.status]}</strong>
          {order.status === "rejected" && order.reject_reason && <> — {order.reject_reason}</>}
          {order.status === "paid" && <> — undangan siap diterbitkan dari halaman edit.</>}
        </p>
      )}

      {open ? (
        <section className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
          <div>
            <p className="text-sm">Transfer tepat sebesar</p>
            <p className="text-3xl font-semibold text-rose">{rupiah(order.amount)}</p>
            <p className="text-xs text-ink/70">Tiga digit terakhir adalah kode unik untuk mencocokkan transfer Anda.</p>
          </div>
          {bank.no && (
            <div>
              <p className="text-sm">{bank.name} a.n. {bank.holder}</p>
              <p className="flex items-center gap-2 text-xl font-semibold">
                {bank.no} <CopyButton text={bank.no} />
              </p>
            </div>
          )}
          {qris && (
            // eslint-disable-next-line @next/next/no-img-element -- QRIS statis dari env, tidak perlu optimasi
            <img src={qris} alt="QRIS WeddingLink" width={240} height={240} className="rounded-xl border border-blush" />
          )}
          <UploadProof orderId={order.id} hasProof={!!order.proof_path} />
        </section>
      ) : order?.status !== "paid" && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl">Pilih paket</h2>
          <form action={createOrder.bind(null, id)} className="space-y-3">
            {packages?.map((p) => (
              <button key={p.code} name="package" value={p.code} className="block w-full rounded-2xl bg-white p-4 text-left shadow-sm">
                <span className="font-semibold">{p.name}</span> · {rupiah(p.price)}
                <span className="block text-sm text-ink/70">Aktif {p.active_days} hari sejak terbit</span>
              </button>
            ))}
          </form>
        </section>
      )}
    </div>
  );
}
