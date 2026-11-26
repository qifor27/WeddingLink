import { createHmac } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import sharp from "sharp";

// Alur MVP terhadap Supabase lokal (PRD bagian 14): login OTP -> buat & edit undangan -> impor tamu
// -> bayar manual (ditolak, bayar ulang) -> admin 2FA konfirmasi -> terbit -> tamu RSVP -> moderasi -> kedaluwarsa.

const MAILPIT = "http://127.0.0.1:54324";
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);

async function otp(email: string) {
  for (let i = 0; i < 20; i++) {
    const res = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`).then((r) => r.json());
    const id = res.messages?.[0]?.ID;
    if (id) {
      const msg = await fetch(`${MAILPIT}/api/v1/message/${id}`).then((r) => r.json());
      const code = msg.Text.match(/\b(\d{6})\b/)?.[1];
      if (code) return code;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`OTP untuk ${email} tidak ditemukan di mailpit`);
}

async function login(page: Page, email: string, path = "/dashboard") {
  await page.goto(path);
  await expect(page).toHaveURL(`/masuk?next=${encodeURIComponent(path)}`);
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Kirim kode" }).click();
  await page.getByLabel("Kode 6 digit").fill(await otp(email));
  await page.getByRole("button", { name: "Masuk" }).click();
}

// RFC 6238 (SHA-1, 30 dtk, 6 digit) seperti aplikasi autentikator.
function totp(base32: string) {
  const bits = [...base32.replace(/=+$/, "")].map((c) => "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".indexOf(c).toString(2).padStart(5, "0")).join("");
  const key = Buffer.from(bits.match(/.{8}/g)!.map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30_000)));
  const h = createHmac("sha1", key).update(counter).digest();
  const o = h[19] & 0xf;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000).padStart(6, "0");
}

async function uploadProof(page: Page, file: { name: string; mimeType: string; buffer: Buffer }) {
  await page.getByLabel(/bukti transfer/).setInputFiles(file);
  await page.getByRole("button", { name: "Kirim bukti" }).click();
}

async function rsvp(page: Page, message: string) {
  await page.getByRole("radio", { name: "Hadir", exact: true }).check({ force: true });
  await page.getByLabel("Jumlah orang").selectOption("2");
  await page.getByLabel("Ucapan & doa (opsional)").fill(message);
  // Kunci tes Turnstile invisible lolos otomatis; tunggu tokennya terisi.
  await expect(page.locator('input[name="cf-turnstile-response"]')).not.toHaveValue("", { timeout: 20_000 });
  await page.getByRole("button", { name: "Kirim" }).click();
  await expect(page.getByText("Terima kasih!")).toBeVisible();
}

test("pasangan membuat undangan, bayar, admin konfirmasi, tamu RSVP, moderasi, kedaluwarsa", async ({ page, browser }) => {
  const run = Date.now();
  await login(page, `pasangan-${run}@example.com`);
  await expect(page).toHaveURL(/\/dashboard$/);

  // Buat undangan dari tema
  await page.getByRole("button", { name: /Minang Pastel/ }).click();
  await expect(page).toHaveURL(/\/dashboard\/[0-9a-f-]{36}$/);
  const id = page.url().split("/").pop()!;

  // Editor: input tidak valid tidak disimpan, input valid tersimpan otomatis
  const status = page.getByRole("status");
  await page.getByLabel("Instagram (tanpa @, opsional)").first().fill("bukan handle!");
  await expect(status).toContainText("Belum tersimpan");
  await page.getByLabel("Instagram (tanpa @, opsional)").first().fill("");
  const saved = page.waitForResponse((r) => r.request().method() === "POST" && r.url().includes(id));
  await page.getByLabel("Nama panggilan").first().fill("Ayu");
  await saved;
  await expect(status).toHaveText("Tersimpan");
  await page.reload();
  await expect(page.getByLabel("Nama panggilan").first()).toHaveValue("Ayu");

  // Impor tamu (duplikat & header dilewati)
  await page.goto(`/dashboard/${id}/tamu`);
  await page.getByRole("textbox").fill("Nama,Grup\nBapak Ahmad,Keluarga\nIbu Sari\nbapak ahmad");
  await page.getByRole("button", { name: "Impor" }).click();
  await expect(page.getByText("2 tamu ditambahkan.")).toBeVisible();
  await expect(page.getByText("Daftar tamu (2)")).toBeVisible();
  const wa = await page.getByRole("link", { name: "Kirim WhatsApp" }).first().getAttribute("href");
  expect(decodeURIComponent(wa!)).toContain("Kepada Yth. Bapak Ahmad");

  // Belum terbit: link tamu tidak menampilkan apa pun (status tetap 200 karena shell ISR sudah di-stream)
  const { data: inv } = await admin.from("invitations").select("slug").eq("id", id).single();
  const { data: guest } = await admin.from("guests").select("code").eq("invitation_id", id).eq("name", "Bapak Ahmad").single();
  const guestUrl = `/${inv!.slug}?to=${encodeURIComponent("Bapak Ahmad")}&k=${guest!.code}`;
  const draft = await (await page.request.get(guestUrl)).text();
  expect(draft).toContain("Halaman tidak ditemukan");
  expect(draft).not.toContain("Ayu");

  // Bayar manual: pilih paket -> nominal unik -> unggah bukti (tipe asli dicek)
  await page.goto(`/dashboard/${id}`);
  await expect(page.getByRole("button", { name: "Terbitkan" })).toHaveCount(0);
  await page.getByRole("link", { name: "Bayar untuk menerbitkan" }).click();
  await page.getByRole("button", { name: /Populer/ }).click();
  await expect(page.getByText(/^Rp99\.\d{3}$/)).toBeVisible();
  await expect(page.getByText("1234567890")).toBeVisible();
  await uploadProof(page, { name: "bukti.jpg", mimeType: "image/jpeg", buffer: Buffer.from("<svg onload=alert(1)>") });
  await expect(page.getByText("Format harus JPG, PNG, atau PDF")).toBeVisible();
  const png = await sharp({ create: { width: 40, height: 40, channels: 3, background: "#b85c73" } }).png().toBuffer();
  await uploadProof(page, { name: "bukti.png", mimeType: "image/png", buffer: png });
  await expect(page.getByText("Menunggu konfirmasi admin")).toBeVisible();

  // Admin: role diberi lewat database, wajib daftar & verifikasi TOTP sebelum melihat pesanan
  const adminPage = await (await browser.newContext()).newPage();
  const adminEmail = `admin-${run}@example.com`;
  await login(adminPage, adminEmail, "/admin");
  await expect(adminPage.getByText("Halaman tidak ditemukan")).toBeVisible(); // belum admin
  const { data: adminUser } = await admin.from("users").select("id").eq("email", adminEmail).single();
  await admin.from("users").update({ role: "admin" }).eq("id", adminUser!.id);
  await adminPage.goto("/admin");
  await expect(adminPage).toHaveURL(/\/admin\/2fa$/);
  await adminPage.getByRole("button", { name: "Siapkan aplikasi autentikator" }).click();
  const secret = (await adminPage.getByTestId("totp-secret").textContent())!.trim();
  await adminPage.getByLabel("Kode autentikator").fill(totp(secret));
  await adminPage.getByRole("button", { name: "Verifikasi" }).click();
  await expect(adminPage).toHaveURL(/\/admin$/);

  const { data: order1 } = await admin.from("orders").select("id, amount").eq("invitation_id", id).single();
  const row = () => adminPage.locator("li", { hasText: `Rp${order1!.amount.toLocaleString("id-ID")}` });
  const proof = await adminPage.request.get((await row().getByRole("link", { name: "Lihat bukti transfer" }).getAttribute("href"))!);
  expect(proof.headers()["content-type"]).toBe("image/png");
  await row().getByRole("button", { name: "Tolak" }).click();
  await expect(adminPage.getByText("Isi alasan penolakan")).toBeVisible();
  await row().getByLabel("Alasan penolakan").fill("Nominal tidak cocok");
  await row().getByRole("button", { name: "Tolak" }).click();
  await expect(row()).toContainText("ditolak: Nominal tidak cocok");

  // Pasangan melihat alasan, memesan ulang, admin konfirmasi
  await page.reload();
  await expect(page.getByText("Nominal tidak cocok")).toBeVisible();
  await page.getByRole("button", { name: /Populer/ }).click();
  await uploadProof(page, { name: "bukti2.png", mimeType: "image/png", buffer: png });
  await expect(page.getByText("Menunggu konfirmasi admin")).toBeVisible();
  await adminPage.reload();
  const { data: order2 } = await admin.from("orders").select("id, amount").eq("invitation_id", id).eq("status", "waiting_confirmation").single();
  const row2 = adminPage.locator("li", { hasText: `Rp${order2!.amount.toLocaleString("id-ID")}`, hasNotText: "ditolak" });
  await row2.getByRole("button", { name: "Konfirmasi" }).click();
  await expect(row2).toContainText("Lunas");
  const { data: audit } = await admin.from("audit_logs").select("actor_id, to_status").in("order_id", [order1!.id, order2!.id]).order("id");
  expect(audit!.map((a) => a.to_status)).toEqual(["pending", "waiting_confirmation", "rejected", "pending", "waiting_confirmation", "paid"]);
  expect(audit!.filter((a) => a.to_status === "paid" || a.to_status === "rejected").every((a) => a.actor_id === adminUser!.id)).toBe(true);

  // Terbit setelah lunas
  await page.goto(`/dashboard/${id}`);
  await page.getByRole("button", { name: "Terbitkan" }).click();
  await expect(page.getByText(/^Terbit:/)).toBeVisible();
  const { data: pub } = await admin.from("invitations").select("status, expires_at").eq("id", id).single();
  expect(pub!.status).toBe("published");
  expect(new Date(pub!.expires_at).getTime()).toBeGreaterThan(Date.now() + 179 * 86_400_000); // paket Populer 6 bulan

  // Tamu: tanpa akun, nama dari link, RSVP
  const tamu = await (await browser.newContext()).newPage();
  await tamu.goto(guestUrl);
  await expect(tamu.getByRole("heading", { level: 1 })).toContainText("Ayu");
  await expect(tamu.getByText("Bapak Ahmad").first()).toBeVisible();
  await expect(tamu.getByLabel("Nama")).toHaveValue("Bapak Ahmad");
  await rsvp(tamu, "Selamat menempuh hidup baru");

  // Ucapan kasar otomatis disembunyikan
  const iseng = await (await browser.newContext()).newPage();
  await iseng.goto(`/${inv!.slug}`);
  await iseng.getByLabel("Nama").fill("Iseng");
  await rsvp(iseng, "dasar anjing");

  // XSS lewat ?to= tampil sebagai teks
  let dialog = false;
  iseng.on("dialog", () => (dialog = true));
  await iseng.goto(`/${inv!.slug}?to=${encodeURIComponent('<img src=x onerror=alert(1)>')}`);
  await expect(iseng.getByText("<img src=x onerror=alert(1)>").first()).toBeVisible();
  expect(dialog).toBe(false);

  // Ucapan tampil untuk tamu lain; yang kasar tidak
  await iseng.goto(`/${inv!.slug}`);
  await expect(iseng.getByText("Selamat menempuh hidup baru")).toBeVisible();
  await expect(iseng.getByText("dasar anjing")).toHaveCount(0);

  // Pasangan: status hadir, moderasi, ekspor
  await page.goto(`/dashboard/${id}/tamu`);
  await expect(page.getByText("Hadir · 2 org")).toBeVisible();
  await expect(page.getByText("dasar anjing")).toBeVisible(); // tersimpan untuk moderasi
  const csv = await (await page.request.get(`/api/invitations/${id}/export`)).text();
  expect(csv).toContain("Bapak Ahmad,Keluarga");
  expect(csv).toContain("hadir,2,Selamat menempuh hidup baru");
  await page.locator("li", { hasText: "Selamat menempuh hidup baru" }).getByRole("button", { name: "Sembunyikan" }).click();
  await expect(page.locator("li", { hasText: "Selamat menempuh hidup baru" })).toContainText("disembunyikan");
  await iseng.goto(`/${inv!.slug}`);
  await expect(iseng.getByText("Selamat menempuh hidup baru")).toHaveCount(0);

  // Pasangan lain tidak bisa membuka undangan ini
  const lain = await (await browser.newContext()).newPage();
  await login(lain, `lain-${run}@example.com`);
  await expect(lain).toHaveURL(/\/dashboard$/);
  await lain.goto(`/dashboard/${id}`);
  await expect(lain.getByText("Halaman tidak ditemukan")).toBeVisible();
  await expect(lain.getByText("Ayu")).toHaveCount(0);
  expect((await lain.request.get(`/api/invitations/${id}/export`)).status()).toBe(404);
  const { data: lainOrder } = await admin.from("orders").select("id").eq("invitation_id", id).eq("status", "paid").single();
  const steal = await lain.request.post(`/api/orders/${lainOrder!.id}/proof`, { multipart: { file: { name: "x.png", mimeType: "image/png", buffer: png } } });
  expect(steal.status()).toBe(404);

  // Masa aktif habis: cron menandai expired & membuang cache, link tamu berhenti tampil
  expect((await page.request.get("/api/cron/expire")).status()).toBe(401);
  await admin.from("invitations").update({ expires_at: new Date(Date.now() - 60_000).toISOString() }).eq("id", id);
  const cron = await page.request.get("/api/cron/expire", { headers: { authorization: `Bearer ${process.env.CRON_SECRET}` } });
  expect((await cron.json()).expired).toBeGreaterThanOrEqual(1);
  await iseng.goto(`/${inv!.slug}`);
  await expect(iseng.getByText("Halaman tidak ditemukan")).toBeVisible();
  await page.goto(`/dashboard/${id}`);
  await expect(page.getByText("Masa aktif undangan sudah habis.")).toBeVisible();
});
