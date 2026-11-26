-- Tes RLS + GRANT. Jalankan: pnpm db:test
begin;
create extension if not exists pgtap with schema extensions;
select plan(20);

-- Data uji (sebagai postgres) --------------------------------------------------
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.local'),
  ('00000000-0000-0000-0000-00000000000b', 'b@test.local'),
  ('00000000-0000-0000-0000-0000000000ad', 'admin@test.local');
update public.users set role = 'admin' where id = '00000000-0000-0000-0000-0000000000ad';

select is((select count(*)::int from public.users), 3, 'trigger membuat public.users');

insert into public.invitations (id, owner_id, theme_id) values
  ('10000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-00000000000b',
   (select id from public.themes where slug = 'red-beige'));
insert into public.wishes (invitation_id, name, attendance, message) values
  ('10000000-0000-0000-0000-00000000000b', 'Tamu', 'hadir', 'Selamat');
insert into public.orders (user_id, invitation_id, package_id, amount, unique_code) values
  ('00000000-0000-0000-0000-00000000000b', '10000000-0000-0000-0000-00000000000b',
   (select id from public.packages where code = 'populer'), 99137, 137);

-- Anon ------------------------------------------------------------------------
set local role anon;
select is((select count(*)::int from public.themes), 6, 'anon baca katalog tema');
select is((select count(*)::int from public.packages), 3, 'anon baca paket');
select throws_ok('select * from public.invitations', '42501', null, 'anon tidak bisa baca undangan');
select throws_ok('select * from public.wishes', '42501', null, 'anon tidak bisa baca ucapan');
reset role;

-- Pasangan A ------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated","aal":"aal1"}';

select is((select count(*)::int from public.invitations), 0, 'A tidak melihat undangan B');
select is((select count(*)::int from public.wishes), 0, 'A tidak melihat ucapan B');
select is((select count(*)::int from public.orders), 0, 'A tidak melihat pesanan B');
select is((select count(*)::int from public.users), 1, 'A hanya melihat dirinya');

select lives_ok(
  $$insert into public.invitations (id, theme_id) values ('10000000-0000-0000-0000-00000000000a',
    (select id from public.themes where slug = 'minang-pastel'))$$,
  'A membuat undangan sendiri');
select is((select owner_id from public.invitations where id = '10000000-0000-0000-0000-00000000000a'),
  '00000000-0000-0000-0000-00000000000a'::uuid, 'owner_id otomatis = A');

select throws_ok(
  $$update public.invitations set status = 'published' where id = '10000000-0000-0000-0000-00000000000a'$$,
  '42501', null, 'A tidak bisa menerbitkan sendiri (status)');
select throws_ok(
  $$insert into public.guests (invitation_id, name) values ('10000000-0000-0000-0000-00000000000b', 'Penyusup')$$,
  '42501', null, 'A tidak bisa menambah tamu di undangan B');
select lives_ok(
  $$insert into public.guests (invitation_id, name) values ('10000000-0000-0000-0000-00000000000a', 'Budi')$$,
  'A menambah tamu di undangannya');
select throws_ok(
  $$insert into public.wishes (invitation_id, name, attendance) values ('10000000-0000-0000-0000-00000000000a', 'x', 'hadir')$$,
  '42501', null, 'ucapan tidak bisa diinsert dari klien');
select throws_ok(
  $$insert into public.orders (user_id, invitation_id, package_id, amount, unique_code)
    values ('00000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-00000000000a',
    (select id from public.packages limit 1), 1, 1)$$,
  '42501', null, 'pesanan tidak bisa dibuat dari klien');

-- Pasangan B: moderasi ucapan -------------------------------------------------
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated","aal":"aal1"}';
update public.wishes set is_hidden = true;
select is((select bool_and(is_hidden) from public.wishes), true, 'B menyembunyikan ucapan');
select throws_ok('select ip_hash from public.wishes', '42501', null, 'pasangan tidak bisa membaca ip_hash');

-- Admin -----------------------------------------------------------------------
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000ad","role":"authenticated","aal":"aal1"}';
select is((select count(*)::int from public.orders), 0, 'admin tanpa 2FA tidak melihat pesanan');
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000ad","role":"authenticated","aal":"aal2"}';
select is((select count(*)::int from public.orders), 1, 'admin dengan 2FA melihat semua pesanan');

reset role;
select * from finish();
rollback;
