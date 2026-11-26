import { z } from "zod";

// Skema themes/<slug>/theme.json. Tema baru = file konfigurasi baru (PRD F3).
export const SECTIONS = [
  "cover", "quote", "mempelai", "countdown", "acara", "maps",
  "galeri", "story", "rsvp", "wishes", "gift", "penutup",
] as const;
export const FONTS = [
  "great-vibes", "parisienne", "cormorant", "italiana", "cinzel", "playfair", "bodoni", "lora", "jost",
] as const;
export const ORNAMENTS = [
  "divider", "songket-band", "marawa", "rumah-gadang", "mega-mendung", "butterfly", "sprig",
] as const;

const hex = z.string().regex(/^#[0-9a-f]{6}$/i);

export const themeConfig = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  category: z.array(z.string()).min(1),
  photos: z.boolean(), // false: foto mempelai & galeri tidak ditampilkan
  palette: z.object({ bg: hex, surface: hex, ink: hex, accent: hex, muted: hex }),
  fonts: z.object({ script: z.enum(FONTS), display: z.enum(FONTS), body: z.enum(FONTS) }),
  ornaments: z.object({ cover: z.array(z.enum(ORNAMENTS)), divider: z.enum(ORNAMENTS) }),
  sections: z.array(z.enum(SECTIONS)).min(1),
});

export type ThemeConfig = z.infer<typeof themeConfig>;
export type Section = (typeof SECTIONS)[number];
export type Ornament = (typeof ORNAMENTS)[number];
export type FontKey = (typeof FONTS)[number];
