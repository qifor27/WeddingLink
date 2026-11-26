import { z } from "zod";

// Skema invitations.data (jsonb). Satu data bisa dipakai semua tema (PRD F3).
// Batas panjang = batas input editor (F4); semua teks dirender sebagai teks React (ter-escape).
const text = (max: number) => z.string().trim().max(max);
// Hanya http(s): mencegah href "javascript:" (XSS).
const link = z.url({ protocol: /^https?$/ });

const person = z.object({
  nama: text(80).min(1),
  panggilan: text(30).min(1),
  ortu: text(160), // "Putra dari Bapak X & Ibu Y"
  foto: link.optional(),
  instagram: z.string().regex(/^[A-Za-z0-9._]{1,30}$/).optional(), // dipakai di URL
});

const event = z.object({
  judul: text(40).min(1), // "Akad Nikah", "Resepsi"
  mulai: z.iso.datetime({ offset: true }),
  selesai: z.iso.datetime({ offset: true }).optional(),
  tempat: text(120).min(1),
  alamat: text(240),
  peta: link.optional(),
});

export const ZONES = { "Asia/Jakarta": "WIB", "Asia/Makassar": "WITA", "Asia/Jayapura": "WIT" } as const;

export const invitationData = z.object({
  zona: z.enum(Object.keys(ZONES) as [keyof typeof ZONES]).default("Asia/Jakarta"),
  pria: person,
  wanita: person,
  acara: z.array(event).min(1).max(4),
  kutipan: z.object({ teks: text(400), sumber: text(80) }).optional(),
  galeri: z.array(link).max(12).default([]),
  cerita: z.array(z.object({ tahun: text(10), judul: text(60), isi: text(400) })).max(6).default([]),
  hadiah: z
    .array(z.object({ bank: text(30).min(1), nomor: text(30).min(1), atasNama: text(80).min(1) }))
    .max(3)
    .default([]),
  qris: link.optional(),
  musik: link.optional(),
  penutup: text(400).optional(),
});

export type InvitationData = z.infer<typeof invitationData>;
