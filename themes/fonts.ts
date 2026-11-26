import {
  Bodoni_Moda, Cinzel, Cormorant_Garamond, Great_Vibes, Italiana, Jost, Lora, Parisienne, Playfair_Display,
} from "next/font/google";
import type { FontKey } from "@/lib/theme";

// Font loader wajib const di module scope dengan opsi literal.
// preload: false -> hanya font yang dipakai tema aktif yang diunduh browser.
const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"], display: "swap", preload: false });
const parisienne = Parisienne({ weight: "400", subsets: ["latin"], display: "swap", preload: false });
const cormorant = Cormorant_Garamond({ weight: ["400", "600"], subsets: ["latin"], display: "swap", preload: false });
const italiana = Italiana({ weight: "400", subsets: ["latin"], display: "swap", preload: false });
const cinzel = Cinzel({ subsets: ["latin"], display: "swap", preload: false });
const playfair = Playfair_Display({ subsets: ["latin"], display: "swap", preload: false });
const bodoni = Bodoni_Moda({ subsets: ["latin"], display: "swap", preload: false });
const lora = Lora({ subsets: ["latin"], display: "swap", preload: false });
const jost = Jost({ subsets: ["latin"], display: "swap", preload: false });

export const fonts: Record<FontKey, { style: { fontFamily: string } }> = {
  "great-vibes": greatVibes, parisienne, cormorant, italiana, cinzel, playfair, bodoni, lora, jost,
};
