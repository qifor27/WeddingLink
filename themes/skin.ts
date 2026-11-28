// Skin = tampilan visual satu tema: CSS (themes/<slug>/skin.css) + ornamen SVG.
// Semua string di sini adalah markup SVG statis buatan repo (bukan input pengguna),
// jadi aman disisipkan sebagai HTML. Data pengguna tetap dirender lewat React (ter-escape).
export type Skin = {
  defs?: string; // isi <defs> (simbol untuk <use href="#...">)
  bg?: string; // latar tetap di belakang semua halaman
  page?: (n: number, box: boolean) => string; // ornamen di dalam .pg, di belakang/sekitar kartu
  card?: (n: number, box: boolean) => string; // ornamen di dalam .card (mahkota bunga, sudut)
  coverTop?: (mono: string) => string; // di atas nama mempelai pada cover; mono = inisial "W&amp;P", sudah di-escape
  coverBottom?: string; // di bawah kotak nama tamu pada cover
  person?: (who: "pria" | "wanita") => string; // ornamen di atas foto mempelai
  closing?: string; // di bawah nama pada penutup
};

export const sparkle = (x: number, y: number, d: number) =>
  `<div class="spk" style="left:${x}%;top:${y}%;animation-delay:${d}s"><svg viewBox="0 0 14 14"><use href="#spark"/></svg></div>`;

// Escape HTML untuk satu-satunya data pengguna yang masuk ke ornamen: inisial monogram.
export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
