import assert from "node:assert/strict";
import { test } from "node:test";
import { packageFeatures, waLink } from "../../lib/marketing.ts";

test("isi paket dari features di DB", () => {
  const hemat = packageFeatures({ code: "hemat", name: "Hemat", price: 49000, active_days: 90,
    features: { self_edit: true, photos: false, guest_links: false, revisions: 0 } });
  assert.deepEqual(hemat, ["Isi & edit sendiri lewat dashboard", "Tema tanpa foto", "RSVP & ucapan anti-spam", "Aktif 3 bulan sejak terbit"]);
  const istimewa = packageFeatures({ code: "istimewa", name: "Istimewa", price: 179000, active_days: 365,
    features: { self_edit: false, photos: true, guest_links: true, revisions: "wajar", priority: true } });
  assert.ok(istimewa.includes("Revisi wajar") && istimewa.includes("Pengerjaan prioritas") && istimewa.includes("Aktif 12 bulan sejak terbit"));
});

test("link WhatsApp: nomor dibersihkan, tanpa nomor = tidak ada tombol", () => {
  assert.equal(waLink("+62 812-3456-7890", "Halo & tanya"), "https://wa.me/6281234567890?text=Halo%20%26%20tanya");
  assert.equal(waLink(undefined, "x"), undefined);
  assert.equal(waLink("", "x"), undefined);
});
