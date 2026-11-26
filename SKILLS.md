# Skill GitHub untuk Mengembangkan WeddingLink

Skill adalah folder instruksi (`SKILL.md`) yang membuat agent AI coding (Claude Code, Antigravity, Cursor, Codex, dll.) bekerja sesuai praktik terbaik. Pasang di folder proyek supaya semua kontributor memakai aturan yang sama.

> Baca isi skill sebelum memasangnya, terutama skill dari pihak ketiga. Skill bisa memerintahkan agent menjalankan perintah di komputermu.

## Cara memasang

```bash
# Semua skill dari satu repo
npx skills add <owner>/<repo>

# Satu skill tertentu
npx skills add <owner>/<repo> --skill <nama-skill>

# Khusus Google Antigravity
npx skills add <owner>/<repo> --agent antigravity
```

## Daftar skill

### 0. Cara kerja agent (pasang paling awal)

| Skill | Repo | Dipakai untuk |
| --- | --- | --- |
| **ECC (Everything Claude Code)** | [affaan-m/ECC](https://github.com/affaan-m/ECC) | Kerangka kerja lengkap: sub-agent (planner, architect, code reviewer, security reviewer, build-error resolver), skill, hook, dan memori antar sesi. Cocok sebagai "sistem operasi" pengembangan WeddingLink |
| **caveman** | [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) | Membuat jawaban agent super ringkas tanpa basa-basi, sehingga hemat token dan kuota. Ada juga `caveman-review` (review kode satu baris per temuan) dan `caveman-commit` |
| **ponytail** | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | Membuat agent berpikir seperti "senior dev malas": pakai ulang kode dan fitur bawaan sebelum menulis kode baru, sehingga kode lebih sedikit dan tidak over-engineering. Ada `ponytail-review` dan `ponytail-debt` |

Pemasangan di Claude Code:

```
/plugin marketplace add https://github.com/affaan-m/ECC
/plugin install ecc@ecc

claude plugin marketplace add JuliusBrussee/caveman
claude plugin install caveman@caveman

/plugin marketplace add DietrichGebert/ponytail
/plugin install ponytail@ponytail
```

Untuk agent lain (termasuk Antigravity), pakai `npx skills add`:

```bash
npx skills add JuliusBrussee/caveman
npx skills add DietrichGebert/ponytail
```

Catatan:
- ECC sudah berisi banyak skill dan hook. Pilih satu cara pasang saja (plugin **atau** manual), jangan keduanya, supaya tidak dobel.
- caveman mengatur cara agent **berbicara**, ponytail mengatur seberapa banyak **kode** yang ditulis. Keduanya bisa dipakai bersamaan.
- Matikan caveman (`stop caveman`) saat kamu sedang belajar konsep baru dan butuh penjelasan panjang.
- Pakai repo resmi di atas; mirror atau unggahan ulang pihak ketiga bisa berisi kode berbahaya.

### 1. Frontend dan animasi undangan

| Skill | Repo | Dipakai untuk |
| --- | --- | --- |
| `gsap-scrolltrigger`, `gsap-react`, `gsap-timeline`, `gsap-performance` | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | Animasi ornamen saat scroll, cover terbuka, timeline animasi. Skill resmi dari pembuat GSAP |
| `gsap-framer-scroll-animation` | [github/awesome-copilot](https://github.com/github/awesome-copilot) | Parallax, section yang menempel saat di-scroll, animasi teks; GSAP atau Framer Motion |
| `web-animation-skills` (gsap-web, micro-interaction, accessible-animation) | [iart-ai/web-animation-skills](https://github.com/iart-ai/web-animation-skills) | Micro-interaction tombol/drawer, dan animasi yang tetap ramah `prefers-reduced-motion` |
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills) | Arah desain tema baru supaya tidak terlihat seperti template generik |

### 2. Next.js, React, dan deploy

| Skill | Repo | Dipakai untuk |
| --- | --- | --- |
| `vercel-react-best-practices` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | Performa React/Next.js: data fetching, ukuran bundle, render. Penting supaya undangan cepat di HP |
| Web Interface Guidelines (cek nama persisnya di repo) | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | Audit UI: aksesibilitas, fokus, form, UX |
| `deploy-to-vercel`, `vercel-optimize` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | Deploy dan optimasi biaya/performa di Vercel |

### 3. Database dan keamanan data

| Skill | Repo | Dipakai untuk |
| --- | --- | --- |
| `supabase` | [supabase/agent-skills](https://github.com/supabase/agent-skills) | Semua pekerjaan Supabase: skema, migrasi, Auth, Storage, dengan aturan keamanan langsung di SKILL.md |
| `supabase-postgres-best-practices` | [supabase/agent-skills](https://github.com/supabase/agent-skills) | Query, indeks, dan Row Level Security yang benar untuk tabel `invitations`, `guests`, `wishes` |

### 4. Pengujian

| Skill | Repo | Dipakai untuk |
| --- | --- | --- |
| `webapp-testing` | [anthropics/skills](https://github.com/anthropics/skills) | Tes Playwright: alur pesan, kirim RSVP, screenshot tema di ukuran HP/tablet/desktop, cek error di console |

### 5. Audit keamanan kode

| Skill | Repo | Dipakai untuk |
| --- | --- | --- |
| `static-analysis` (CodeQL, Semgrep, SARIF), `audit-context-building` | [trailofbits/skills](https://github.com/trailofbits/skills) | Memindai kode WeddingLink sendiri sebelum rilis: XSS di nama tamu, validasi API RSVP, kebocoran kunci |

Pasang lewat marketplace plugin Claude Code:

```
/plugin marketplace add trailofbits/skills
```

### 6. SEO

| Skill | Repo | Dipakai untuk |
| --- | --- | --- |
| `seo-technical`, `seo-schema`, `seo-page`, `seo-plan` | [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) | Audit teknis (crawl, Core Web Vitals, rendering JS), data terstruktur JSON-LD, rencana konten SEO lokal |
| `seo-audit` | [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) | Audit SEO berlapis: teknis, on-page, konten |

## Paket yang disarankan per tahap

| Tahap | Pasang skill ini |
| --- | --- |
| Sejak awal proyek | ECC, caveman, ponytail |
| Membangun mesin tema dan halaman undangan | `vercel-react-best-practices`, GSAP skills, `frontend-design` |
| Membuat database dan API RSVP | `supabase`, `supabase-postgres-best-practices` |
| Sebelum rilis | `webapp-testing`, Trail of Bits `static-analysis`, Web Interface Guidelines |
| Setelah rilis | `seo-technical`, `seo-schema`, `seo-plan` |

## Contoh pemasangan sekaligus

```bash
npx skills add JuliusBrussee/caveman
npx skills add DietrichGebert/ponytail
npx skills add greensock/gsap-skills --agent antigravity
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices
npx skills add supabase/agent-skills
npx skills add anthropics/skills --skill webapp-testing
npx skills add anthropics/skills --skill frontend-design
```
