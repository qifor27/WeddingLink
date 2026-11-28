import Link from "next/link";
import type { ReactNode } from "react";
import { waLink } from "@/lib/marketing";

export const WA_TEXT = "Halo WeddingLink, saya ingin memesan undangan digital.";

const LEFT = [["/tema", "Tema"], ["/#fitur", "Fitur"], ["/#cara-kerja", "Cara kerja"]];
const RIGHT = [["/#harga", "Harga"], ["/#faq", "FAQ"]];
const link = "transition-colors hover:text-gold-deep";

// Header (menu kiri, logo tengah, menu kanan), footer, dan tombol WhatsApp menempel (PRD bagian 7 no. 8).
export function SiteShell({ children }: { children: ReactNode }) {
  const wa = waLink(process.env.NEXT_PUBLIC_WA_NUMBER, WA_TEXT);
  return (
    <>
      <header className="border-b border-gold/30 bg-white">
        <nav aria-label="Utama" className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center py-4">
            <ul className="hidden gap-7 text-sm md:flex">
              {LEFT.map(([href, label]) => <li key={href}><Link href={href} className={link}>{label}</Link></li>)}
            </ul>
            <Link href="/" className="col-start-2 font-display text-2xl italic md:text-3xl">WeddingLink</Link>
            <div className="col-start-3 flex items-center justify-end gap-7 text-sm">
              <ul className="hidden gap-7 md:flex">
                {RIGHT.map(([href, label]) => <li key={href}><Link href={href} className={link}>{label}</Link></li>)}
              </ul>
              <Link href="/dashboard" className="rounded-full border border-ink/30 px-4 py-1.5 transition-colors hover:border-gold">Masuk</Link>
            </div>
          </div>
          <ul className="flex justify-center gap-5 overflow-x-auto pb-3 text-sm md:hidden">
            {[...LEFT, ...RIGHT].map(([href, label]) => <li key={href} className="shrink-0"><Link href={href} className={link}>{label}</Link></li>)}
          </ul>
        </nav>
      </header>
      <main className="flex-1 bg-white">{children}</main>
      <footer className="border-t border-gold/30 bg-cream px-4 py-12 text-center">
        <p className="font-display text-2xl italic">WeddingLink</p>
        <p className="mt-2 text-sm text-ink/70">Undangan pernikahan digital custom: adat Nusantara, modern, hingga minimalis.</p>
        <p className="mt-6 text-xs text-ink/60">© WeddingLink</p>
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
