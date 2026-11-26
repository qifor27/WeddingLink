-- Data referensi MVP (PRD bagian 6 & 7). Harga bisa diubah admin di DB, bukan di kode.

insert into public.packages (code, name, price, active_days, features) values
  ('hemat', 'Hemat', 49000, 90,
    '{"self_edit": true, "photos": false, "guest_links": false, "revisions": 0}'),
  ('populer', 'Populer', 99000, 180,
    '{"self_edit": false, "photos": true, "guest_links": true, "revisions": 2}'),
  ('istimewa', 'Istimewa', 179000, 365,
    '{"self_edit": false, "photos": true, "guest_links": true, "revisions": "wajar", "priority": true}');

-- config diisi dari themes/<slug>/theme.json di minggu 2 (mesin tema).
insert into public.themes (slug, name, category) values
  ('blue-butterfly', 'Blue Butterfly', array['modern', 'biru', 'foto']),
  ('red-beige', 'Red Beige', array['modern', 'merah', 'foto']),
  ('minang-pastel', 'Minang Pastel', array['adat', 'minang', 'pastel', 'tanpa-foto']),
  ('sunda-minang', 'Sunda–Minang', array['adat', 'sunda', 'minang', 'foto']),
  ('gold-blush', 'Gold Blush Modern', array['modern', 'emas', 'pink', 'foto']),
  ('sage-botanical', 'Sage Botanical', array['modern', 'hijau', 'tanpa-foto']);
