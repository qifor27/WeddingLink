import Link from "next/link";
import type { ReactNode } from "react";
import { waLink } from "@/lib/marketing";

export const WA_TEXT = "Halo WeddingLink, saya ingin memesan undangan digital.";

// Header, footer, dan tombol WhatsApp menempel (PRD bagian 7 no. 8) untuk landing & katalog.
export function SiteShell({ children }: { children: ReactNode }) {
  const wa = waLink(process.env.NEXT_PUBLIC_WA_NUMBER, WA_TEXT);
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-blush bg-bg/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="font-display text-xl">WeddingLink</Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/tema" className="hidden sm:inline">Tema</Link>
            <Link href="/#harga" className="hidden sm:inline">Harga</Link>
            <Link href="/#faq" className="hidden sm:inline">FAQ</Link>
            <Link href="/dashboard" className="rounded-full border border-rose px-4 py-1.5 text-rose">Masuk</Link>
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-blush px-4 py-8 text-center text-sm text-ink/70">
        © WeddingLink · Undangan pernikahan digital bertema Nusantara
      </footer>
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="Chat WhatsApp"
          className="fixed right-4 bottom-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#25d366] px-5 font-semibold text-white shadow-lg">
          WhatsApp
        </a>
      )}
    </>
  );
}
