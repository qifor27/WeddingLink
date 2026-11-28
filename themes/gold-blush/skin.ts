import { sparkle, type Skin } from "../skin";
import { defs } from "./defs";
import "./skin.css";

// Port dari "tema dari saya/gold-pink.html": kartu lengkung putih bergaris emas di atas marmer blush.
const garland = `<div class="gar"><svg viewBox="60 0 280 100"><g class="sw"><use href="#garland"/></g></svg></div>`;
const bouquets = `<div class="bq l"><svg viewBox="0 0 120 120"><use href="#bouquet"/></svg></div><div class="bq r"><svg viewBox="0 0 120 120"><use href="#bouquet"/></svg></div>`;
const sparks = sparkle(12, 14, 0) + sparkle(86, 20, -0.7) + sparkle(8, 46, -1.3) + sparkle(92, 52, -1.9) +
  sparkle(18, 84, -0.4) + sparkle(80, 88, -1.1) + sparkle(50, 6, -1.6) + sparkle(64, 94, -0.9);

export const skin: Skin = {
  defs,
  bg: `<svg preserveAspectRatio="none"><defs><filter id="mb" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".004 .009" numOctaves="4" seed="7"/><feColorMatrix values="0 0 0 0 .97  0 0 0 0 .86  0 0 0 0 .88  0 0 0 -1.6 1.25"/></filter><linearGradient id="vein" x1="0" x2="1"><stop offset="0" stop-color="#c6a15b" stop-opacity="0"/><stop offset=".5" stop-color="#d9bb7a"/><stop offset="1" stop-color="#c6a15b" stop-opacity="0"/></linearGradient></defs><rect width="100%" height="100%" fill="#f6e1e4"/><rect width="100%" height="100%" filter="url(#mb)"/><g fill="none" stroke="url(#vein)" stroke-linecap="round" opacity=".7"><path d="M-50 120C150 160 260 60 480 140S820 120 1100 40S1500 160 1900 90" stroke-width="1.4"/><path d="M-50 520C200 470 360 600 620 540S1000 460 1300 560S1700 520 2000 600" stroke-width="1"/><path d="M100 900C300 820 500 940 760 860S1200 900 1500 800" stroke-width="1.6"/><path d="M300-20C340 200 260 400 360 640S300 900 420 1200" stroke-width=".8"/></g></svg>`,
  page: (n) =>
    `<div class="deco frame"></div>` +
    (n % 2 ? `<div class="deco ring a"></div><div class="deco blob b"></div>` : `<div class="deco blob a"></div><div class="deco ring b"></div>`) +
    sparks,
  card: (n) => garland + (n === 0 ? bouquets : ""),
  closing: bouquets,
};
