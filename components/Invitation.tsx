import type { CSSProperties } from "react";
import { Ornament } from "@/components/ornaments";
import { sections, type RsvpContext } from "@/components/sections";
import "@/components/sections/base.css";
import type { InvitationData } from "@/lib/invitation";
import type { ThemeConfig } from "@/lib/theme";
import { fonts } from "@/themes/fonts";
import { skins } from "@/themes/skins";

// Mesin tema (PRD F3): data undangan + theme.json (+ skin) -> halaman. Ganti tema = ganti `theme` saja.
export function Invitation({
  data, theme, watermark, rsvp,
}: { data: InvitationData; theme: ThemeConfig; watermark?: boolean; rsvp?: RsvpContext }) {
  const { palette: p, fonts: f } = theme;
  const skin = skins[theme.slug];
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
    .map((s, n) => [s, sections[s]({ data, theme, skin: skin ?? {}, n, rsvp })] as const)
    .filter(([, el]) => el);

  return (
    <div style={style} className={`inv flex-1 skin-${skin ? theme.slug : "base"}`}>
      {/* Ornamen statis milik repo (themes/<slug>/skin.ts), bukan input pengguna. */}
      {skin?.defs && (
        <svg width="0" height="0" className="absolute" aria-hidden="true" dangerouslySetInnerHTML={{ __html: `<defs>${skin.defs}</defs>` }} />
      )}
      {skin?.bg && <div className="bg" aria-hidden="true" dangerouslySetInnerHTML={{ __html: skin.bg }} />}
      <main>
        {rendered.map(([s, el], i) => (
          <div key={s} data-section={s}>
            {!skin && i > 0 && <Ornament name={theme.ornaments.divider} className="divider" />}
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
