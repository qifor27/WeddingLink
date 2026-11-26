import { z } from "zod";

export const rsvpInput = z.object({
  invitationId: z.uuid(),
  code: z.string().max(20).optional(),
  name: z.string().trim().min(1).max(60),
  attendance: z.enum(["hadir", "tidak_hadir", "ragu"]),
  pax: z.number().int().min(1).max(5),
  message: z.string().trim().max(500).optional(),
  token: z.string().min(1).max(2048), // Turnstile
});

// Kata kasar umum (Indonesia + daerah). Ucapan yang kena otomatis disembunyikan,
// tetap tersimpan untuk moderasi pasangan; pengirim tidak diberi tahu.
const WORDS = [
  "anjing", "anjg", "ajg", "anjir", "babi", "bangsat", "bgst", "bajingan", "brengsek", "keparat",
  "kampret", "goblok", "gblk", "tolol", "tll", "bego", "idiot", "kontol", "kntl", "memek", "mmk",
  "ngentot", "ngentod", "entot", "jancok", "jancuk", "cok", "asu", "pepek", "perek", "lonte",
  "pelacur", "tai", "taik", "setan", "bacot", "jembut", "pantek", "puki", "kimak",
];
const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", $: "s" };

export function isProfane(text: string) {
  const norm = text.toLowerCase().replace(/[013457@$]/g, (c) => LEET[c]);
  // Versi asli + versi tanpa huruf berulang ("anjiiing" -> "anjing"; "mmk" tetap dicek apa adanya).
  const words = `${norm} ${norm.replace(/(.)\1+/g, "$1")}`.split(/[^a-z]+/);
  // Kata panjang juga dicocokkan sebagai awalan ("kontolnya"); kata pendek harus persis ("pantai" aman).
  return words.some((w) => WORDS.some((k) => w === k || (k.length >= 5 && w.startsWith(k))));
}
