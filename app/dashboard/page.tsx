import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { themes } from "@/themes";
import { createInvitation } from "./actions";

const STATUS: Record<string, string> = { draft: "Draf", published: "Terbit", expired: "Kedaluwarsa" };

export default async function Page() {
  const { supabase } = await requireUser();
  const { data: invitations } = await supabase
    .from("invitations")
    .select("id, slug, status, data, themes(name)")
    .order("created_at", { ascending: false })
    .returns<{ id: string; slug: string; status: string; data: { wanita: { panggilan: string }; pria: { panggilan: string } }; themes: { name: string } }[]>();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-4 font-display text-3xl">Undangan Saya</h1>
        {invitations?.length ? (
          <ul className="space-y-3">
            {invitations.map((inv) => (
              <li key={inv.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="font-semibold">{inv.data.wanita.panggilan} &amp; {inv.data.pria.panggilan}</p>
                <p className="text-sm text-ink/70">{inv.themes.name} · {STATUS[inv.status]}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <Link href={`/dashboard/${inv.id}`} className="rounded-full bg-rose px-4 py-2 text-white">Edit</Link>
                  <Link href={`/dashboard/${inv.id}/tamu`} className="rounded-full border border-rose px-4 py-2 text-rose">Tamu &amp; RSVP</Link>
                  <Link href={`/dashboard/${inv.id}/bayar`} className="rounded-full border border-rose px-4 py-2 text-rose">Pembayaran</Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm">Belum ada undangan. Pilih tema di bawah untuk mulai.</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-2xl">Buat undangan baru</h2>
        <form action={createInvitation} className="grid grid-cols-2 gap-3">
          {themes.map((t) => (
            <button key={t.slug} name="theme" value={t.slug} className="rounded-2xl p-4 text-left shadow-sm" style={{ background: t.palette.bg, color: t.palette.ink }}>
              <span className="block font-semibold">{t.name}</span>
              <span className="text-xs opacity-80">{t.category.join(" · ")}</span>
            </button>
          ))}
        </form>
      </section>
    </div>
  );
}
