// Helper murni landing & katalog. Diuji di tests/unit/marketing.test.ts.

export type Pkg = { code: string; name: string; price: number; active_days: number; features: Record<string, unknown> };

export const activeMonths = (p: Pkg) => Math.round(p.active_days / 30);

// Isi paket dari kolom features (DB), bukan teks hardcode, supaya ikut berubah bila paket diubah.
export function packageFeatures(p: Pkg) {
  const f = p.features;
  return [
    f.self_edit ? "Isi & edit sendiri lewat dashboard" : "Dibuatkan admin, Anda cukup kirim data",
    f.photos ? "Foto mempelai & galeri" : "Tema tanpa foto",
    f.guest_links ? "Link pribadi per tamu + kirim WhatsApp" : null,
    "RSVP & ucapan anti-spam",
    typeof f.revisions === "number" && f.revisions > 0 ? `${f.revisions}× revisi` : f.revisions === "wajar" ? "Revisi wajar" : null,
    f.priority ? "Pengerjaan prioritas" : null,
    `Aktif ${activeMonths(p)} bulan sejak terbit`,
  ].filter((x): x is string => !!x);
}

export const waLink = (number: string | undefined, text: string) =>
  number ? `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}` : undefined;

export const FILTERS = [
  ["semua", "Semua"],
  ["adat", "Adat"],
  ["modern", "Modern"],
  ["tanpa-foto", "Tanpa foto"],
] as const;
