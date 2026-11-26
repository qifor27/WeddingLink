import type { Metadata } from "next";
import Link from "next/link";
import { AutoplayVideo } from "@/components/marketing/AutoplayVideo";
import { PhoneMockup } from "@/components/marketing/PhoneMockup";
import { SiteShell, WA_TEXT } from "@/components/marketing/SiteShell";
import { ThemeGallery } from "@/components/marketing/ThemeGallery";
import { getPackages } from "@/lib/data";
import { packageFeatures, waLink } from "@/lib/marketing";
import { rupiah } from "@/lib/payment";
import { themes } from "@/themes";

export const metadata: Metadata = {
  title: "Undangan Pernikahan Digital Tema Adat Nusantara — WeddingLink",
  description: "Undangan digital bertema Minang, Sunda, dan modern. Link pribadi per tamu, RSVP & ucapan, kirim lewat WhatsApp. Mulai Rp49.000.",
  alternates: { canonical: "/" },
};

const btn = "inline-flex min-h-12 items-center justify-center rounded-full px-6 font-semibold";

const STEPS = [
  ["Pilih tema", "Lihat preview dengan nama Anda sendiri sebelum memesan."],
  ["Isi data", "Nama mempelai, acara, peta, rekening tanda kasih. Tersimpan otomatis."],
  ["Bayar & bagikan", "Transfer atau QRIS, admin konfirmasi, lalu kirim link ke tiap tamu lewat WhatsApp."],
];

const FEATURES = [
  ["fitur-cover", "Nama tamu di sampul", "Setiap tamu mendapat link pribadi; namanya tampil di halaman pertama."],
  ["fitur-acara", "Acara & peta", "Akad dan resepsi lengkap dengan zona waktu WIB/WITA/WIT dan tautan Google Maps."],
  ["fitur-rsvp", "RSVP tanpa ribet", "Tamu cukup ketuk hadir atau tidak. Anda melihat rekap jumlah tamu di dashboard."],
  ["fitur-wishes", "Ucapan & doa", "Dilindungi captcha dan filter kata kasar; Anda bisa menyembunyikan ucapan kapan saja."],
  ["fitur-gift", "Tanda kasih", "Nomor rekening atau e-wallet dengan tombol salin. Uang langsung ke rekening Anda."],
];

const COMPARE = [
  ["Biaya", "Cetak + antar per lembar", "Sekali bayar, tamu tak terbatas"],
  ["Kirim", "Diantar satu per satu", "Link WhatsApp, sampai dalam detik"],
  ["Salah ketik", "Cetak ulang", "Ubah di dashboard, langsung berlaku"],
  ["Konfirmasi hadir", "Ditanya manual", "RSVP otomatis + ekspor CSV"],
  ["Lokasi", "Denah kecil di kertas", "Tautan Google Maps"],
];

const FAQ = [
  ["Bagaimana cara bayar?", "Transfer bank atau QRIS dengan nominal unik, lalu unggah bukti di dashboard. Admin mengonfirmasi, setelah itu undangan bisa diterbitkan."],
  ["Apakah tamu perlu membuat akun atau memasang aplikasi?", "Tidak. Tamu cukup membuka link dari WhatsApp di browser HP."],
  ["Bisa ganti tema atau data setelah terbit?", "Bisa. Perubahan dari dashboard langsung tampil di link yang sama."],
  ["Berapa lama undangan aktif?", "3, 6, atau 12 bulan sejak terbit, sesuai paket."],
  ["Apakah undangan saya muncul di Google?", "Tidak. Halaman undangan ditandai noindex dan memakai alamat acak."],
  ["Apakah uang tanda kasih lewat WeddingLink?", "Tidak. Nomor rekening yang tampil adalah milik Anda; WeddingLink tidak menampung dana."],
];

