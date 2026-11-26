import { notFound } from "next/navigation";
import { CopyButton } from "@/components/sections/client";
import { requireUser } from "@/lib/auth";
import { guestLink, waLink } from "@/lib/guests";
import { deleteGuest, setWishHidden } from "../../actions";
import { ImportGuests } from "./ImportGuests";

type Guest = { id: string; name: string; code: string; group: string | null };
type Wish = { id: string; guest_id: string | null; name: string; attendance: string; pax: number; message: string | null; is_hidden: boolean; created_at: string };

const ATTEND: Record<string, string> = { hadir: "Hadir", tidak_hadir: "Tidak hadir", ragu: "Ragu" };
const pill = "inline-flex min-h-9 items-center rounded-full border border-rose px-3 text-sm text-rose";

// PRD F5, F7, F9: link per tamu, bagikan WhatsApp, status hadir, moderasi ucapan, ekspor CSV.
export default async function Page({ params }: PageProps<"/dashboard/[id]/tamu">) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const [{ data: inv }, { data: guests }, { data: wishes }] = await Promise.all([
    supabase.from("invitations").select("slug, status, data").eq("id", id)
      .maybeSingle<{ slug: string; status: string; data: { wanita: { panggilan: string }; pria: { panggilan: string } } }>(),
    supabase.from("guests").select("id, name, code, group").eq("invitation_id", id).order("created_at").returns<Guest[]>(),
    supabase.from("wishes").select("id, guest_id, name, attendance, pax, message, is_hidden, created_at")
      .eq("invitation_id", id).order("created_at", { ascending: false }).returns<Wish[]>(),
  ]);
  if (!inv) notFound();

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const couple = `${inv.data.wanita.panggilan} & ${inv.data.pria.panggilan}`;
  const latest = new Map<string, Wish>();
  for (const w of wishes ?? []) if (w.guest_id && !latest.has(w.guest_id)) latest.set(w.guest_id, w); // wishes urut terbaru dulu

  // Ringkasan dari respon terbaru per tamu + respon tanpa kode tamu.
  const responses = [...latest.values(), ...(wishes ?? []).filter((w) => !w.guest_id)];
  const count = (a: string) => responses.filter((w) => w.attendance === a).length;
  const pax = responses.filter((w) => w.attendance === "hadir").reduce((n, w) => n + w.pax, 0);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">Tamu &amp; RSVP</h1>
      {inv.status !== "published" && (
        <p className="rounded-xl bg-blush px-3 py-2 text-sm">
          Link tamu sudah bisa disiapkan, tetapi baru bisa dibuka tamu setelah undangan terbit (pembayaran dikonfirmasi).
        </p>
      )}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Hadir", `${count("hadir")} (${pax} org)`],
          ["Tidak hadir", count("tidak_hadir")],
          ["Ragu", count("ragu")],
          ["Belum respon", (guests?.length ?? 0) - latest.size],
        ].map(([label, v]) => (
          <div key={label} className="rounded-2xl bg-white p-3 text-center shadow-sm">
            <p className="text-xl font-semibold">{v}</p>
            <p className="text-xs text-ink/70">{label}</p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Impor tamu</h2>
        <ImportGuests id={id} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Daftar tamu ({guests?.length ?? 0})</h2>
          <a href={`/api/invitations/${id}/export`} className={pill}>Ekspor CSV</a>
        </div>
        <ul className="space-y-2">
          {guests?.map((g) => {
            const link = guestLink(site, inv.slug, g.name, g.code);
            const w = latest.get(g.id);
            return (
              <li key={g.id} className="rounded-2xl bg-white p-3 shadow-sm">
                <p className="font-semibold">
                  {g.name}
                  {g.group && <span className="ml-2 text-xs font-normal text-ink/70">{g.group}</span>}
                </p>
                <p className="text-sm text-ink/70">{w ? `${ATTEND[w.attendance]}${w.attendance === "hadir" ? ` · ${w.pax} org` : ""}` : "Belum respon"}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-rose">
                  <a href={waLink(g.name, couple, link)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center rounded-full bg-[#25d366] px-3 text-sm font-semibold text-white">
                    Kirim WhatsApp
                  </a>
                  <CopyButton text={link} label="Salin link" />
                  <form action={deleteGuest.bind(null, g.id)}>
                    <button className="min-h-9 px-2 text-sm text-ink/60 underline">Hapus</button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Ucapan</h2>
        {!wishes?.some((w) => w.message) && <p className="text-sm">Belum ada ucapan.</p>}
        <ul className="space-y-2">
          {wishes?.filter((w) => w.message).map((w) => (
            <li key={w.id} className={`rounded-2xl bg-white p-3 shadow-sm ${w.is_hidden ? "opacity-60" : ""}`}>
              <p className="font-semibold">
                {w.name} <span className="text-xs font-normal text-ink/70">· {ATTEND[w.attendance]}{w.is_hidden ? " · disembunyikan" : ""}</span>
              </p>
              <p className="whitespace-pre-line text-sm">{w.message}</p>
              <form action={setWishHidden.bind(null, w.id, !w.is_hidden)} className="mt-2">
                <button className={pill}>{w.is_hidden ? "Tampilkan" : "Sembunyikan"}</button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
