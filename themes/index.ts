import { themeConfig, type ThemeConfig } from "@/lib/theme";
import blueButterfly from "./blue-butterfly/theme.json";
import goldBlush from "./gold-blush/theme.json";
import minangPastel from "./minang-pastel/theme.json";
import redBeige from "./red-beige/theme.json";
import sageBotanical from "./sage-botanical/theme.json";
import sundaMinang from "./sunda-minang/theme.json";

// Divalidasi saat modul dimuat: theme.json rusak = build gagal, bukan halaman rusak.
export const themes: ThemeConfig[] = [
  blueButterfly, redBeige, minangPastel, sundaMinang, goldBlush, sageBotanical,
].map((t) => themeConfig.parse(t));

export const getTheme = (slug: string) => themes.find((t) => t.slug === slug);
