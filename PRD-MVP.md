# PRD WeddingLink — MVP

> Dokumen ini adalah sumber kebenaran untuk membangun **MVP WeddingLink** dengan Claude Code.
> Hanya mencakup MVP. Fitur di luar MVP tercantum di bagian "Di luar lingkup" dan **tidak boleh dibangun** sekarang.

## 1. Ringkasan

WeddingLink adalah platform undangan pernikahan digital berbasis website. Pasangan memilih tema, mengisi data lewat HP, membayar secara manual, lalu membagikan link personal ke setiap tamu. Tamu membuka undangan, melihat info acara, dan mengisi RSVP serta ucapan.

**Pembeda MVP**
- Undangan custom, bukan hanya tradisional: gaya adat (Minang, Sunda–Minang), modern, atau minimalis, berisi cerita pasangan sendiri; isi sendiri atau dibuatkan admin. Tema orisinal, ornamen SVG buatan sendiri.
- RSVP dan ucapan bebas spam (captcha, rate limit, moderasi).
- Undangan cepat dibuka di HP (halaman di-cache, gambar dikompres).

**Target MVP**
- 6 tema siap jual.
- 10 pesanan terbayar berjalan tanpa bantuan developer.
- Waktu dari konfirmasi bayar sampai undangan aktif < 24 jam.
- Nol kebocoran data tamu.

## 2. Pengguna

| Persona | Kebutuhan utama |
| --- | --- |
| Pasangan pemesan (23–32 th, memesan lewat HP) | Cepat jadi, sesuai adat, mudah dibagikan ke WhatsApp |
| Tamu undangan (segala usia, HP spesifikasi rendah) | Info acara jelas, peta, konfirmasi hadir tanpa akun |
| Admin WeddingLink | Konfirmasi pembayaran, memantau pesanan, masa aktif otomatis |

## 3. User stories MVP

**Pasangan**
- [ ] Melihat preview tema dengan nama kami sebelum membayar.
- [ ] Mengisi data undangan sendiri lewat HP (simpan otomatis).
- [ ] Mengunggah bukti transfer dan melihat status pesanan.
- [ ] Mengimpor daftar tamu (tempel teks/CSV) dan mendapat link per tamu.
- [ ] Membagikan undangan ke WhatsApp dengan pesan yang sudah terisi.
- [ ] Melihat daftar hadir, menyembunyikan ucapan tidak pantas, ekspor CSV.

**Tamu**
- [ ] Undangan terbuka cepat di HP walau sinyal lemah.
- [ ] Konfirmasi hadir + ucapan tanpa membuat akun.

**Admin**
- [ ] Melihat semua pesanan beserta status di satu dashboard.
- [ ] Mengonfirmasi atau menolak bukti transfer.
- [ ] Undangan otomatis nonaktif saat masa aktif habis.

## 4. Lingkup fitur MVP

| # | Fitur | Prioritas | Kriteria selesai |
| --- | --- | --- | --- |
| F1 | Landing page putih-emas + katalog tema dengan filter (adat, warna, foto/tanpa foto) | P0 | Katalog bisa difilter; setiap tema punya halaman sendiri yang diindeks |
| F2 | Preview tema dengan data contoh / nama pemesan | P0 | `/tema/[slug]/preview?nama=...` menampilkan tema dengan data contoh |
| F3 | Mesin tema: `invitation.data` (JSON) + `theme.json` (+ skin opsional) → halaman undangan | P0 | Ganti tema tidak perlu isi ulang data; tema baru = `theme.json` (+ `skin.ts`/`skin.css` untuk ornamen & tata letak khusus) |
| F4 | Editor data undangan (mempelai, acara, galeri, rekening/QRIS pasangan, musik) | P0 | Nyaman di layar 360 px; simpan otomatis; validasi zod |
| F5 | Link per tamu `/{slug}?to=Nama` + impor daftar tamu | P0 | Nama di-escape, maks. 60 karakter; link unik per tamu |
| F6 | RSVP + ucapan anti-spam | P0 | Captcha Turnstile, rate limit, filter kata kasar, pasangan bisa sembunyikan |
| F7 | Bagikan ke WhatsApp | P0 | Tombol per tamu membuka `wa.me` dengan pesan + link terisi |
| F8 | **Pembayaran manual** | P0 | Lihat bagian 5 |
| F9 | Dashboard pasangan | P1 | Daftar tamu, status hadir, moderasi ucapan, ekspor CSV |
| F10 | Dashboard admin | P1 | Daftar pesanan, konfirmasi bayar, masa aktif |
| F11 | Gambar pratinjau WhatsApp (Open Graph) per undangan | P1 | Dibuat saat undangan terbit |

### Di luar lingkup MVP (jangan dibangun)
Payment gateway otomatis, QR check-in, Layar Ucapan Live, Galeri Tamu, Mode Dua Adat, asisten kata pengantar, Sapa Suara, multibahasa, custom domain, program reseller, menampung dana amplop digital, undangan cetak, aplikasi native.

## 5. Pembayaran manual (tanpa payment gateway)

