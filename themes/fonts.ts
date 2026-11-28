import {
  Allura, Bodoni_Moda, Cinzel, Cormorant_Garamond, Great_Vibes, Italiana, Jost, Lora, Nunito_Sans, Parisienne,
  Pinyon_Script, Playfair_Display,
} from "next/font/google";
import type { FontKey } from "@/lib/theme";

// Font loader wajib const di module scope dengan opsi literal.
// preload: false -> hanya font yang dipakai tema aktif yang diunduh browser.
const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"], display: "swap", preload: false });
const parisienne = Parisienne({ weight: "400", subsets: ["latin"], display: "swap", preload: false });
const allura = Allura({ weight: "400", subsets: ["latin"], display: "swap", preload: false });
const pinyon = Pinyon_Script({ weight: "400", subsets: ["latin"], display: "swap", preload: false });
const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600"], style: ["normal", "italic"], subsets: ["latin"], display: "swap", preload: false,
});
const italiana = Italiana({ weight: "400", subsets: ["latin"], display: "swap", preload: false });
const cinzel = Cinzel({ subsets: ["latin"], display: "swap", preload: false });
const playfair = Playfair_Display({ subsets: ["latin"], display: "swap", preload: false });
const bodoni = Bodoni_Moda({ style: ["normal", "italic"], subsets: ["latin"], display: "swap", preload: false });
const lora = Lora({ style: ["normal", "italic"], subsets: ["latin"], display: "swap", preload: false });
const jost = Jost({ subsets: ["latin"], display: "swap", preload: false });
const nunito = Nunito_Sans({ subsets: ["latin"], display: "swap", preload: false });

export const fonts: Record<FontKey, { style: { fontFamily: string } }> = {
  "great-vibes": greatVibes, parisienne, allura, "pinyon-script": pinyon, cormorant, italiana, cinzel, playfair, bodoni,
  lora, jost, "nunito-sans": nunito,
};
