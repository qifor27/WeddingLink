import { defineConfig, devices } from "@playwright/test";

// Butuh Supabase lokal (pnpm db:start) dan .env.local berisi kunci lokal.
process.loadEnvFile(".env.local");

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 180_000,
  use: { baseURL: "http://localhost:3123", trace: "retain-on-failure" },
  // PRD bagian 14: tampilan 375/768/1440 px. Alur lengkap cukup di HP (pengguna utama).
  projects: [
    { name: "hp", use: { ...devices["Pixel 7"], browserName: "chromium", viewport: { width: 375, height: 812 } } },
    { name: "tablet", testMatch: /landing/, use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } } },
    { name: "desktop", testMatch: /landing/, use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    // Jaringan lambat: batas happy-eyeballs bawaan Node (250 ms) membuat fetch ke Turnstile ETIMEDOUT.
    command: "export NODE_OPTIONS=--network-family-autoselection-attempt-timeout=3000; pnpm build && pnpm start -p 3123",
    url: "http://localhost:3123",
    reuseExistingServer: true,
    timeout: 240_000,
  },
});