1. Pasangan memilih paket di dashboard → sistem membuat `order` berstatus `pending`.
2. Halaman pembayaran menampilkan nomor rekening WeddingLink dan gambar QRIS statis + nominal unik (mis. Rp99.137) agar mudah dicocokkan.
3. Pasangan mengunggah bukti transfer (JPG/PNG/PDF, maks. 5 MB) → status `waiting_confirmation`.
4. Admin memeriksa mutasi rekening, lalu klik **Konfirmasi** (→ `paid`) atau **Tolak** + alasan (→ `rejected`).
5. Saat `paid`: undangan boleh diterbitkan, `expires_at` dihitung dari paket, watermark "Preview" hilang.
6. Sebelum `paid`: undangan tetap bisa dilihat pasangan tetapi berwatermark "Preview" dan RSVP nonaktif.

Notifikasi ke admin cukup lewat dashboard + email sederhana. WhatsApp manual.

## 6. Paket (usulan)

| Paket | Harga | Isi | Masa aktif |
| --- | --- | --- | --- |
| Hemat | Rp49.000 | Edit sendiri, tema tanpa foto, RSVP + ucapan | 3 bulan |
| Populer | Rp99.000 | Dibuatkan admin, foto & galeri, link per tamu, 2× revisi | 6 bulan |
| Istimewa | Rp179.000 | Semua fitur Populer + revisi wajar + prioritas | 12 bulan |

Harga disimpan di database/konfigurasi, bukan di-hardcode.

## 7. Desain

- **Warna (putih + sentuhan emas):** latar putih `#FFFFFF`, Cream `#F8F4EC` (section selang-seling, kotak info), Gold `#C6A15B` (garis, bingkai, aksen; bukan teks kecil), Gold Deep `#8C6A2C` (teks emas, kontras ≥ 4.5:1), teks/tombol utama `#3E2B30`. Berlaku untuk landing, katalog, dashboard, admin, dan halaman masuk.
- **Font:** Bodoni Moda (judul), Jost (isi). Gaya sederhana: ruang kosong lega, garis tipis emas, label kecil huruf kapital berjarak di atas judul, tanpa gradien mencolok.
- **Navbar:** menu kiri (Tema, Fitur, Cara kerja), logo di tengah, menu kanan (Harga, FAQ, Masuk). Di HP: logo di atas, menu satu baris di bawahnya.
- **Tanpa mockup HP.** Tangkapan layar ditampilkan dalam bingkai lengkung (arch) bergaris emas atau kotak bersudut membulat.
- **Landing page (urutan section):**
  1. Hero — panel cream, label "Undangan pernikahan digital custom", judul besar, tombol "Lihat Tema" & "Pesan via WhatsApp", 3 bingkai lengkung berisi cover tema berbeda.
  2. Fitur unggulan — daftar bernomor 01–05; fitur yang dipilih terbuka dan tangkapan layarnya tampil di bingkai lengkung.
  3. Galeri tema — kolase tangkapan layar tema + filter; ketuk untuk halaman tema & preview.
  4. Cara kerja — judul besar, 3 langkah bernomor, rekaman layar ≤ 10 detik (autoplay saat terlihat, tanpa suara).
  5. Sebelum vs sesudah — undangan cetak vs WeddingLink.
  6. Paket harga — 3 kartu, paket tengah ditandai emas.
  7. Testimoni/portofolio — tangkapan layar undangan nyata (dengan izin).
  8. FAQ + tombol WhatsApp menempel.
- **Komponen:** `Arch` (bingkai lengkung) reusable; isi = tangkapan layar asli tema WeddingLink (WebP/AVIF), bukan foto stok.
- **Tema undangan MVP:** Blue Butterfly, Red Beige, Minang Pastel, Sunda–Minang, Gold Blush Modern (sudah ada demo HTML) + Sage Botanical (baru).

## 8. Arsitektur teknis

- **Next.js (App Router) + TypeScript + Tailwind**, deploy di hosting yang mengizinkan pemakaian komersial (mis. Vercel Pro) + CDN.
- **Supabase:** Postgres + RLS, Auth (OTP/magic link; admin 2FA), Storage (foto, bukti transfer — bucket privat dengan signed URL).
- **Cloudflare Turnstile** untuk captcha.
- Halaman undangan dirender sekali saat terbit lalu di-cache; nama tamu (`?to=`) ditempel di sisi klien agar semua tamu berbagi satu cache.

### Struktur folder

```
app/
  (marketing)/page.tsx           # landing
  tema/page.tsx                  # katalog
  tema/[slug]/page.tsx           # detail + preview
  [slug]/page.tsx                # undangan publik (noindex)
  dashboard/...                  # pasangan: editor, tamu, pesanan
  admin/...                      # admin: pesanan, konfirmasi
  api/rsvp/route.ts
  api/orders/[id]/proof/route.ts # unggah bukti
  api/admin/orders/[id]/route.ts # konfirmasi/tolak
components/
  sections/   # Cover, Quote, Mempelai, Countdown, Acara, Maps, Galeri, Story, Rsvp, Wishes, Gift, Penutup
  ornaments/  # SVG ornamen
  marketing/Arch.tsx
themes/<slug>/theme.json   # + skin.ts, skin.css, defs.ts (ornamen SVG & CSS tema)
lib/        # supabase, zod schemas, escape, rate-limit
supabase/migrations/
tests/      # Playwright
```

