import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/SiteShell";
import { ThemeGallery } from "@/components/marketing/ThemeGallery";
import { themes } from "@/themes";

export const metadata: Metadata = {
  title: "Katalog Tema Undangan Digital Minang, Sunda & Modern — WeddingLink",
  description: "Pilih tema undangan pernikahan digital: Minang Pastel, Sunda–Minang, Gold Blush, Sage Botanical, dan lainnya. Preview gratis dengan nama Anda.",
  alternates: { canonical: "/tema" },
};

export default function Page() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl space-y-8 px-4 py-12 pb-28">
        <div className="space-y-2 text-center">
          <h1 className="font-display text-4xl md:text-5xl">Katalog tema</h1>
          <p className="text-ink/80">Ketuk tema untuk melihat detail dan preview dengan nama Anda.</p>
        </div>
        <ThemeGallery themes={themes.map(({ slug, name, category }) => ({ slug, name, category }))} />
      </section>
    </SiteShell>
  );
}
