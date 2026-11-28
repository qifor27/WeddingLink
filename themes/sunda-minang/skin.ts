import { sparkle, type Skin } from "../skin";
import { defs as base } from "./defs";
import "./skin.css";

// Port dari "tema dari saya/sunda-minang.html": kartu kapsul di atas lukisan kampung sepia,
// ukiran emas, mawar marun, Julang Ngapak + siger (Sunda) dan Rumah Gadang + suntiang (Minang).
const f = (v: number) => v.toFixed(1);

function siger() {
  let s = '<path d="M-52 8Q0-14 52 8L48 16Q0-4-48 16Z" fill="url(#gd)" stroke="#7a5a28" stroke-width=".6"/>';
  s += '<path d="M-46 8Q0-62 46 8" fill="none" stroke="url(#gd)" stroke-width="3"/><path d="M-36 6Q0-44 36 6" fill="none" stroke="url(#gd)" stroke-width="2"/>';
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const x = (1 - t) ** 2 * -46 + t * t * 46;
    const y = (1 - t) ** 2 * 8 + 2 * (1 - t) * t * -62 + t * t * 8;
    const a = Math.atan2(y + 20, x);
    const dx = Math.cos(a) * 10, dy = Math.sin(a) * 10;
    s += `<path d="M${f(x)} ${f(y)}l${f(dx)} ${f(dy)}" stroke="#b08a4a" stroke-width="1.4"/><circle cx="${f(x + dx)}" cy="${f(y + dy)}" r="2.6" fill="#e6cf98" stroke="#8a6a32" stroke-width=".5"/>`;
  }
  return s + '<path d="M0-40l7 10-7 10-7-10z" fill="#a8394c" stroke="url(#gd)" stroke-width="1.5"/><circle cy="-30" r="2.5" fill="#e6cf98"/><circle cx="-20" cy="-8" r="3" fill="#a8394c"/><circle cx="20" cy="-8" r="3" fill="#a8394c"/>';
}

function suntiang() {
  let u = '<path d="M-50 12Q0-4 50 12L46 20Q0 6-46 20Z" fill="url(#gd)" stroke="#7a5a28" stroke-width=".6"/>';
  for (const [n, L, o] of [[11, 62, 0], [9, 48, 6], [7, 34, 12]])
    for (let i = 0; i < n; i++) {
      const a = ((-72 + (i * 144) / (n - 1)) * Math.PI) / 180;
      const bx = Math.sin(a) * (30 - o), by = 10 - Math.abs(Math.sin(a)) * 4;
      const tx = bx + Math.sin(a) * L * 0.55, ty = by - Math.cos(a) * L;
      u += `<path d="M${f(bx)} ${f(by)}L${f(tx)} ${f(ty)}" stroke="#b08a4a" stroke-width="1"/>`;
      for (let k = 1; k <= 3; k++)
        u += `<circle cx="${f(bx + ((tx - bx) * k) / 3)}" cy="${f(by + ((ty - by) * k) / 3)}" r="${k === 3 ? 3.4 : 1.8}" fill="${k === 3 ? "url(#gd)" : "#e6cf98"}" stroke="#8a6a32" stroke-width=".4"/>`;
    }
  return u + '<g fill="#a8394c"><circle cx="0" cy="4" r="3"/><circle cx="-16" cy="6" r="2"/><circle cx="16" cy="6" r="2"/></g>';
}

const defs = base.replace('<g id="siger"></g>', `<g id="siger">${siger()}</g>`).replace('<g id="suntiang"></g>', `<g id="suntiang">${suntiang()}</g>`);

const col = `<svg viewBox="0 0 70 500" preserveAspectRatio="xMinYMid slice">${[[0, 0.55], [130, 0.42], [250, 0.5], [380, 0.42]]
  .map(([y, k], i) => `<g class="${i % 2 ? "s2" : "s1"}"><use href="#rcl" transform="translate(0,${y}) scale(${k})"/></g>`)
  .join("")}</svg>`;
const tassels = `<div class="tas"><svg viewBox="0 0 300 30" preserveAspectRatio="none">${Array.from({ length: 9 }, (_, i) => `<g><use href="#tassel" transform="translate(${18 + i * 33},0)"/></g>`).join("")}</svg></div>`;
const frame =
  `<div class="land"><svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice"><use href="#land"/></svg></div>` +
  `<div class="bar"><svg><rect width="100%" height="100%" fill="url(#barp)"/></svg></div><div class="bar b"><svg><rect width="100%" height="100%" fill="url(#barp)"/></svg></div>` +
  tassels +
  ["tl", "tr", "bl", "br"].map((c) => `<div class="fil ${c}"><svg viewBox="0 0 150 150"><use href="#fil"/></svg></div>`).join("") +
  `<div class="col l">${col}</div><div class="col r">${col}</div>` +
  sparkle(16, 20, 0) + sparkle(82, 26, -0.8) + sparkle(20, 80, -1.4) + sparkle(80, 74, -2) + sparkle(50, 8, -0.4) +
  sparkle(10, 50, -1.1) + sparkle(90, 56, -1.8) + sparkle(36, 92, -0.6) + sparkle(64, 90, -1.5);
const roses = (n: number) =>
  (n % 2 ? ["tl", "br"] : ["tr", "bl"]).map((c) => `<div class="ros ${c}"><svg viewBox="0 0 130 130"><g class="sw"><use href="#rcl"/></g></svg></div>`).join("");
const dove = (style: string) => `<div class="dove" style="${style}"><svg viewBox="-42 -28 76 44"><use href="#dove"/></svg></div>`;
const houses = `<svg class="houses" viewBox="0 0 680 240"><use href="#sunda" transform="translate(0,48)"/><use href="#gadang" transform="translate(262,6) scale(1.04)"/></svg>`;

export const skin: Skin = {
  defs,
  page: (n) =>
    frame + roses(n) +
    (n % 2 === 0 ? dove(`top:${16 + ((n * 7) % 22)}%;animation-delay:${-n * 3}s`) : "") +
    (n % 3 === 1 ? dove(`top:${62 + ((n * 5) % 14)}%;animation-delay:${-n * 5}s;animation-duration:21s;width:38px`) : ""),
  coverTop: () => `<svg class="crown" viewBox="-60 -70 120 90"><use href="#suntiang"/></svg>`,
  coverBottom: `<div class="houses-wrap">${houses}</div>`,
  person: (who) =>
    who === "wanita"
      ? `<svg class="crown" viewBox="-60 -50 120 70" style="width:110px"><use href="#siger"/></svg>`
      : `<svg class="crown" viewBox="0 0 400 236" style="width:120px"><use href="#gadang"/></svg>`,
  closing: `<p class="mute">Hatur nuhun · Tarimo kasih</p>${houses}`,
};
