import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { requireUser } from "@/lib/auth";
import { MAX_PROOF_BYTES, sniffProof } from "@/lib/payment";
import { createAdminClient } from "@/lib/supabase/admin";

const fail = (error: string, status = 400) => Response.json({ error }, { status });
const OPEN = ["pending", "waiting_confirmation"];

// PRD bagian 5 langkah 3 + bagian 11: pemilik order, cek ukuran & tipe asli, gambar di-encode ulang
// (buang EXIF/lokasi & muatan tersembunyi), nama file acak, bucket privat.
export async function POST(req: Request, { params }: RouteContext<"/api/orders/[id]/proof">) {
  const { id } = await params;
  const { supabase, userId } = await requireUser();
  if (Number(req.headers.get("content-length")) > MAX_PROOF_BYTES + 64 * 1024) return fail("File maksimal 5 MB", 413);

  const { data: order } = await supabase.from("orders").select("id, status, proof_path").eq("id", id).eq("user_id", userId).maybeSingle();
  if (!order) return fail("Pesanan tidak ditemukan", 404);
  if (!OPEN.includes(order.status)) return fail("Pesanan ini sudah diproses admin", 409);

  const file = (await req.formData().catch(() => null))?.get("file");
  if (!(file instanceof File) || file.size === 0) return fail("Pilih file bukti transfer");
  if (file.size > MAX_PROOF_BYTES) return fail("File maksimal 5 MB", 413);

  let bytes: Uint8Array = new Uint8Array(await file.arrayBuffer());
  const type = sniffProof(bytes);
  if (!type) return fail("Format harus JPG, PNG, atau PDF");
  if (type !== "pdf") {
    try {
      const img = sharp(bytes, { limitInputPixels: 40_000_000 }).rotate();
      bytes = await (type === "jpg" ? img.jpeg({ quality: 85 }) : img.png()).toBuffer();
    } catch {
      return fail("Gambar rusak atau tidak bisa dibaca");
    }
  }

  const admin = createAdminClient();
  const path = `${userId}/${id}/${randomUUID()}.${type}`;
  const contentType = { jpg: "image/jpeg", png: "image/png", pdf: "application/pdf" }[type];
  const { error: upErr } = await admin.storage.from("proofs").upload(path, bytes, { contentType });
  if (upErr) return fail("Gagal menyimpan file", 500);

  const { data: updated } = await admin.from("orders")
    .update({ proof_path: path, status: "waiting_confirmation" })
    .eq("id", id).in("status", OPEN) // admin mungkin baru saja memproses
    .select("id").maybeSingle();
  if (!updated) {
    await admin.storage.from("proofs").remove([path]);
    return fail("Pesanan ini sudah diproses admin", 409);
  }
  if (order.proof_path) await admin.storage.from("proofs").remove([order.proof_path]);
  return Response.json({ ok: true });
}
