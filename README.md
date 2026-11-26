# WeddingLink

Platform undangan pernikahan digital berbasis website dengan tema adat Nusantara orisinal, RSVP bebas spam, dan fitur hari H (QR check-in, layar ucapan live, galeri tamu).

> Status: tahap pengembangan MVP. Detail produk ada di dokumen PRD WeddingLink.

## Fitur

**MVP**
- Katalog tema dengan filter adat, warna, dan foto/tanpa foto
- Preview tema dengan nama pemesan sebelum membayar
- Editor data undangan yang nyaman di HP (mempelai, acara, galeri, rekening, musik)
- Link personal per tamu: `https://weddinglink.id/{slug}?to=Nama+Tamu`
- RSVP dan ucapan dengan captcha tak terlihat, batas kiriman, dan moderasi
- Bagikan ke WhatsApp dengan template pesan per tamu
- Pembayaran manual: transfer bank / QRIS statis + unggah bukti, dikonfirmasi admin (tanpa payment gateway)
- Dashboard pasangan dan dashboard admin

**Fase berikutnya**
- Payment gateway otomatis (QRIS/VA dengan webhook)
- QR check-in dan pemindai PWA, Layar Ucapan Live, Galeri Tamu
- Mode Dua Adat (contoh: Sunda–Minang)
- Custom domain dan program reseller

## Teknologi

| Lapisan | Pilihan |
| --- | --- |
| Framework | Next.js (App Router) + TypeScript |
| UI | Tailwind CSS, animasi CSS/SVG, GSAP untuk animasi scroll |
| Database & Auth | Supabase (Postgres, Row Level Security, Auth OTP, Storage) |
| Anti-spam | Cloudflare Turnstile + rate limit |
| Pembayaran (MVP) | Manual: bukti transfer di Supabase Storage + konfirmasi admin. Payment gateway menyusul di Fase 2 |
| Hosting | Paket yang mengizinkan pemakaian komersial (mis. Vercel Pro) + CDN |

> Catatan: paket Hobby Vercel hanya untuk pemakaian pribadi non-komersial. Untuk produk berbayar, gunakan paket Pro atau hosting lain yang mengizinkan pemakaian komersial.

## Desain

- Warna utama pink dan emas, gaya sederhana: Rose `#B85C73`, Blush `#F6DFE3`, Gold `#C6A15B`, latar `#FFFAF8`, teks `#3E2B30`.
- Font: Bodoni Moda (judul) + Jost (isi).
- Landing page menampilkan banyak contoh produk di dalam mockup HP (hero 3 HP, galeri tema, video demo, fitur, testimoni). Isi mockup adalah tangkapan layar asli tema WeddingLink.
- Bingkai HP satu komponen reusable: `components/marketing/PhoneMockup.tsx`.

## Struktur proyek

```
weddinglink/
├── app/
│   ├── (marketing)/          # landing, katalog tema, halaman SEO per adat/kota
│   ├── tema/[slug]/          # halaman detail + preview tema
│   ├── [slug]/               # halaman undangan publik (noindex)
│   ├── dashboard/            # dashboard pasangan
│   ├── admin/                # dashboard admin
│   └── api/
│       ├── rsvp/             # kirim RSVP & ucapan (captcha + rate limit)
│       ├── checkin/          # pemindaian QR (Fase 2)
│       └── orders/           # unggah bukti transfer + konfirmasi admin
├── components/
│   ├── sections/             # Cover, Mempelai, Acara, Countdown, Galeri, RSVP, Amplop, Penutup
│   └── ornaments/            # SVG ornamen dan animasi bersama
├── themes/
│   ├── blue-butterfly/theme.json
│   ├── red-beige/theme.json
│   ├── minang-pastel/theme.json
│   ├── sunda-minang/theme.json
│   └── gold-blush/theme.json
├── lib/                      # supabase client, validasi (zod), escape, utilitas
├── supabase/migrations/      # skema database + kebijakan RLS
└── tests/                    # Playwright (alur pesan, RSVP, tampilan HP)
```

## Mesin tema

Satu data undangan bisa ditampilkan dengan tema apa pun. Setiap tema hanya berisi konfigurasi tampilan:

```json
{
  "slug": "minang-pastel",
  "name": "Minang Pastel",
  "category": ["adat", "minang", "pastel", "tanpa-foto"],
  "photos": false,
  "palette": { "bg": "#fbf4e6", "surface": "#fffaf0", "ink": "#4f4a8a", "accent": "#d98593", "muted": "#6f6890" },
  "fonts": { "script": "great-vibes", "display": "italiana", "body": "lora" },
  "ornaments": { "cover": ["marawa", "rumah-gadang"], "divider": "songket-band" },
  "sections": ["cover", "quote", "mempelai", "countdown", "acara", "maps", "story", "rsvp", "wishes", "gift", "penutup"]
}
```