## 9. Model data

| Tabel | Kolom utama |
| --- | --- |
| `users` | id, phone/email, role (`couple`/`admin`), created_at |
| `themes` | id, slug, name, category[], config (jsonb), is_active |
| `invitations` | id, owner_id, theme_id, slug (unik + acak), data (jsonb), status (`draft`/`published`/`expired`), expires_at |
| `guests` | id, invitation_id, name, code (unik), group |
| `wishes` | id, invitation_id, guest_id?, attendance, pax, message, is_hidden, created_at |
| `packages` | id, code, name, price, active_days, features (jsonb) |
| `orders` | id, user_id, invitation_id, package_id, amount, unique_code, status (`pending`/`waiting_confirmation`/`paid`/`rejected`), proof_path, confirmed_by, confirmed_at, reject_reason |

Indeks: `invitations(slug)` unik, `guests(invitation_id, code)`, `wishes(invitation_id, created_at desc) where is_hidden=false`, `invitations(expires_at) where status='published'`, `orders(status)`.

## 10. API

| Endpoint | Fungsi | Perlindungan |
| --- | --- | --- |
| `GET /{slug}?to=Nama` | Halaman undangan dari cache | noindex, slug acak |
| `POST /api/rsvp` | Simpan kehadiran + ucapan | zod, Turnstile, rate limit (IP + kode tamu), filter kata |
| `POST /api/orders/[id]/proof` | Unggah bukti transfer | Pemilik order, cek tipe & ukuran file |
| `PATCH /api/admin/orders/[id]` | Konfirmasi / tolak | Admin + 2FA, log audit |
| `POST /api/invitations/[id]/publish` | Terbitkan + revalidate cache | Pemilik + order `paid` |
| `GET /api/invitations/[id]/export` | CSV tamu & RSVP | Pemilik |

## 11. Keamanan (wajib sebelum rilis)

- [ ] RLS aktif di semua tabel; pasangan hanya mengakses miliknya.
- [ ] Insert ucapan hanya lewat `/api/rsvp` (server), tidak langsung dari browser.
- [ ] Semua masukan tamu di-escape; `?to=<b>x</b>` tampil sebagai teks.
- [ ] Bukti transfer & foto: cek tipe asli, encode ulang gambar, nama acak; bucket bukti transfer privat.
- [ ] Header: CSP, HSTS, X-Content-Type-Options, Referrer-Policy, frame-ancestors.
- [ ] Undangan `noindex`; tidak masuk sitemap.
- [ ] Kebijakan privasi (UU PDP) + persetujuan saat input data; data dihapus setelah masa aktif + 30 hari.
- [ ] Backup harian dan uji pemulihan.

## 12. SEO & performa

- Landing, katalog, dan halaman tema dirender di server dengan judul berkata kunci (mis. "Undangan Digital Tema Minang Pastel — WeddingLink").
- Sitemap di domain sendiri; data terstruktur Product/Offer di halaman tema.
- Target di HP: LCP < 2,5 dtk, CLS < 0,1, INP < 200 ms; gambar layar pertama < 250 KB; animasi hanya `transform`/`opacity`, hormati `prefers-reduced-motion`.

## 13. Urutan pengerjaan (6 minggu)

1. Setup proyek, Supabase, migrasi + RLS, data seed tema & paket.
2. Mesin tema + port 5 demo HTML ke `theme.json` + komponen section.
3. Halaman undangan `/[slug]` + cache + nama tamu + RSVP anti-spam.
4. Editor & dashboard pasangan + impor tamu + bagikan WhatsApp.
5. Pembayaran manual + dashboard admin + masa aktif otomatis.
6. Landing page putih-emas dengan bingkai lengkung, SEO, uji keamanan & Playwright, rilis.

## 14. Definition of done MVP

- [ ] Alur lengkap berjalan: pilih tema → isi data → bayar manual → admin konfirmasi → terbit → tamu RSVP.
- [ ] Lulus checklist keamanan bagian 11.
- [ ] Lighthouse mobile: Performance ≥ 90 di halaman undangan.
- [ ] Tes Playwright untuk alur pesan, RSVP, dan tampilan 375/768/1440 px.
- [ ] Semua aset tema orisinal/berlisensi, sumbernya dicatat di `themes/<slug>/ASSETS.md`.

## 15. Pertanyaan terbuka

- Domain utama dan pola link undangan (subpath vs subdomain)?
- Siapa yang membuat ilustrasi tema baru (sendiri, AI, ilustrator)?
- Apakah paket Hemat (edit sendiri) dibuka sejak MVP?

## 16. Panduan untuk Claude Code

- Baca `README.md` dan `SKILLS.md` sebelum mulai; gunakan skill ponytail (kode minimal) dan supabase.
- Kerjakan per urutan di bagian 13; satu fitur = satu PR kecil dengan tes.
- Jangan menambah fitur di luar lingkup MVP tanpa persetujuan.
- Jangan pernah commit `.env*` atau kunci `service_role`.
