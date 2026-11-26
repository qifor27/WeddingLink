import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";

// Alur MVP minggu 3–4 terhadap Supabase lokal: login OTP -> buat & edit undangan -> impor tamu
// -> (terbit, disimulasikan; pembayaran = minggu 5) -> tamu membuka link & RSVP -> pasangan memoderasi.

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

async function login(page: Page, email: string) {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/masuk\?next=%2Fdashboard/);
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Kirim kode" }).click();
  await page.getByLabel("Kode 6 digit").fill(await otp(email));
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
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

test("pasangan membuat undangan & tamu, tamu RSVP, pasangan memoderasi", async ({ page, browser }) => {
  const run = Date.now();
  await login(page, `pasangan-${run}@example.com`);

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

  // Terbit tanpa bayar ditolak; setelah order paid (minggu 5: dikonfirmasi admin) berhasil
  await page.goto(`/dashboard/${id}`);
  await page.getByRole("button", { name: "Terbitkan" }).click();
  await expect(page.getByText("Pembayaran belum dikonfirmasi admin")).toBeVisible();
  const { data: pkg } = await admin.from("packages").select("id").eq("code", "populer").single();
  const { data: owner } = await admin.from("invitations").select("owner_id").eq("id", id).single();
  await admin.from("orders").insert({
    user_id: owner!.owner_id, invitation_id: id, package_id: pkg!.id,
    amount: 99_000 + (run % 999) + 1, unique_code: (run % 999) + 1, status: "paid",
  });
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
  await lain.goto(`/dashboard/${id}`);
  await expect(lain.getByText("Halaman tidak ditemukan")).toBeVisible();
  await expect(lain.getByText("Ayu")).toHaveCount(0);
  expect((await lain.request.get(`/api/invitations/${id}/export`)).status()).toBe(404);
});
