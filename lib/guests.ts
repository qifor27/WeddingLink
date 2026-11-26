// Helper murni (tanpa I/O) untuk tamu, link, WhatsApp, CSV. Diuji di tests/unit/guests.test.ts.

export const MAX_IMPORT = 1000;

// Satu tamu per baris: "Nama" atau "Nama,Grup" (CSV sederhana / tempel dari WhatsApp/Excel).
export function parseGuests(text: string) {
  const seen = new Set<string>();
  const guests: { name: string; group: string | null }[] = [];
  for (const line of text.split(/\r?\n/)) {
    const [rawName, rawGroup] = line.split(/[,;\t]/);
    const name = rawName?.replace(/^"|"$/g, "").trim().slice(0, 60);
    if (!name || name.toLowerCase() === "nama" || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    guests.push({ name, group: rawGroup?.replace(/^"|"$/g, "").trim().slice(0, 60) || null });
    if (guests.length === MAX_IMPORT) break;
  }
  return guests;
}

export const guestLink = (site: string, slug: string, name: string, code: string) =>
  `${site}/${slug}?${new URLSearchParams({ to: name, k: code })}`;

export function waLink(guest: string, couple: string, link: string) {
  const text =
    `Kepada Yth. ${guest}\n\n` +
    `Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami.\n\n` +
    `Info lengkap & konfirmasi kehadiran:\n${link}\n\n` +
    `Merupakan kebahagiaan bagi kami atas kehadiran dan doa restunya. Terima kasih.\n\n${couple}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

// Sel diawali = + - @ dinetralkan supaya tidak dieksekusi sebagai formula di Excel/Sheets.
const cell = (v: unknown) => {
  const s = String(v ?? "");
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};
export const toCsv = (rows: unknown[][]) => rows.map((r) => r.map(cell).join(",")).join("\r\n");

// Cegah open redirect: hanya path internal.
export const safeNext = (next: string | null | undefined) =>
  next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/dashboard";
