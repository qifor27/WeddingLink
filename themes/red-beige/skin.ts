import type { Skin } from "../skin";
import "./skin.css";

// Port dari "tema dari saya/red-beige.html": kartu krem bersudut lekuk di atas kain merah,
// ornamen garis (peony, awan, burung hong) yang "digambar" tinta.
const P = 'class="d" pathLength="1"';

function peony() {
  let s = "";
  for (const [n, d, rx, ry, o] of [[9, 32, 15, 20, 0], [8, 22, 11, 15, 20], [7, 13, 7, 9, 10]])
    for (let i = 0; i < n; i++) s += `<ellipse ${P} cx="0" cy="${-d}" rx="${rx}" ry="${ry}" transform="rotate(${o + (i * 360) / n})"/>`;
  s += `<circle ${P} r="5"/><circle ${P} r="2"/>`;
  for (const [x, y, r] of [[-10, 48, 200], [14, 50, -20], [30, 34, 30]])
    s += `<g transform="translate(${x},${y}) rotate(${r})"><path ${P} d="M0 0C15-12 40-10 58 6C40 16 16 14 0 0Z"/><path ${P} d="M3 1C20 2 38 4 54 6M18 2 26-6M30 4 38-4M20 3 26 10M34 5 40 12"/></g>`;
  s += `<path ${P} d="M-4 52C-20 70-40 76-62 72M-62 72a8 8 0 1 1 8 8a4 4 0 1 1-4-4"/>`;
  return `<svg viewBox="-75 -60 150 150" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round">${s}</svg>`;
}

function cloud() {
  const c = (x: number, y: number, k: number) =>
    `<g transform="translate(${x},${y}) scale(${k})"><path ${P} d="M0 0a14 14 0 1 1 14 14a8 8 0 1 1-8-8a4 4 0 1 1 4 4"/><path ${P} d="M-34 10C-20 16-8 12 0 0M14 14C30 18 42 14 50 4"/></g>`;
  return `<svg viewBox="-70 -40 140 70" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round">${c(-26, -6, 1)}${c(18, -14, 0.8)}${c(30, 10, 0.6)}<path ${P} d="M-64 16C-30 26 30 26 66 14M-50 24C-20 30 20 30 54 22"/></svg>`;
}

function bird() {
  let s = `<circle ${P} cx="44" cy="-34" r="7"/><circle ${P} cx="46" cy="-35" r="1.4"/><path ${P} d="M50-36l12 3-12 4"/><path ${P} d="M40-40C34-56 46-60 42-46M45-41C46-58 58-54 49-43M38-38C28-50 32-58 38-48"/><path ${P} d="M38-28C26-10 16 8-6 14C-28 20-42 10-54 -2"/><path ${P} d="M48-28C46 0 26 22-4 26C-24 28-40 22-52 8"/>`;
  for (let i = 0; i < 6; i++) s += `<path ${P} d="M${14 - i * 7} ${-6 + i * 3}C${-6 - i * 9} ${-44 + i * 5} ${-28 - i * 7} ${-40 + i * 7} ${-36 - i * 5} ${-22 + i * 6}"/>`;
  for (let i = 0; i < 4; i++) s += `<path ${P} d="M${-6 - i * 4} ${4 + i * 3}C${-10 - i * 6} ${-12 + i * 4} ${-20 - i * 6} ${-16 + i * 6} ${-24 - i * 6} ${-6 + i * 6}"/>`;
  for (const [a, b] of [[0, 0], [8, 14], [-6, 26]])
    s += `<path ${P} d="M-52 4C-70 ${18 + b} ${-78 + a} ${46 + b} ${-56 + a} ${54 + b}a10 10 0 1 0 -6 -14a5 5 0 1 0 4 6"/>`;
  return `<svg viewBox="-90 -64 160 140" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;
}

const O = { peony: peony(), cloud: cloud(), bird: bird() };
const orn = (pos: string, o: keyof typeof O, float = false) => `<div class="orn ${pos}${float ? " float" : ""}">${O[o]}</div>`;
// Susunan ornamen per halaman, bergiliran seperti di desain asli.
const SETS = [
  orn("o-tl", "bird") + orn("o-tr", "bird") + orn("o-bl", "peony") + orn("o-br", "peony"),
  orn("o-tc", "cloud", true) + orn("o-bl", "peony") + orn("o-br", "peony"),
  orn("o-tl", "cloud") + orn("o-br", "cloud"),
  orn("o-tl", "bird") + orn("o-br", "peony"),
  orn("o-tr", "bird") + orn("o-bl", "peony"),
  orn("o-tc", "cloud", true),
  orn("o-tl", "bird", true) + orn("o-tr", "bird", true),
];

export const skin: Skin = {
  bg: `<svg><defs><pattern id="pt" width="120" height="70" patternUnits="userSpaceOnUse"><g fill="none" stroke="#8a2224" stroke-width="1" opacity=".55"><path d="M10 40a12 12 0 1 1 12 12a7 7 0 1 1-7-7a3.5 3.5 0 1 1 3.5 3.5M-20 46C-6 52 4 50 10 40M34 52C50 56 60 50 70 40a10 10 0 1 1 10 10a5 5 0 1 1-5-5"/></g></pattern></defs><rect width="100%" height="100%" fill="url(#pt)"/></svg>`,
  card: (n) => SETS[n % SETS.length],
  coverTop: () => `<p class="sc mute intro">Dengan penuh sukacita<br>kami mengundang Anda</p>`,
};
