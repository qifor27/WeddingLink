import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Arch } from "@/components/marketing/Arch";
import { AutoplayVideo } from "@/components/marketing/AutoplayVideo";
import { FeatureShowcase } from "@/components/marketing/FeatureShowcase";
import { SiteShell, WA_TEXT } from "@/components/marketing/SiteShell";
import { ThemeGallery } from "@/components/marketing/ThemeGallery";
import { getPackages } from "@/lib/data";
import { activeMonths, packageFeatures, type Pkg, waLink } from "@/lib/marketing";
import { rupiah } from "@/lib/payment";
import { themes } from "@/themes";

export const metadata: Metadata = {
  title: "Undangan Pernikahan Digital Custom — WeddingLink",
  description: "Undangan pernikahan digital custom: gaya adat Nusantara, modern, atau minimalis dengan cerita Anda sendiri. Link pribadi per tamu, RSVP & ucapan, kirim lewat WhatsApp.",
  alternates: { canonical: "/" },
};

const btn = "inline-flex min-h-12 items-center justify-center rounded-full px-7 text-sm font-semibold tracking-wide transition-colors";
const dark = `${btn} bg-ink text-white hover:bg-gold-deep`;
const outline = `${btn} border border-ink/30 hover:border-gold hover:text-gold-deep`;

const STEPS = [
  ["Pilih gaya", "Adat, modern, atau minimalis. Lihat preview dengan nama Anda sendiri sebelum memesan."],
  ["Ceritakan kisah Anda", "Nama, acara, peta, cerita cinta, dan rekening tanda kasih. Isi sendiri atau biarkan tim kami yang membuatkan."],
  ["Bayar & bagikan", "Transfer atau QRIS, admin konfirmasi, lalu kirim link pribadi ke tiap tamu lewat WhatsApp."],
];

const FEATURES = [
  { img: "fitur-cover", title: "Nama tamu di sampul", text: "Setiap tamu mendapat link pribadi; namanya tampil di halaman pertama." },
  { img: "fitur-acara", title: "Acara & peta", text: "Akad dan resepsi lengkap dengan zona waktu WIB/WITA/WIT dan tautan Google Maps." },
  { img: "fitur-rsvp", title: "RSVP tanpa ribet", text: "Tamu cukup ketuk hadir atau tidak. Anda melihat rekap jumlah tamu di dashboard." },
  { img: "fitur-wishes", title: "Ucapan & doa", text: "Dilindungi captcha dan filter kata kasar; Anda bisa menyembunyikan ucapan kapan saja." },
  { img: "fitur-gift", title: "Tanda kasih", text: "Nomor rekening atau e-wallet dengan tombol salin. Uang langsung ke rekening Anda." },
];

const COMPARE = [
  ["Biaya", "Cetak + antar per lembar", "Sekali bayar, tamu tak terbatas"],
  ["Kirim", "Diantar satu per satu", "Link WhatsApp, sampai dalam detik"],
  ["Salah ketik", "Cetak ulang", "Ubah di dashboard, langsung berlaku"],
  ["Konfirmasi hadir", "Ditanya manual", "RSVP otomatis + ekspor CSV"],
  ["Lokasi", "Denah kecil di kertas", "Tautan Google Maps"],
];

// Masa aktif dari tabel packages, bukan teks tetap, supaya ikut berubah bila paket diubah.
const faq = (packages: Pkg[]) => [
  ["Bagaimana cara bayar?", "Transfer bank atau QRIS dengan nominal unik, lalu unggah bukti di dashboard. Admin mengonfirmasi, setelah itu undangan bisa diterbitkan."],
  ["Apakah tamu perlu membuat akun atau memasang aplikasi?", "Tidak. Tamu cukup membuka link dari WhatsApp di browser HP."],
  ["Bisa ganti tema atau data setelah terbit?", "Bisa. Perubahan dari dashboard langsung tampil di link yang sama."],
  ["Berapa lama undangan aktif?", `${new Intl.ListFormat("id", { type: "disjunction" }).format(packages.map((p) => String(activeMonths(p))))} bulan sejak terbit, sesuai paket.`],
  ["Apakah undangan saya muncul di Google?", "Tidak. Halaman undangan ditandai noindex dan memakai alamat acak."],
  ["Apakah uang tanda kasih lewat WeddingLink?", "Tidak. Nomor rekening yang tampil adalah milik Anda; WeddingLink tidak menampung dana."],
];

