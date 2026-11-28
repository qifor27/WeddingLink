import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Arch } from "@/components/marketing/Arch";
import { SiteShell } from "@/components/marketing/SiteShell";
import { getPackages } from "@/lib/data";
import { rupiah } from "@/lib/payment";
import { getTheme, themes } from "@/themes";

export const generateStaticParams = () => themes.map((t) => ({ slug: t.slug }));

export async function generateMetadata({ params }: PageProps<"/tema/[slug]">): Promise<Metadata> {
  const theme = getTheme((await params).slug);
  if (!theme) return {};
  const title = `Undangan Digital Tema ${theme.name} — WeddingLink`;
  return {
    title,
    description: `Tema undangan pernikahan digital ${theme.name} (${theme.category.join(", ")}). RSVP, nama tamu di sampul, kirim lewat WhatsApp.`,
    alternates: { canonical: `/tema/${theme.slug}` },
    openGraph: { title, images: [`/screens/${theme.slug}.webp`] },
  };
}

const btn = "inline-flex min-h-12 items-center justify-center rounded-full px-6 font-semibold";

export default async function Page({ params }: PageProps<"/tema/[slug]">) {
  const theme = getTheme((await params).slug);
  if (!theme) notFound();
  const prices = (await getPackages()).map((p) => p.price);
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  // Data terstruktur Product/Offer (PRD bagian 12). `<` di-escape agar JSON tidak bisa menutup tag script.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Undangan Digital Tema ${theme.name}`,
    image: `${site}/screens/${theme.slug}.webp`,
    brand: { "@type": "Brand", name: "WeddingLink" },
    category: "Undangan pernikahan digital",
    offers: {
      "@type": "AggregateOffer", priceCurrency: "IDR", lowPrice: Math.min(...prices), highPrice: Math.max(...prices),
      offerCount: prices.length, availability: "https://schema.org/InStock", url: `${site}/tema/${theme.slug}`,
    },
  };

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-12 pb-28 md:grid-cols-2">
        <Arch src={`/screens/${theme.slug}.webp`} alt={`Tampilan tema ${theme.name}`} preload sizes="(min-width: 768px) 300px, 70vw"
          aspect="aspect-[2/3]" className="mx-auto w-64 md:w-72" />
        <div className="space-y-5">
          <p className="text-sm text-ink/70"><Link href="/tema" className="underline">Katalog tema</Link> / {theme.name}</p>
          <h1 className="font-display text-4xl md:text-5xl">Tema {theme.name}</h1>
          <p className="flex flex-wrap gap-2">
            {theme.category.map((c) => <span key={c} className="rounded-full border border-gold/40 bg-cream px-3 py-1 text-sm">{c}</span>)}
          </p>
          <div className="flex gap-2" aria-label="Palet warna">
            {Object.values(theme.palette).map((c) => <span key={c} className="size-8 rounded-full border border-ink/10" style={{ background: c }} />)}
          </div>
          <p className="text-lg">Mulai <strong>{rupiah(Math.min(...prices))}</strong></p>
          <form action={`/tema/${theme.slug}/preview`} className="space-y-2">
            <label className="block">
              <span className="mb-1 block text-sm">Coba dengan nama Anda</span>
              <input name="nama" maxLength={61} placeholder="Rina & Dimas" className="w-full rounded-xl border border-ink/20 bg-white px-3 py-2.5" />
            </label>
            <button className={`${btn} w-full border border-ink/30 hover:border-gold sm:w-auto`}>Lihat preview</button>
          </form>
          <Link href="/dashboard" className={`${btn} w-full bg-ink text-white hover:bg-gold-deep sm:w-auto`}>Pakai tema ini</Link>
        </div>
      </section>
    </SiteShell>
  );
}
