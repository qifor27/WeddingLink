import assert from "node:assert/strict";
import { test } from "node:test";
import { randomUniqueCode, rupiah, sniffProof } from "../../lib/payment.ts";

const bytes = (...b: number[]) => new Uint8Array(b);

test("tipe bukti transfer dari magic bytes", () => {
  assert.equal(sniffProof(bytes(0xff, 0xd8, 0xff, 0xe0)), "jpg");
  assert.equal(sniffProof(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0)), "png");
  assert.equal(sniffProof(new TextEncoder().encode("%PDF-1.7")), "pdf");
  // HTML/SVG yang diberi nama .jpg tetap ditolak
  assert.equal(sniffProof(new TextEncoder().encode("<svg onload=alert(1)>")), null);
  assert.equal(sniffProof(bytes()), null);
});

test("format rupiah & kode unik", () => {
  assert.equal(rupiah(99137), "Rp99.137");
  for (let i = 0; i < 1000; i++) {
    const c = randomUniqueCode();
    assert.ok(c >= 1 && c <= 999 && Number.isInteger(c));
  }
});
