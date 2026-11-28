import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { invitationData } from "@/lib/invitation";
import { ORDER_STATUS } from "@/lib/payment";
import { themes } from "@/themes";
import { Editor } from "./Editor";
import { PublishButton } from "./PublishButton";

export default async function Page({ params }: PageProps<"/dashboard/[id]">) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const [{ data: inv }, { data: order }] = await Promise.all([
    supabase.from("invitations").select("id, slug, status, data, expires_at, themes(slug)").eq("id", id)
      .maybeSingle<{ id: string; slug: string; status: string; data: unknown; expires_at: string | null; themes: { slug: string } }>(),
    supabase.from("orders").select("status").eq("invitation_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (!inv) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-display text-3xl">Edit undangan</h1>
        <Link href={`/dashboard/${id}/preview`} target="_blank" className="rounded-full border border-gold px-4 py-2 text-sm text-gold-deep">
          Lihat preview
        </Link>
      </div>
      {inv.status === "published" ? (
        <p className="rounded-xl bg-cream px-3 py-2 text-sm">
          Terbit: <a href={`/${inv.slug}`} target="_blank" className="font-semibold underline">{`${process.env.NEXT_PUBLIC_SITE_URL}/${inv.slug}`}</a>
          {inv.expires_at && <> · aktif s.d. {new Date(inv.expires_at).toLocaleDateString("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" })}</>}
        </p>
      ) : inv.status === "expired" ? (
        <p className="rounded-xl bg-cream px-3 py-2 text-sm">Masa aktif undangan sudah habis.</p>
      ) : order?.status === "paid" ? (
        <PublishButton id={id} />
      ) : (
        <p className="rounded-xl bg-cream px-3 py-2 text-sm">
          {order ? ORDER_STATUS[order.status] : "Belum dibayar"} ·{" "}
          <Link href={`/dashboard/${id}/bayar`} className="font-semibold text-gold-deep underline">
            {order?.status === "waiting_confirmation" ? "Lihat pembayaran" : "Bayar untuk menerbitkan"}
          </Link>
        </p>
      )}
      <Editor
        id={id}
        initialData={invitationData.parse(inv.data)}
        initialTheme={inv.themes.slug}
        themes={themes.map((t) => ({ slug: t.slug, name: t.name }))}
      />
    </div>
  );
}