// Label kecil emas + judul serif, pola judul yang dipakai tiap section.
function Heading({ eyebrow, title, center = false, children }: { eyebrow: string; title: string; center?: boolean; children?: ReactNode }) {
  return (
    <div className={`space-y-4 ${center ? "mx-auto max-w-2xl text-center" : ""}`}>
      <p className="text-xs tracking-[0.3em] text-gold-deep uppercase">{eyebrow}</p>
      <h2 className="font-display text-4xl leading-tight md:text-5xl">{title}</h2>
      {children}
    </div>
  );
}

export default async function Home() {
  const packages = await getPackages();
  const wa = waLink(process.env.NEXT_PUBLIC_WA_NUMBER, WA_TEXT);
  const name = (slug: string) => themes.find((t) => t.slug === slug)?.name;

  return (
    <SiteShell>
      {/* 1. Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-6 md:pt-10">
        <div className="grid items-end gap-10 overflow-hidden rounded-[2rem] bg-cream px-6 pt-10 md:grid-cols-[1.1fr_1fr] md:px-14 md:pt-16">
          <div className="space-y-6 pb-2 text-center md:pb-16 md:text-left">
            <p className="text-xs tracking-[0.3em] text-gold-deep uppercase">Undangan pernikahan digital custom</p>
            <h1 className="font-display text-4xl leading-tight md:text-6xl">Undangan yang dirancang seindah kisah Anda</h1>
            <p className="text-lg text-ink/75">Pilih gaya adat Nusantara, modern, atau minimalis. Nama, cerita, foto, dan acara disesuaikan untuk Anda: isi sendiri atau biarkan tim kami yang membuatkan.</p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
              <Link href="/tema" className={dark}>Lihat Tema</Link>
              {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className={outline}>Pesan via WhatsApp</a>}
            </div>
          </div>
          <div className="flex items-end justify-center gap-3 md:gap-4">
            <Arch src="/screens/minang-pastel.webp" alt={`Contoh tema ${name("minang-pastel")}`} sizes="(min-width: 768px) 140px, 26vw" className="w-[30%]" />
            <Arch src="/screens/gold-blush.webp" alt={`Contoh tema ${name("gold-blush")}`} sizes="(min-width: 768px) 190px, 36vw" aspect="aspect-[2/3]" preload className="w-[38%]" />
            <Arch src="/screens/sunda-minang.webp" alt={`Contoh tema ${name("sunda-minang")}`} sizes="(min-width: 768px) 140px, 26vw" className="w-[30%]" />
          </div>
        </div>
      </section>

      {/* 2. Fitur unggulan */}
      <section id="fitur" className="mx-auto max-w-6xl space-y-14 px-4 py-20 md:py-28">
        <Heading eyebrow="Fitur" title="Setiap detail, disesuaikan untuk hari Anda" center>
          <p className="text-ink/75">Semua yang dibutuhkan tamu ada di satu halaman, dari nama di sampul sampai tanda kasih.</p>
          <Link href="/tema" className={dark}>Lihat semua tema</Link>
        </Heading>
        <FeatureShowcase features={FEATURES} />
      </section>

      {/* 3. Galeri tema */}
      <section id="tema" className="border-t border-gold/20 px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl space-y-12">
          <Heading eyebrow="Katalog tema" title="Satu tema untuk setiap gaya" center>
            <p className="text-ink/75">Dari songket Minang hingga botani modern. Ketuk tema untuk melihat preview dengan nama Anda.</p>
          </Heading>
          <ThemeGallery themes={themes.map(({ slug, name, category }) => ({ slug, name, category }))} />
        </div>
      </section>

      {/* 4. Cara kerja */}
      <section id="cara-kerja" className="bg-cream px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl space-y-14">
          <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-end">
            <Heading eyebrow="Cara kerja" title="Dari cerita Anda menjadi undangan yang siap dibagikan" />
            <div className="space-y-4 md:max-w-xs md:justify-self-end">
              <p className="text-ink/75">Tanpa desainer, tanpa aplikasi. Tiga langkah, lalu undangan sampai ke tamu lewat WhatsApp.</p>
              <Link href="/dashboard" className={outline}>Mulai sekarang →</Link>
            </div>
          </div>
          <div className="grid items-center gap-10 md:grid-cols-[auto_1fr] md:gap-20">
            <div className="mx-auto w-60 overflow-hidden rounded-2xl bg-white ring-1 ring-gold/40">
              <AutoplayVideo src="/screens/demo.webm" poster="/screens/demo.webp" label="Rekaman layar undangan WeddingLink saat digulir" />
            </div>
            <ol className="space-y-8">
              {STEPS.map(([title, text], i) => (
                <li key={title} className="flex gap-5">
                  <span className="font-display text-3xl text-gold-deep">{String(i + 1).padStart(2, "0")}</span>
                  <div className="space-y-1 border-t border-gold/40 pt-3">
                    <h3 className="font-display text-xl">{title}</h3>
                    <p className="text-ink/75">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 5. Sebelum vs sesudah */}
      <section className="mx-auto max-w-4xl space-y-12 px-4 py-20 md:py-28">
        <Heading eyebrow="Cetak vs digital" title="Lebih hemat, lebih cepat sampai" center />
        <table className="w-full text-left text-sm md:text-base">
          <thead className="border-b border-gold">
            <tr><th className="p-3" /><th className="p-3 font-normal text-ink/60">Undangan cetak</th><th className="p-3 font-display text-lg">WeddingLink</th></tr>
          </thead>
          <tbody>
            {COMPARE.map(([row, before, after]) => (
              <tr key={row} className="border-b border-gold/20">
                <th className="p-3 font-semibold">{row}</th>
                <td className="p-3 text-ink/60">{before}</td>
                <td className="p-3">{after}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 6. Paket harga */}
      <section id="harga" className="bg-cream px-4 py-20 md:py-28">
        <div className="mx-auto max-w-5xl space-y-12">
          <Heading eyebrow="Paket" title="Pilih paket sesuai kebutuhan" center />
          <ul className="grid gap-6 md:grid-cols-3">
            {packages.map((p) => {
              const featured = p.code === "populer";
              return (
                <li key={p.code} className={`flex flex-col rounded-2xl bg-white p-7 ${featured ? "border-2 border-gold shadow-lg shadow-gold/10 md:-translate-y-3" : "border border-gold/25"}`}>
                  {featured && <span className="mb-3 self-start rounded-full bg-gold-deep px-3 py-1 text-xs font-semibold tracking-wide text-white">Rekomendasi</span>}
                  <h3 className="font-display text-2xl">{p.name}</h3>
                  <p className="my-4 font-display text-4xl">{rupiah(p.price)}</p>
                  <ul className="mb-8 flex-1 space-y-2.5 text-sm">
                    {packageFeatures(p).map((f) => <li key={f} className="flex gap-2"><span aria-hidden="true" className="text-gold-deep">✦</span>{f}</li>)}
                  </ul>
                  <Link href="/dashboard" className={featured ? dark : outline}>Pilih {p.name}</Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 7. Testimoni/portofolio: menunggu tangkapan layar undangan nyata dengan izin pasangan (PRD bagian 7). */}

      {/* 8. FAQ */}
      <section id="faq" className="mx-auto max-w-3xl space-y-12 px-4 py-20 pb-32 md:py-28">
        <Heading eyebrow="FAQ" title="Pertanyaan umum" center />
        <div className="border-t border-gold/30">
          {faq(packages).map(([q, a]) => (
            <details key={q} className="group border-b border-gold/30">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-display text-lg [&::-webkit-details-marker]:hidden">
                {q}
                <span aria-hidden="true" className="text-2xl text-gold-deep transition-transform group-open:rotate-45 motion-reduce:transition-none">+</span>
              </summary>
              <p className="pb-5 text-ink/75">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
