import { expect, test } from "@playwright/test";

// PRD bagian 7, 12, 14: landing, katalog, halaman tema, SEO; dijalankan di 375/768/1440 px.

test("landing: hero, galeri + filter, harga dari DB, tanpa meluap, tanpa pelanggaran CSP", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto("/");
  await expect(page).toHaveTitle(/Undangan Pernikahan Digital/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Pesan via WhatsApp" })).toHaveAttribute("href", /^https:\/\/wa\.me\/\d+\?text=/);

  // Harga dari tabel packages
  for (const price of ["Rp49.000", "Rp99.000", "Rp179.000"]) await expect(page.getByText(price, { exact: true })).toBeVisible();

  // Filter tema
  const gallery = page.locator("#tema");
  await gallery.getByRole("button", { name: "Tanpa foto" }).click();
  await expect(gallery.getByRole("link", { name: /Minang Pastel/ })).toBeVisible();
  await expect(gallery.getByRole("link", { name: /Red Beige/ })).toHaveCount(0);
  await gallery.getByRole("button", { name: "Semua" }).click();
  await expect(gallery.getByRole("link")).toHaveCount(6);

  // Semua gambar termuat & halaman tidak meluap ke samping
  for (const y of [1000, 2500, 4000, 6000, 9000]) await page.evaluate((v) => scrollTo(0, v), y);
  await expect.poll(() => page.evaluate(() => [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).length)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});

test("katalog -> halaman tema (JSON-LD) -> preview dengan nama sendiri", async ({ page }) => {
  await page.goto("/tema");
  await page.getByRole("link", { name: /Sunda–Minang/ }).click();
  await expect(page).toHaveURL(/\/tema\/sunda-minang$/);
  await expect(page).toHaveTitle("Undangan Digital Tema Sunda–Minang — WeddingLink");
  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
  expect(ld).toMatchObject({ "@type": "Product", offers: { priceCurrency: "IDR", lowPrice: 49000, highPrice: 179000 } });
  await page.getByLabel("Coba dengan nama Anda").fill("Sari & Bayu");
  await page.getByRole("button", { name: "Lihat preview" }).click();
  await expect(page).toHaveURL(/\/tema\/sunda-minang\/preview\?nama=/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Sari");
});

test("sitemap & robots: hanya halaman pemasaran yang diindeks", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/tema/minang-pastel</loc>");
  expect(sitemap.match(/<loc>/g)).toHaveLength(8);
  const robots = await (await request.get("/robots.txt")).text();
  for (const path of ["/dashboard", "/admin", "/api/"]) expect(robots).toContain(`Disallow: ${path}`);
  expect(robots).toContain("Sitemap:");
});
