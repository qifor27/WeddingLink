import assert from "node:assert/strict";
import { test } from "node:test";
import { isProfane, rsvpInput } from "../../lib/rsvp.ts";

test("kata kasar terdeteksi, termasuk variasi", () => {
  for (const t of ["dasar anjing", "ANJIIING", "4njing lu", "b@ngsat", "kontolnya", "mmk", "dasar tai"]) {
    assert.equal(isProfane(t), true, t);
  }
});

test("kata biasa tidak salah tangkap", () => {
  for (const t of ["Selamat menempuh hidup baru", "pantai indah", "asuransi", "babinsa hadir", "Barakallah, semoga sakinah"]) {
    assert.equal(isProfane(t), false, t);
  }
});

const ok = { invitationId: "6f9619ff-8b86-4011-b42d-00c04fc964ff", name: "Budi", attendance: "hadir", pax: 2, token: "t" };

test("input RSVP valid diterima", () => assert.equal(rsvpInput.safeParse(ok).success, true));

test("input RSVP di luar batas ditolak", () => {
  for (const bad of [
    { ...ok, name: "x".repeat(61) },
    { ...ok, name: "   " },
    { ...ok, pax: 50 },
    { ...ok, attendance: "mungkin" },
    { ...ok, message: "x".repeat(501) },
    { ...ok, invitationId: "1 or 1=1" },
    { ...ok, token: "" },
  ]) assert.equal(rsvpInput.safeParse(bad).success, false, JSON.stringify(bad).slice(0, 60));
});
