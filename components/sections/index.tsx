import Image from "next/image";
import { Fragment, Suspense, type ReactNode } from "react";
import { Ornament } from "@/components/ornaments";
import { ZONES, type InvitationData } from "@/lib/invitation";
import type { Wish } from "@/lib/data";
import type { LabelKey, Section, ThemeConfig } from "@/lib/theme";
import { esc, type Skin } from "@/themes/skin";
import { CopyButton, Countdown, GuestName } from "./client";
import { RsvpForm } from "./RsvpForm";

// rsvp hanya ada di undangan terbit; preview tema tidak punya.
export type RsvpContext = { invitationId: string; wishes: Wish[] };
// n = urutan section, dipakai skin untuk menyelang-nyeling ornamen.
type Props = { data: InvitationData; theme: ThemeConfig; skin: Skin; n: number; rsvp?: RsvpContext };

const fmt = (iso: string, zona: InvitationData["zona"], opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("id-ID", { timeZone: zona, ...opts }).format(new Date(iso));
const tanggal = (iso: string, zona: InvitationData["zona"]) =>
  fmt(iso, zona, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const jam = (iso: string, zona: InvitationData["zona"]) => fmt(iso, zona, { hour: "2-digit", minute: "2-digit" });

// Judul bawaan; tema boleh menggantinya lewat theme.json "labels".
const DEFAULT_TITLE: Partial<Record<LabelKey, string>> = {
  mempelai: "Mempelai",
  wanita: "Mempelai Wanita",
  pria: "Mempelai Pria",
  countdown: "Menuju Hari Bahagia",
  maps: "Lokasi",
  galeri: "Galeri",
  story: "Kisah Kami",
  rsvp: "Konfirmasi Kehadiran",
  wishes: "Ucapan & Doa",
  gift: "Tanda Kasih",
};

// "*kata*" di judul tema -> <em> (aksen huruf skrip).
const Title = ({ text }: { text: string }) => (
  <h2>{text.split("*").map((part, i) => (i % 2 ? <em key={i}>{part}</em> : <Fragment key={i}>{part}</Fragment>))}</h2>
);

// Ornamen skin: SVG statis milik repo, bukan input pengguna (lihat themes/skin.ts).
const Decor = ({ html }: { html?: string }) =>
  html ? <div className="decor" aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} /> : null;

function Page({
  id, label, title, box, className = "", p, children,
}: {
  id: string; label?: LabelKey; title?: string; box?: boolean; className?: string; p: Props; children: ReactNode;
}) {
  const l = label ? p.theme.labels[label] : undefined;
  const heading = title ?? l?.title ?? (label && DEFAULT_TITLE[label]);
  return (
    <section id={id} className={`pg ${className}`}>
      <Decor html={p.skin.page?.(p.n, !!box)} />
      <div className={box ? "card box" : "card"}>
        <Decor html={p.skin.card?.(p.n, !!box)} />
        {l?.kicker && <p className="kicker">{l.kicker}</p>}
        {heading && <Title text={heading} />}
        {children}
      </div>
    </section>
  );
}

const Names = ({ data }: { data: InvitationData }) => (
  <>
    <span className="big">{data.wanita.panggilan}</span> <span className="amp">&amp;</span>{" "}
    <span className="big">{data.pria.panggilan}</span>
  </>
);

function Cover(p: Props) {
  const { data, theme, skin } = p;
  return (
    <Page id="cover" label="cover" className="cover" p={p}>
      {/* Skin kosong = tampilan base: pakai ornamen cover dari theme.json. */}
      {Object.keys(skin).length ? (
        <Decor html={skin.coverTop?.(esc(`${data.wanita.panggilan[0]}&${data.pria.panggilan[0]}`))} />
      ) : (
        <div className="orn" aria-hidden="true">
          {theme.ornaments.cover.map((o) => (
            <Ornament key={o} name={o} />
          ))}
        </div>
      )}
      <h1 className="names">
        <Names data={data} />
      </h1>
      <p className="dline">{tanggal(data.acara[0].mulai, data.zona)}</p>
      <div className="to">
        <p>Kepada Yth. Bapak/Ibu/Saudara/i</p>
        <Suspense fallback={<p className="guest">Tamu Undangan</p>}>
          <GuestName />
        </Suspense>
      </div>
      <Decor html={skin.coverBottom} />
    </Page>
  );
}

function Quote(p: Props) {
  if (!p.data.kutipan) return null;
  return (
    <Page id="quote" label="quote" p={p}>
      <p className="it">“{p.data.kutipan.teks}”</p>
      <p className="src">{p.data.kutipan.sumber}</p>
    </Page>
  );
}

function Person({ who, p }: { who: "pria" | "wanita"; p: Props }) {
  const x = p.data[who];
  return (
    <div className="person">
      <Decor html={p.skin.person?.(who)} />
      <div className="photo">
        {p.theme.photos && x.foto ? (
          <Image src={x.foto} alt={x.nama} width={240} height={320} sizes="200px" />
        ) : (
          <div>{x.panggilan[0]}</div>
        )}
      </div>
      <p className="pn">{x.panggilan}</p>
      <p className="full">{x.nama}</p>
      <p className="par">{x.ortu}</p>
      {x.instagram && (
        <a className="ig" href={`https://instagram.com/${x.instagram}`} rel="noopener noreferrer" target="_blank">
          @{x.instagram}
        </a>
      )}
    </div>
  );
}

function Mempelai(p: Props) {
  if (p.theme.splitCouple) {
    return (["wanita", "pria"] as const).map((who, i) => (
      <Page key={who} id={who} label={who} box p={{ ...p, n: p.n + i }}>
        <Person who={who} p={p} />
      </Page>
    ));
  }
  return (
    <Page id="mempelai" label="mempelai" p={p}>
      <div className="couple">
        <Person who="wanita" p={p} />
        <Person who="pria" p={p} />
      </div>
    </Page>
  );
}

function CountdownSection(p: Props) {
  return (
    <Page id="countdown" label="countdown" p={p}>
      <p className="mute">{tanggal(p.data.acara[0].mulai, p.data.zona)}</p>
      <Countdown target={p.data.acara[0].mulai} />
    </Page>
  );
}

// Satu halaman per acara (akad, resepsi, ...), seperti kartu undangan cetak.
function Acara(p: Props) {
  const { data } = p;
  const zona = ZONES[data.zona];
  return data.acara.map((a, i) => (
    <Page key={a.judul + a.mulai} id={`acara-${i + 1}`} label="acara" title={a.judul} box p={{ ...p, n: p.n + i }}>
      <div className="date">
        <span>{fmt(a.mulai, data.zona, { weekday: "long" })}</span>
        <b>{fmt(a.mulai, data.zona, { day: "numeric" })}</b>
        <span>
          {fmt(a.mulai, data.zona, { month: "long" })}
          <br />
          {fmt(a.mulai, data.zona, { year: "numeric" })}
        </span>
      </div>
      <p className="time">
        {jam(a.mulai, data.zona)}
        {a.selesai ? ` – ${jam(a.selesai, data.zona)}` : " – selesai"} {zona}
      </p>
      <p className="place">
        <b>{a.tempat}</b>
        {a.alamat && (
          <>
            <br />
            {a.alamat}
          </>
        )}
      </p>
      {a.peta && (
        <a className="btn ghost" href={a.peta} target="_blank" rel="noopener noreferrer">
          Petunjuk arah
        </a>
      )}
    </Page>
  ));
}

function Maps(p: Props) {
  const withMap = p.data.acara.filter((a) => a.peta);
  if (!withMap.length) return null;
  return (
    <Page id="maps" label="maps" p={p}>
      <div className="stack">
        {withMap.map((a) => (
          <a key={a.judul + a.mulai} href={a.peta} target="_blank" rel="noopener noreferrer" className="btn">
            Buka peta {a.judul}
          </a>
        ))}
      </div>
    </Page>
  );
}

function Galeri(p: Props) {
  if (!p.theme.photos || !p.data.galeri.length) return null;
  return (
    <Page id="galeri" label="galeri" p={p}>
      <div className="gal">
        {p.data.galeri.map((src, i) => (
          <Image key={src} src={src} alt={`Foto ${i + 1}`} width={400} height={400} sizes="(min-width: 448px) 200px, 45vw" />
        ))}
      </div>
    </Page>
  );
}

function Story(p: Props) {
  if (!p.data.cerita.length) return null;
  return (
    <Page id="story" label="story" p={p}>
      <ol className="story">
        {p.data.cerita.map((c) => (
          <li key={c.tahun + c.judul}>
            <h3>
              {c.judul} · {c.tahun}
            </h3>
            <p>{c.isi}</p>
          </li>
        ))}
      </ol>
    </Page>
  );
}

function Gift(p: Props) {
  const { data } = p;
  if (!data.hadiah.length && !data.qris) return null;
  return (
    <Page id="gift" label="gift" p={p}>
      <p className="mute">Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih:</p>
      <div className="stack">
        {data.hadiah.map((h) => (
          <div key={h.nomor} className="box">
            <p className="kicker">{h.bank}</p>
            <p className="acct">{h.nomor}</p>
            <p className="mute">a.n. {h.atasNama}</p>
            <CopyButton text={h.nomor} className="btn ghost" />
          </div>
        ))}
        {data.qris && <Image src={data.qris} alt="QRIS" width={240} height={240} className="qris" />}
      </div>
    </Page>
  );
}

function Penutup(p: Props) {
  return (
    <Page id="penutup" label="penutup" className="last" p={p}>
      <p className="it">
        {p.data.penutup ||
          "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu."}
      </p>
      <p className="names">
        <Names data={p.data} />
      </p>
      <Decor html={p.skin.closing} />
    </Page>
  );
}

function Rsvp(p: Props) {
  return (
    <Page id="rsvp" label="rsvp" p={p}>
      {p.rsvp ? (
        <Suspense>
          <RsvpForm invitationId={p.rsvp.invitationId} />
        </Suspense>
      ) : (
        <p className="mute">Formulir RSVP aktif setelah undangan diterbitkan.</p>
      )}
    </Page>
  );
}

const ATTEND: Record<string, string> = { hadir: "Hadir", tidak_hadir: "Tidak hadir", ragu: "Masih ragu" };

function Wishes(p: Props) {
  if (!p.rsvp?.wishes.length) return null;
  return (
    <Page id="wishes" label="wishes" p={p}>
      <ul className="wishes">
        {p.rsvp.wishes.map((w) => (
          <li key={w.id} className="wish">
            <b>{w.name}</b> <em className={w.attendance === "hadir" ? "" : "no"}>{ATTEND[w.attendance]}</em>
            <p>{w.message}</p>
            <small>{fmt(w.created_at, p.data.zona, { day: "numeric", month: "short", year: "numeric" })}</small>
          </li>
        ))}
      </ul>
    </Page>
  );
}

export const sections: Record<Section, (p: Props) => ReactNode> = {
  cover: Cover,
  quote: Quote,
  mempelai: Mempelai,
  countdown: CountdownSection,
  acara: Acara,
  maps: Maps,
  galeri: Galeri,
  story: Story,
  rsvp: Rsvp,
  wishes: Wishes,
  gift: Gift,
  penutup: Penutup,
};