Skema: `lib/theme.ts` (tema) dan `lib/invitation.ts` (data undangan). Daftarkan tema baru di `themes/index.ts`, catat asetnya di `themes/<slug>/ASSETS.md`, lalu cek tampilannya di `/tema/<slug>/preview?nama=Rina%20%26%20Dimas`.

## Mulai mengembangkan

Prasyarat: Node.js versi LTS terbaru, pnpm, akun Supabase, Docker atau Podman (untuk Supabase lokal).

```bash
git clone https://github.com/<akun-kamu>/weddinglink.git
cd weddinglink
pnpm install
pnpm db:start                # Supabase lokal (Docker/Podman)
cp .env.example .env.local   # isi variabel di bawah, nilai lokal dari `pnpm exec supabase status`
pnpm dev                     # buka http://localhost:3000
```

### Variabel lingkungan

| Variabel | Keterangan |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL proyek Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key Supabase (aman di klien karena dibatasi RLS) |
| `SUPABASE_SECRET_KEY` | Secret key (pengganti `service_role`). Hanya di server, jangan pernah dikirim ke klien |
| `TURNSTILE_SECRET_KEY` | Verifikasi captcha di API RSVP |
| `NEXT_PUBLIC_SITE_URL` | Domain utama, dipakai untuk sitemap dan Open Graph |

Jangan commit `.env.local` ke repository.

### Skrip

| Perintah | Fungsi |
| --- | --- |
| `pnpm dev` | Server pengembangan |
| `pnpm build && pnpm start` | Build dan jalankan versi produksi |
| `pnpm lint` | ESLint |
| `pnpm test:e2e` | Tes Playwright di ukuran HP dan desktop (minggu 6) |
| `pnpm db:start` | Jalankan Supabase lokal |
| `pnpm db:reset` | Bangun ulang DB lokal dari `supabase/migrations/` |
| `pnpm db:test` | Tes RLS (pgTAP) di `supabase/tests/` |
| `pnpm db:migrate` | Dorong migrasi ke proyek Supabase hosted (CLI meminta konfirmasi) |

## Keamanan

- Row Level Security aktif di semua tabel; pasangan hanya bisa membaca dan mengubah undangannya sendiri.
- API RSVP memakai captcha, rate limit per IP dan per kode tamu, serta filter kata kasar.
- Semua masukan tamu (nama dari URL, ucapan) di-escape dan dibatasi panjangnya.
- Unggahan foto diperiksa tipe dan ukurannya, di-encode ulang, dan disimpan dengan nama acak.
- Halaman undangan memakai `noindex`, slug acak, dan PIN opsional.
- Header keamanan: CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors`.
- Data pribadi dikelola sesuai UU Pelindungan Data Pribadi; data dihapus setelah masa aktif dan masa tenggang.

Temukan celah keamanan? Laporkan secara pribadi ke email tim, jangan lewat issue publik.

## SEO

- Halaman landing, katalog, dan detail tema dirender di server dengan judul berkata kunci.
- Halaman lokal per adat dan per kota (contoh: "undangan digital Padang").
- Sitemap hanya berisi halaman publik WeddingLink; undangan pelanggan tidak diindeks.
- Gambar Open Graph per undangan untuk pratinjau WhatsApp.
- Target Core Web Vitals di HP: LCP < 2,5 detik, CLS < 0,1.

## Aset dan lisensi

Semua ornamen tema adalah karya orisinal (SVG buatan sendiri, ilustrasi berlisensi komersial, atau gambar AI yang boleh dipakai komersial). Elemen Canva Pro tidak boleh diekspor satu per satu untuk dipakai ulang sebagai tema. Catat sumber setiap aset di `themes/<slug>/ASSETS.md`.

## Roadmap

1. **Fase 1 – MVP:** mesin tema, 6 tema, editor, link tamu, RSVP anti-spam, pembayaran manual.
2. **Fase 2 – Hari H:** payment gateway otomatis, QR check-in, Layar Ucapan Live, Galeri Tamu, Mode Dua Adat.
3. **Fase 3 – Skala:** custom domain, asisten kata pengantar, program reseller, blog SEO lokal.

## Skill AI untuk pengembangan

Daftar skill GitHub yang dipakai saat membangun proyek ini ada di [SKILLS.md](./SKILLS.md).
