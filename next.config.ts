import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const isDev = process.env.NODE_ENV === "development";
const turnstile = "https://challenges.cloudflare.com";

// PRD bagian 11. Tanpa nonce: nonce memaksa render dinamis, padahal undangan & landing
// disajikan dari cache (PPR/ISR). 'unsafe-inline' dibutuhkan untuk skrip inline Next;
// teks tamu tetap aman karena React meng-escape semua masukan.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${turnstile}${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseUrl ?? ""}`,
  "font-src 'self'",
  "media-src 'self'",
  `connect-src 'self' ${supabaseUrl ?? ""} ${turnstile}${isDev ? " ws:" : ""}`,
  `frame-src ${turnstile}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(supabaseUrl?.startsWith("https://") ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  // Foto undangan dari bucket publik Supabase Storage.
  images: {
    remotePatterns: supabaseUrl ? [new URL(`${supabaseUrl}/storage/v1/object/public/**`)] : [],
  },
  poweredByHeader: false,
  headers: async () => [{ source: "/:path*", headers: securityHeaders }],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
