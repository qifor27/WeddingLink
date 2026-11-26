import assert from "node:assert/strict";
import { test } from "node:test";
import { guestLink, parseGuests, safeNext, toCsv, waLink } from "../../lib/guests.ts";

test("impor tamu: baris kosong, header, dan duplikat dilewati; grup opsional", () => {
  const g = parseGuests('Nama,Grup\nBudi Santoso,Keluarga\n\n  Siti  \nbudi santoso\n"Andi";Kantor');
  assert.deepEqual(g, [
    { name: "Budi Santoso", group: "Keluarga" },
    { name: "Siti", group: null },
    { name: "Andi", group: "Kantor" },
  ]);
});

test("impor tamu: nama dipotong 60 karakter", () => {
  assert.equal(parseGuests("x".repeat(80))[0].name.length, 60);
});

test("link tamu meng-encode nama", () => {
  assert.equal(guestLink("https://w.id", "abc", "Pak & Bu <Ali>", "K1"), "https://w.id/abc?to=Pak+%26+Bu+%3CAli%3E&k=K1");
});

test("pesan WhatsApp berisi nama dan link", () => {
  const url = decodeURIComponent(waLink("Budi", "Rina & Dimas", "https://w.id/abc").split("text=")[1]);
  assert.match(url, /Kepada Yth\. Budi/);
  assert.match(url, /https:\/\/w\.id\/abc/);
});

test("CSV: formula dinetralkan, koma & kutip di-escape", () => {
  assert.equal(toCsv([["=HYPERLINK(1)", 'a,"b"', "-1", "ok"]]), `'=HYPERLINK(1),"a,""b""",'-1,ok`);
});

test("safeNext menolak redirect ke luar", () => {
  assert.equal(safeNext("/dashboard/1"), "/dashboard/1");
  for (const bad of ["https://evil.com", "//evil.com", "/\\evil.com", null]) assert.equal(safeNext(bad), "/dashboard");
});
