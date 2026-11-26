-- Tes pesanan + log audit (minggu 5). Jalankan: pnpm db:test
begin;
create extension if not exists pgtap with schema extensions;
select plan(9);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.local'),
  ('00000000-0000-0000-0000-0000000000ad', 'admin@test.local');
update public.users set role = 'admin' where id = '00000000-0000-0000-0000-0000000000ad';
insert into public.invitations (id, owner_id, theme_id) values
  ('10000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000a',
   (select id from public.themes where slug = 'red-beige'));
insert into public.orders (id, user_id, invitation_id, package_id, amount, unique_code) values
  ('20000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-00000000000a',
   (select id from public.packages where code = 'populer'), 99137, 137);

select throws_ok(
  $$insert into public.orders (user_id, invitation_id, package_id, amount, unique_code) values
    ('00000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-00000000000a',
     (select id from public.packages where code = 'hemat'), 49001, 1)$$,
  '23505', null, 'satu pesanan terbuka per undangan');

-- Server (service_role) mengubah status -> trigger menulis audit.
update public.orders set status = 'waiting_confirmation', proof_path = 'x/y.jpg' where id = '20000000-0000-0000-0000-00000000000a';
update public.orders set status = 'rejected', reject_reason = 'Nominal tidak cocok',
  confirmed_by = '00000000-0000-0000-0000-0000000000ad', confirmed_at = now()
  where id = '20000000-0000-0000-0000-00000000000a';
update public.orders set proof_path = 'x/z.jpg' where id = '20000000-0000-0000-0000-00000000000a'; -- bukan perubahan status

select is((select count(*)::int from public.audit_logs), 3, 'insert + 2 perubahan status tercatat');
select results_eq(
  $$select actor_id, from_status::text, to_status::text, reason from public.audit_logs order by id desc limit 1$$,
  $$values ('00000000-0000-0000-0000-0000000000ad'::uuid, 'waiting_confirmation', 'rejected', 'Nominal tidak cocok')$$,
  'audit penolakan: admin, status, alasan');
select lives_ok(
  $$insert into public.orders (user_id, invitation_id, package_id, amount, unique_code) values
    ('00000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-00000000000a',
     (select id from public.packages where code = 'hemat'), 49137, 137)$$,
  'pesanan baru boleh setelah ditolak');

-- Pasangan -------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated","aal":"aal1"}';
select is((select count(*)::int from public.audit_logs), 0, 'pasangan tidak membaca audit');
select throws_ok($$update public.orders set status = 'paid'$$, '42501', null, 'pasangan tidak bisa mengubah status pesanan');
select throws_ok($$insert into public.audit_logs (order_id, to_status) values ('20000000-0000-0000-0000-00000000000a', 'paid')$$,
  '42501', null, 'pasangan tidak bisa menulis audit');
reset role;

-- Admin -----------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000ad","role":"authenticated","aal":"aal1"}';
select is((select count(*)::int from public.audit_logs), 0, 'admin tanpa 2FA tidak membaca audit');
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000ad","role":"authenticated","aal":"aal2"}';
select is((select count(*)::int from public.audit_logs), 4, 'admin 2FA membaca audit');
reset role;

select * from finish();
rollback;
