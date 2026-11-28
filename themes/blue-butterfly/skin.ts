import type { Skin } from "../skin";
import { defs } from "./defs";
import "./skin.css";

// Port dari "tema dari saya/blue-butterfly.html": kertas cat air, rangkaian anemone di sudut, kupu-kupu terbang.
const corner = (c: string) => `<div class="corner ${c}"><svg viewBox="0 0 210 210"><use href="#cl"/></svg></div>`;
const fly = (style: string) =>
  `<div class="fly" style="${style}"><svg viewBox="-30 -28 60 56"><g class="wl"><use href="#wing"/></g><g class="wr"><g transform="scale(-1,1)"><use href="#wing"/></g></g><ellipse rx="1.7" ry="10" fill="#2a3a4c"/><path d="M0-9C-2-15-5-18-7-19M0-9C2-15 5-18 7-19" stroke="#2a3a4c" stroke-width=".8" fill="none"/></svg></div>`;
const CORNERS = [["tl", "br"], ["tr"], ["tl"], ["br"], ["tl"], ["tr"], ["bl"]];
const FLIES = ["top:18%;right:14%;animation-duration:16s", "bottom:20%;left:8%;animation-delay:-3s", "top:12%;left:10%;animation-delay:-9s;animation-duration:15s"];

export const skin: Skin = {
  defs,
  page: (n) =>
    n === 0
      ? ["tl", "tr", "bl", "br"].map(corner).join("") + fly("top:22%;left:12%") + fly("top:66%;right:16%;animation-delay:-6s;animation-duration:17s")
      : CORNERS[n % CORNERS.length].map(corner).join("") + (n % 2 ? "" : fly(FLIES[(n / 2) % FLIES.length])),
  coverTop: (mono) =>
    `<svg class="mono" viewBox="-80 -80 160 160"><circle r="62" fill="none" stroke="#c9d9e6"/><circle r="56" fill="none" stroke="#c9d9e6" stroke-dasharray="2 5"/><use href="#anem" transform="translate(0,-62) scale(.32)"/><use href="#forget" transform="translate(-22,-60) scale(.8)"/><use href="#forget" transform="translate(22,-60) scale(.8)"/><use href="#leaf" transform="translate(-8,-62) rotate(-80) scale(.4)"/><use href="#leaf" transform="translate(8,-62) rotate(80) scale(.4)"/><text x="0" y="14" text-anchor="middle" font-size="54" fill="#2f4a63" class="mono-t">${mono}</text></svg>`,
  person: (who) =>
    `<svg class="ringfl" viewBox="-90 -90 180 180"><circle r="64" fill="#eef4fa" stroke="#c9d9e6"/>${who === "wanita" ? `<use href="#anem" transform="translate(-50,48) scale(.42)"/><use href="#forget" transform="translate(-24,62)"/><use href="#leaf" transform="translate(-50,48) rotate(-150) scale(.45)"/><use href="#anem" style="--p:url(#pb)" transform="translate(52,-46) scale(.3)"/>` : `<use href="#anem" transform="translate(50,48) scale(.42)"/><use href="#forget" transform="translate(24,62)"/><use href="#leaf" transform="translate(50,48) rotate(150) scale(.45)"/><use href="#anem" style="--p:url(#pb)" transform="translate(-52,-46) scale(.3)"/>`}</svg>`,
  closing: `<p class="sub">Wassalamu'alaikum Wr. Wb.</p>`,
};
