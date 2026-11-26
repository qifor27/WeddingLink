// Helper murni pembayaran manual (PRD bagian 5). Diuji di tests/unit/payment.test.ts.

export const MAX_PROOF_BYTES = 5 * 1024 * 1024;

// Tipe asli dari magic bytes, bukan dari nama file / Content-Type kiriman klien.
export function sniffProof(b: Uint8Array): "jpg" | "png" | "pdf" | null {
  const starts = (...sig: number[]) => sig.every((x, i) => b[i] === x);
  if (starts(0xff, 0xd8, 0xff)) return "jpg";
  if (starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "png";
  if (starts(0x25, 0x50, 0x44, 0x46, 0x2d)) return "pdf"; // %PDF-
  return null;
}

export const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

// Kode unik 1–999 ditambahkan ke harga supaya transfer mudah dicocokkan dengan mutasi rekening.
export const randomUniqueCode = () => 1 + Math.floor(Math.random() * 999);

export const ORDER_STATUS: Record<string, string> = {
  pending: "Menunggu pembayaran",
  waiting_confirmation: "Menunggu konfirmasi admin",
  paid: "Lunas",
  rejected: "Ditolak",
};
