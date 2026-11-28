import { sparkle, type Skin } from "../skin";
import { defs } from "./defs";
import "./skin.css";

// Port dari "tema dari saya/minang-pastel.html": kartu kapsul di halaman Rumah Gadang,
// pita songket pucuak rebuang, marawa, rangkaian bunga pastel, merpati.
const band = (bot = false) => `<div class="band${bot ? " bot" : ""}"><svg><rect width="100%" height="100%" fill="url(#sgk)"/></svg></div>`;
const col = `<svg viewBox="0 0 90 600" preserveAspectRatio="xMinYMid slice">${[[0, 1.05], [175, 0.75], [330, 0.95], [500, 0.8]]
  .map(([y, k], i) => `<g class="${i % 2 ? "sw2" : "sw1"}"><use href="#cluster" transform="translate(0,${y - 20}) scale(${k})"/></g>`)
  .join("")}</svg>`;
const tassels = `<div class="tas"><svg viewBox="0 0 400 34" preserveAspectRatio="none">${Array.from({ length: 12 }, (_, i) => `<g><use href="#tassel" transform="translate(${18 + i * 33.1},0)"/></g>`).join("")}</svg></div>`;
const palms = `<div class="palm l"><svg viewBox="0 0 124 264"><use href="#palm"/></svg></div><div class="palm r"><svg viewBox="0 0 124 264"><use href="#palm"/></svg></div>`;
const flags = `<div class="flag l"><svg viewBox="0 -8 60 180"><use href="#marawa"/></svg></div><div class="flag r"><svg viewBox="0 -8 60 180"><use href="#marawa"/></svg></div>`;
const sparks = sparkle(14, 18, 0) + sparkle(84, 24, -0.8) + sparkle(22, 82, -1.4) + sparkle(78, 76, -2) +
  sparkle(50, 10, -0.4) + sparkle(8, 52, -1.1) + sparkle(92, 58, -1.8);
const dove = (style: string) => `<div class="dove" style="${style}"><svg viewBox="-42 -28 76 44"><use href="#dove"/></svg></div>`;
const corners = `<div class="cnr" style="left:10px;bottom:10px;transform:scaleY(-1)"><svg viewBox="0 0 62 62"><use href="#corner"/></svg></div><div class="cnr" style="right:10px;bottom:10px;transform:scale(-1,-1)"><svg viewBox="0 0 62 62"><use href="#corner"/></svg></div>`;
const house = `<svg class="house" viewBox="0 0 400 236"><use href="#rg"/></svg>`;

export const skin: Skin = {
  defs,
  page: (n) =>
    band() + band(true) + tassels + palms + `<div class="col l">${col}</div><div class="col r">${col}</div>` + sparks +
    (n === 0 ? flags : "") +
    (n % 2 === 0 ? dove(`top:${14 + ((n * 7) % 20)}%;animation-delay:${-n * 3}s`) : "") +
    (n % 3 === 1 ? dove(`top:${60 + ((n * 5) % 15)}%;animation-delay:${-n * 5}s;animation-duration:20s;width:40px`) : ""),
  card: (_n, box) => (box ? corners : ""),
  coverTop: (mono) =>
    `<svg class="mono" viewBox="-60 -60 120 120"><circle r="50" fill="#fff" stroke="#8e88c7"/><circle r="44" fill="none" stroke="#e3d5c0" stroke-dasharray="2 4"/><text y="13" text-anchor="middle" font-size="42" fill="#4f4a8a" class="mono-t">${mono}</text><use href="#bloom" transform="translate(0,-50) scale(.55)"/></svg>`,
  coverBottom: house,
  closing: `<p class="mute">Wassalamu'alaikum Wr. Wb.</p>${house}`,
};
