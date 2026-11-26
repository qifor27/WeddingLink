@AGENTS.md

- Sumber kebenaran: `PRD-MVP.md`. Ikuti bagian 16 (urutan bagian 13, satu fitur = satu PR kecil + tes, tanpa fitur di luar lingkup).
- Skema DB hanya lewat `supabase/migrations/` (buat file dengan `pnpm exec supabase migration new <nama>`). Setiap tabel: RLS + GRANT eksplisit, tes di `supabase/tests/database/`.
- Insert ucapan, bukti transfer, konfirmasi bayar, publish: hanya lewat server (secret key), bukan dari klien.
- Jangan commit `.env*` (kecuali `.env.example`) atau secret key.