export default async function Home() {
  const packages = await getPackages();
  const wa = waLink(process.env.NEXT_PUBLIC_WA_NUMBER, WA_TEXT);
  const hero = ["minang-pastel", "gold-blush", "sunda-minang"];

  return (
    <SiteShell>
      {/* 1. Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 overflow-x-clip px-4 py-12 md:grid-cols-2 md:py-20">
        <div className="space-y-5 text-center md:text-left">
          <p className="text-sm tracking-[0.2em] text-gold uppercase">Undangan pernikahan digital</p>
          <h1 className="font-display text-4xl leading-tight md:text-6xl">Undangan cantik bernuansa Nusantara, sampai ke tamu lewat satu link</h1>
          <p className="text-lg text-ink/80">Tema Minang, Sunda, dan modern. Nama tamu di sampul, RSVP & ucapan, kirim lewat WhatsApp.</p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
            <Link href="/tema" className={`${btn} bg-rose text-white`}>Lihat Tema</Link>
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className={`${btn} border border-rose text-rose`}>Pesan via WhatsApp</a>}
          </div>
        </div>
        <div className="relative mx-auto h-[420px] w-full max-w-sm md:h-[520px]">
          {hero.map((slug, i) => (
            <PhoneMockup key={slug} src={`/screens/${slug}.webp`} alt={`Contoh tema ${themes.find((t) => t.slug === slug)?.name}`}
              sizes="(min-width: 768px) 240px, 180px" preload={i === 1}
              className={[
                "absolute top-10 left-0 w-[45%] -rotate-8",
                "absolute top-0 left-1/2 z-10 w-[52%] -translate-x-1/2",
                "absolute top-10 right-0 w-[45%] rotate-8",
              ][i]} />
          ))}
        </div>
      </section>

      {/* 2. Galeri tema */}
      <section id="tema" className="bg-blush/40 px-4 py-16">
        <div className="mx-auto max-w-6xl space-y-8">
          <h2 className="text-center font-display text-3xl md:text-4xl">Pilih tema favorit Anda</h2>
          <ThemeGallery themes={themes.map(({ slug, name, category }) => ({ slug, name, category }))} />
        </div>
      </section>

      {/* 3. Cara kerja */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
        <div className="mx-auto w-60 rounded-[2.2rem] bg-ink p-2 shadow-xl shadow-ink/20">
          <div className="overflow-hidden rounded-[1.7rem]">
            <AutoplayVideo src="/screens/demo.webm" poster="/screens/demo.webp" label="Rekaman layar undangan WeddingLink saat digulir" />
          </div>
        </div>
        <div className="space-y-6">
          <h2 className="font-display text-3xl md:text-4xl">Cara kerja</h2>
          <ol className="space-y-5">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rose font-semibold text-white">{i + 1}</span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-ink/80">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. Fitur unggulan */}
      <section className="bg-blush/40 px-4 py-16">
        <div className="mx-auto max-w-6xl space-y-8">
          <h2 className="text-center font-display text-3xl md:text-4xl">Semua yang dibutuhkan tamu, dalam satu halaman</h2>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {FEATURES.map(([img, title, text]) => (
              <li key={title} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
                <PhoneMockup src={`/screens/${img}.webp`} alt={title} sizes="(min-width: 1024px) 160px, 35vw" crop={false} className="mx-auto w-full max-w-40" />
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-ink/80">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5. Sebelum vs sesudah */}
      <section className="mx-auto max-w-4xl space-y-8 px-4 py-16">
        <h2 className="text-center font-display text-3xl md:text-4xl">Undangan cetak vs WeddingLink</h2>
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm md:text-base">
            <thead className="bg-blush/60">
              <tr><th className="p-3" /><th className="p-3">Undangan cetak</th><th className="p-3 text-rose">WeddingLink</th></tr>
            </thead>
            <tbody>
              {COMPARE.map(([row, before, after]) => (
                <tr key={row} className="border-t border-blush">
                  <th className="p-3 font-semibold">{row}</th>
                  <td className="p-3 text-ink/70">{before}</td>
                  <td className="p-3">{after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Paket harga */}
      <section id="harga" className="bg-blush/40 px-4 py-16">
        <div className="mx-auto max-w-5xl space-y-8">
          <h2 className="text-center font-display text-3xl md:text-4xl">Paket harga</h2>
          <ul className="grid gap-6 md:grid-cols-3">
            {packages.map((p) => {
              const featured = p.code === "populer";
              return (
                <li key={p.code} className={`flex flex-col rounded-2xl bg-white p-6 shadow-sm ${featured ? "border-2 border-gold md:-translate-y-2" : ""}`}>
                  {featured && <span className="mb-2 self-start rounded-full bg-gold px-3 py-1 text-xs font-semibold text-white">Rekomendasi</span>}
                  <h3 className="font-display text-2xl">{p.name}</h3>
                  <p className="my-3 text-3xl font-semibold">{rupiah(p.price)}</p>
                  <ul className="mb-6 flex-1 space-y-2 text-sm">
                    {packageFeatures(p).map((f) => <li key={f}>✓ {f}</li>)}
                  </ul>
                  <Link href="/dashboard" className={`${btn} ${featured ? "bg-rose text-white" : "border border-rose text-rose"}`}>Pilih {p.name}</Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 7. Testimoni/portofolio: menunggu tangkapan layar undangan nyata dengan izin pasangan (PRD bagian 7). */}

      {/* 8. FAQ */}
      <section id="faq" className="mx-auto max-w-3xl space-y-6 px-4 py-16 pb-28">
        <h2 className="text-center font-display text-3xl md:text-4xl">Pertanyaan umum</h2>
        <div className="space-y-3">
          {FAQ.map(([q, a]) => (
            <details key={q} className="rounded-2xl bg-white p-4 shadow-sm">
              <summary className="cursor-pointer font-semibold">{q}</summary>
              <p className="mt-2 text-ink/80">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
