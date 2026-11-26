import type { CSSProperties } from "react";
import { Ornament } from "@/components/ornaments";
import { sections, type RsvpContext } from "@/components/sections";
import type { InvitationData } from "@/lib/invitation";
import type { ThemeConfig } from "@/lib/theme";
import { fonts } from "@/themes/fonts";

// Mesin tema (PRD F3): data undangan + theme.json -> halaman. Ganti tema = ganti `theme` saja.
export function Invitation({
  data, theme, watermark, rsvp,
}: { data: InvitationData; theme: ThemeConfig; watermark?: boolean; rsvp?: RsvpContext }) {
  const { palette: p, fonts: f } = theme;
  const style = {
    "--bg": p.bg,
    "--surface": p.surface,
    "--ink": p.ink,
    "--accent": p.accent,
    "--muted": p.muted,
    "--font-script": fonts[f.script].style.fontFamily,
    "--font-display": fonts[f.display].style.fontFamily,
    "--font-body": fonts[f.body].style.fontFamily,
  } as CSSProperties;

  // Dipanggil sebagai fungsi agar section kosong (null) tidak mendapat pembatas.
  const rendered = theme.sections
    .map((s) => [s, sections[s]({ data, theme, rsvp })] as const)
    .filter(([, el]) => el);

  return (
    <div style={style} className="flex-1 bg-(--bg) font-(family-name:--font-body) text-(--ink)">
      <main className="mx-auto max-w-md">
        {rendered.map(([s, el], i) => (
          <div key={s}>
            {i > 0 && <Ornament name={theme.ornaments.divider} className="mx-auto h-6 w-40 text-(--accent)" />}
            {el}
          </div>
        ))}
      </main>
      {watermark && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <span className="-rotate-30 text-7xl font-bold tracking-widest opacity-10">PREVIEW</span>
        </div>
      )}
    </div>
  );
}
