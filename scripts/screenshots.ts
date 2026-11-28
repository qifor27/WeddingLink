// Tangkapan layar asli tema WeddingLink untuk landing (PRD bagian 7: bukan foto stok).
// Butuh Supabase lokal + server produksi (tanpa indikator dev):
//   pnpm build && pnpm start -p 3123   lalu   node scripts/screenshots.ts http://localhost:3123
// Hasil: public/screens/<tema>.webp (sampul), fitur-<section>.webp, demo.webm (+ demo.webp poster).
// Fitur & video diambil dari undangan demo terbit sementara (RSVP aktif), lalu datanya dihapus.
import { mkdir, readdir, rename, rm } from "node:fs/promises";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { sampleData } from "../themes/sample.ts";

process.loadEnvFile(".env.local");
const base = process.argv[2] ?? "http://localhost:3123";
const out = "public/screens";
const viewport = { width: 390, height: 844 };
const themes = ["blue-butterfly", "red-beige", "minang-pastel", "sunda-minang", "gold-blush", "sage-botanical"];
const FEATURE_THEME = "gold-blush";
// [nama file, id halaman]: acara berisi satu halaman per acara, ambil yang pertama.
const FEATURES = [["cover", "cover"], ["acara", "acara-1"], ["rsvp", "rsvp"], ["wishes", "wishes"], ["gift", "gift"]];
const hideWatermark = "[aria-hidden='true'].fixed{display:none!important} *{animation:none!important;transition:none!important}";

const webp = (png: Buffer, file: string) => sharp(png).resize({ width: 540 }).webp({ quality: 72 }).toFile(`${out}/${file}.webp`);

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });

for (const slug of themes) {
  await page.goto(`${base}/tema/${slug}/preview`, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: hideWatermark });
  await webp(await page.screenshot(), slug);
}

// Undangan demo terbit (pemilik = user sementara) + beberapa ucapan.
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
const { data: user, error: userErr } = await db.auth.admin.createUser({ email: `demo-${Date.now()}@example.com`, email_confirm: true });
if (userErr) throw userErr;
let inv: { id: string; slug: string } | undefined;

// Semua langkah setelah user dibuat ada di dalam try, supaya data demo selalu dihapus walau gagal.
try {
const { data: theme, error: themeErr } = await db.from("themes").select("id").eq("slug", FEATURE_THEME).single();
if (themeErr) throw themeErr;
const { data: created, error: invErr } = await db.from("invitations").insert({
  owner_id: user.user.id, theme_id: theme.id, data: sampleData, status: "published", expires_at: new Date(Date.now() + 86_400_000).toISOString(),
}).select("id, slug").single();
if (invErr) throw invErr;
inv = created;
const { error: wishErr } = await db.from("wishes").insert([
  { invitation_id: inv.id, name: "Bapak Ahmad", attendance: "hadir", pax: 2, message: "Selamat menempuh hidup baru, semoga sakinah mawaddah warahmah." },
  { invitation_id: inv.id, name: "Ibu Sari", attendance: "hadir", pax: 1, message: "Bahagia selalu untuk Rina & Dimas!" },
  { invitation_id: inv.id, name: "Andi", attendance: "ragu", pax: 1, message: "Barakallah, semoga lancar sampai hari H." },
]);
if (wishErr) throw wishErr;
const demoUrl = `${base}/${inv.slug}`;

// Turnstile membuat jaringan tidak pernah idle: tunggu load + RSVP ter-hydrate.
const openDemo = async (p: typeof page) => {
  await p.goto(`${demoUrl}?to=${encodeURIComponent("Bapak Ahmad")}`, { waitUntil: "load" });
  await p.getByRole("button", { name: "Kirim" }).waitFor();
  await p.waitForTimeout(1000);
};
await openDemo(page);
await page.addStyleTag({ content: hideWatermark });
for (const [name, id] of FEATURES) {
  const el = page.locator(`#${id}`);
  await el.scrollIntoViewIfNeeded();
  await webp(await el.screenshot(), `fitur-${name}`);
}

// Rekaman layar ≤ 10 dtk: gulir pelan dari sampul ke RSVP.
const vctx = await browser.newContext({ viewport, recordVideo: { dir: `${out}/tmp`, size: viewport } });
const vpage = await vctx.newPage();
await openDemo(vpage);
await vpage.addStyleTag({ content: hideWatermark });
await webp(await vpage.screenshot(), "demo");
await vpage.waitForTimeout(800);
const end = await vpage.evaluate(() => document.querySelector("[data-section='wishes']")!.getBoundingClientRect().top + scrollY);
for (let y = 0; y <= end; y += end / 160) {
  await vpage.evaluate((v) => scrollTo(0, v), y);
  await vpage.waitForTimeout(45);
}
await vpage.waitForTimeout(600);
await vctx.close();
const [video] = await readdir(`${out}/tmp`);
await rename(`${out}/tmp/${video}`, `${out}/demo.webm`);
await rm(`${out}/tmp`, { recursive: true });

} finally {
await browser.close();
if (inv) {
  await db.from("wishes").delete().eq("invitation_id", inv.id);
  await db.from("invitations").delete().eq("id", inv.id);
}
await db.auth.admin.deleteUser(user.user.id);
}
console.log("Selesai:", (await readdir(out)).join(", "));
