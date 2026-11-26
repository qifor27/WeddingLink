import Image from "next/image";
import { Suspense, type ReactNode } from "react";
import { Ornament } from "@/components/ornaments";
import { ZONES, type InvitationData } from "@/lib/invitation";
import type { Section, ThemeConfig } from "@/lib/theme";
import { CopyButton, Countdown, GuestName } from "./client";

type Props = { data: InvitationData; theme: ThemeConfig };

const fmt = (iso: string, zona: InvitationData["zona"], opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("id-ID", { timeZone: zona, ...opts }).format(new Date(iso));
const tanggal = (iso: string, zona: InvitationData["zona"]) =>
  fmt(iso, zona, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const jam = (iso: string, zona: InvitationData["zona"]) => fmt(iso, zona, { hour: "2-digit", minute: "2-digit" });

const Wrap = ({ title, children }: { title?: string; children: ReactNode }) => (
  <section className="px-6 py-12 text-center">
    {title && <h2 className="mb-6 font-(family-name:--font-display) text-3xl">{title}</h2>}
    {children}
  </section>
);

const Couple = ({ data }: { data: InvitationData }) => (
  <>
    {data.wanita.panggilan} &amp; {data.pria.panggilan}
  </>
);

function Cover({ data, theme }: Props) {
  return (
    <section className="flex min-h-svh flex-col items-center justify-center gap-5 px-6 py-16 text-center">
      <div className="flex items-end gap-4 text-(--accent)">
        {theme.ornaments.cover.map((o) => (
          <Ornament key={o} name={o} className="h-20 w-auto" />
        ))}
      </div>
      <p className="text-xs uppercase tracking-[0.3em] text-(--muted)">Undangan Pernikahan</p>
      <h1 className="font-(family-name:--font-script) text-6xl leading-tight">
        <Couple data={data} />
      </h1>
      <p className="font-(family-name:--font-display) text-lg">{tanggal(data.acara[0].mulai, data.zona)}</p>
      <div className="mt-6 rounded-2xl bg-(--surface) px-6 py-4 shadow-sm">
        <p className="text-sm text-(--muted)">Kepada Yth. Bapak/Ibu/Saudara/i</p>
        <Suspense fallback={<p className="mt-1 text-lg font-semibold">Tamu Undangan</p>}>
          <GuestName />
        </Suspense>
      </div>
    </section>
  );
}

function Quote({ data }: Props) {
  if (!data.kutipan) return null;
  return (
    <Wrap>
      <blockquote className="mx-auto max-w-sm italic leading-relaxed">“{data.kutipan.teks}”</blockquote>
      <p className="mt-3 text-sm text-(--muted)">{data.kutipan.sumber}</p>
    </Wrap>
  );
}

function Mempelai({ data, theme }: Props) {
  return (
    <Wrap title="Mempelai">
      <div className="space-y-10">
        {[data.wanita, data.pria].map((p) => (
          <div key={p.nama} className="flex flex-col items-center gap-2">
            {theme.photos && p.foto ? (
              <Image src={p.foto} alt={p.nama} width={160} height={160} className="size-40 rounded-full object-cover" />
            ) : (
              <div className="flex size-24 items-center justify-center rounded-full bg-(--surface) font-(family-name:--font-script) text-5xl text-(--accent)">
                {p.panggilan[0]}
              </div>
            )}
            <h3 className="font-(family-name:--font-display) text-2xl">{p.nama}</h3>
            <p className="text-sm text-(--muted)">{p.ortu}</p>
            {p.instagram && (
              <a className="text-sm underline" href={`https://instagram.com/${p.instagram}`} rel="noopener noreferrer" target="_blank">
                @{p.instagram}
              </a>
            )}
          </div>
        ))}
      </div>
    </Wrap>
  );
}

function CountdownSection({ data }: Props) {
  return (
    <Wrap title="Menuju Hari Bahagia">
      <Countdown target={data.acara[0].mulai} />
    </Wrap>
  );
}

function Acara({ data }: Props) {
  const zona = ZONES[data.zona];
  return (
    <Wrap title="Acara">
      <div className="space-y-6">
        {data.acara.map((a) => (
          <div key={a.judul + a.mulai} className="rounded-2xl bg-(--surface) p-6 shadow-sm">
            <h3 className="font-(family-name:--font-display) text-2xl">{a.judul}</h3>
            <p className="mt-2">{tanggal(a.mulai, data.zona)}</p>
            <p>
              {jam(a.mulai, data.zona)}
              {a.selesai ? ` – ${jam(a.selesai, data.zona)}` : " – selesai"} {zona}
            </p>
            <p className="mt-3 font-semibold">{a.tempat}</p>
            <p className="text-sm text-(--muted)">{a.alamat}</p>
          </div>
        ))}
      </div>
    </Wrap>
  );
}

function Maps({ data }: Props) {
  const withMap = data.acara.filter((a) => a.peta);
  if (!withMap.length) return null;
  return (
    <Wrap title="Lokasi">
      <div className="flex flex-col items-center gap-3">
        {withMap.map((a) => (
          <a
            key={a.judul + a.mulai}
            href={a.peta}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded-full bg-(--ink) px-6 text-(--surface)"
          >
            Buka peta {a.judul}
          </a>
        ))}
      </div>
    </Wrap>
  );
}

function Galeri({ data, theme }: Props) {
  if (!theme.photos || !data.galeri.length) return null;
  return (
    <Wrap title="Galeri">
      <div className="grid grid-cols-2 gap-2">
        {data.galeri.map((src, i) => (
          <Image key={src} src={src} alt={`Foto ${i + 1}`} width={400} height={400} sizes="50vw" className="aspect-square rounded-xl object-cover" />
        ))}
      </div>
    </Wrap>
  );
}

function Story({ data }: Props) {
  if (!data.cerita.length) return null;
  return (
    <Wrap title="Kisah Kami">
      <ol className="space-y-6 text-left">
        {data.cerita.map((c) => (
          <li key={c.tahun + c.judul} className="border-l-2 border-(--accent) pl-4">
            <p className="text-sm text-(--muted)">{c.tahun}</p>
            <h3 className="font-semibold">{c.judul}</h3>
            <p className="text-sm">{c.isi}</p>
          </li>
        ))}
      </ol>
    </Wrap>
  );
}

function Gift({ data }: Props) {
  if (!data.hadiah.length && !data.qris) return null;
  return (
    <Wrap title="Tanda Kasih">
      <p className="mb-6 text-sm text-(--muted)">Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih:</p>
      <div className="space-y-4">
        {data.hadiah.map((h) => (
          <div key={h.nomor} className="flex flex-col items-center gap-2 rounded-2xl bg-(--surface) p-6 shadow-sm">
            <p className="font-semibold">{h.bank}</p>
            <p className="text-xl tabular-nums tracking-wider">{h.nomor}</p>
            <p className="text-sm text-(--muted)">a.n. {h.atasNama}</p>
            <CopyButton text={h.nomor} />
          </div>
        ))}
        {data.qris && (
          <Image src={data.qris} alt="QRIS" width={240} height={240} className="mx-auto rounded-xl bg-white p-2" />
        )}
      </div>
    </Wrap>
  );
}

function Penutup({ data }: Props) {
  return (
    <Wrap>
      <p className="mx-auto max-w-sm leading-relaxed">
        {data.penutup ||
          "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu."}
      </p>
      <p className="mt-8 font-(family-name:--font-script) text-5xl">
        <Couple data={data} />
      </p>
    </Wrap>
  );
}

// rsvp & wishes: dibangun di minggu 3 (API anti-spam).
const none = () => null;

export const sections: Record<Section, (p: Props) => ReactNode> = {
  cover: Cover,
  quote: Quote,
  mempelai: Mempelai,
  countdown: CountdownSection,
  acara: Acara,
  maps: Maps,
  galeri: Galeri,
  story: Story,
  rsvp: none,
  wishes: none,
  gift: Gift,
  penutup: Penutup,
};
