import type { MetadataRoute } from "next";
import { themes } from "@/themes";

// Hanya halaman pemasaran. Undangan (/[slug]) sengaja tidak dimasukkan (PRD bagian 11).
export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return [
    { url: `${site}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${site}/tema`, changeFrequency: "weekly", priority: 0.9 },
    ...themes.map((t) => ({ url: `${site}/tema/${t.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
