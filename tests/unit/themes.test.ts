import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { invitationData } from "../../lib/invitation.ts";
import { themeConfig } from "../../lib/theme.ts";

const dir = new URL("../../themes/", import.meta.url);
const slugs = readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);

test("6 tema MVP, semua theme.json valid dan slug = nama folder", () => {
  assert.equal(slugs.length, 6);
  for (const slug of slugs) {
    const t = themeConfig.parse(JSON.parse(readFileSync(new URL(`${slug}/theme.json`, dir), "utf8")));
    assert.equal(t.slug, slug);
    if (!t.photos) assert.ok(!t.sections.includes("galeri"), `${slug}: tema tanpa foto tidak boleh punya galeri`);
  }
});

const base = {
  pria: { nama: "A", panggilan: "A", ortu: "" },
  wanita: { nama: "B", panggilan: "B", ortu: "" },
  acara: [{ judul: "Akad", mulai: "2027-01-01T08:00:00+07:00", tempat: "X", alamat: "" }],
};

test("data minimal valid, default terisi", () => {
  const d = invitationData.parse(base);
  assert.equal(d.zona, "Asia/Jakarta");
  assert.deepEqual(d.galeri, []);
});

test("link selain http(s) ditolak (XSS)", () => {
  const evil = { ...base, acara: [{ ...base.acara[0], peta: "javascript:alert(1)" }] };
  assert.equal(invitationData.safeParse(evil).success, false);
  assert.equal(invitationData.safeParse({ ...base, galeri: ["data:text/html,x"] }).success, false);
});

test("handle instagram tidak bisa menyisipkan path", () => {
  const evil = { ...base, pria: { ...base.pria, instagram: "../evil" } };
  assert.equal(invitationData.safeParse(evil).success, false);
});
