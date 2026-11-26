-- WeddingLink MVP: skema inti + RLS.
-- Prinsip akses:
--   * Klien (anon/authenticated) hanya dapat GRANT eksplisit + RLS. Tabel tidak auto-expose.
--   * Operasi sensitif lewat server (service_role): insert ucapan (/api/rsvp), unggah bukti,
--     konfirmasi bayar, publish, membaca undangan publik. Karena itu anon tidak punya akses tabel apa pun
--     selain katalog tema & paket.

-- Skema privat: tidak diekspos ke Data API.
create schema if not exists private;
grant usage on schema private to authenticated;

-- Enum ------------------------------------------------------------------------
create type public.user_role as enum ('couple', 'admin');
create type public.invitation_status as enum ('draft', 'published', 'expired');
create type public.order_status as enum ('pending', 'waiting_confirmation', 'paid', 'rejected');
create type public.attendance as enum ('hadir', 'tidak_hadir', 'ragu');

-- Tabel -----------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  phone text,
  role public.user_role not null default 'couple',
  created_at timestamptz not null default now()
);

create table public.themes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text[] not null default '{}',
  config jsonb not null default '{}',
  is_active boolean not null default true
);

create table public.packages (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  price integer not null check (price > 0), -- rupiah
  active_days integer not null check (active_days > 0),
  features jsonb not null default '{}'
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.users (id) on delete cascade,
  theme_id uuid not null references public.themes (id),
  -- 12 karakter base64url acak (72 bit): link tidak bisa ditebak.
  slug text not null unique
    default translate(encode(extensions.gen_random_bytes(9), 'base64'), '+/', '-_'),
  data jsonb not null default '{}',
  status public.invitation_status not null default 'draft',
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  code text not null
    default translate(encode(extensions.gen_random_bytes(9), 'base64'), '+/', '-_'),
  "group" text check (char_length("group") <= 60),
  created_at timestamptz not null default now(),
  unique (invitation_id, code)
);

create table public.wishes (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  guest_id uuid references public.guests (id) on delete set null,
  -- Nama pengirim: tamu tanpa kode tetap perlu nama.
  name text not null check (char_length(name) between 1 and 60),
  attendance public.attendance not null,
  pax smallint not null default 1 check (pax between 0 and 20),
  message text check (char_length(message) <= 500),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id),
  invitation_id uuid not null references public.invitations (id),
  package_id uuid not null references public.packages (id),
  amount integer not null check (amount > 0), -- harga paket + unique_code
  unique_code smallint not null check (unique_code between 1 and 999),
  status public.order_status not null default 'pending',
  proof_path text,
  confirmed_by uuid references public.users (id),
  confirmed_at timestamptz,
  reject_reason text,
  created_at timestamptz not null default now()
);

-- Indeks ----------------------------------------------------------------------
create index invitations_owner_id_idx on public.invitations (owner_id);
create index invitations_expires_at_idx on public.invitations (expires_at) where status = 'published';
create index wishes_visible_idx on public.wishes (invitation_id, created_at desc) where is_hidden = false;
create index wishes_guest_id_idx on public.wishes (guest_id);
create index orders_status_idx on public.orders (status);
create index orders_user_id_idx on public.orders (user_id);
create index orders_invitation_id_idx on public.orders (invitation_id);
-- Nominal unik di antara pesanan yang belum selesai, supaya mutasi rekening tidak ambigu.
create unique index orders_open_amount_uidx on public.orders (amount)
  where status in ('pending', 'waiting_confirmation');

-- Fungsi privat ---------------------------------------------------------------
-- SECURITY DEFINER dibutuhkan: dipanggil dari policy tabel users (hindari rekursi RLS).
-- Admin wajib login 2FA (aal2).
create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select auth.jwt() ->> 'aal') = 'aal2', false)
     and exists (
       select 1 from public.users
       where id = (select auth.uid()) and role = 'admin'
     );
$$;
revoke execute on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

-- Buat baris public.users saat user Auth baru mendaftar.
create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email, phone) values (new.id, new.email, new.phone);
  return new;
end;
$$;
revoke execute on function private.handle_new_user() from public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- GRANT -----------------------------------------------------------------------
-- Mulai dari nol (aman juga di proyek lama yang masih auto-expose), lalu buka seperlunya.
revoke all on all tables in schema public from anon, authenticated;
grant all on all tables in schema public to service_role;

grant select on public.themes, public.packages to anon, authenticated;

grant select on public.users to authenticated;

-- Pasangan hanya boleh mengubah tema & data. status/expires_at/slug diatur server.
grant select on public.invitations to authenticated;
grant insert (theme_id, data), update (theme_id, data) on public.invitations to authenticated;

grant select, delete on public.guests to authenticated;
grant insert (invitation_id, name, "group"), update (name, "group") on public.guests to authenticated;

-- Ucapan hanya dimasukkan server; pasangan cuma bisa menyembunyikan.
grant select on public.wishes to authenticated;
grant update (is_hidden) on public.wishes to authenticated;

-- Pesanan dibuat & diubah server (nominal tidak boleh ditentukan klien).
grant select on public.orders to authenticated;

-- RLS -------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.themes enable row level security;
alter table public.packages enable row level security;
alter table public.invitations enable row level security;
alter table public.guests enable row level security;
alter table public.wishes enable row level security;
alter table public.orders enable row level security;

create policy "themes: katalog aktif" on public.themes
  for select to anon, authenticated using (is_active);

create policy "packages: publik" on public.packages
  for select to anon, authenticated using (true);

create policy "users: diri sendiri atau admin" on public.users
  for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));

create policy "invitations: pemilik atau admin baca" on public.invitations
  for select to authenticated
  using (owner_id = (select auth.uid()) or (select private.is_admin()));
create policy "invitations: pemilik buat" on public.invitations
  for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "invitations: pemilik ubah" on public.invitations
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- Kepemilikan tamu/ucapan diturunkan dari undangan (subquery ikut RLS invitations).
create policy "guests: pemilik undangan" on public.guests
  for all to authenticated
  using (exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.owner_id = (select auth.uid())
  ));

create policy "wishes: pemilik undangan baca" on public.wishes
  for select to authenticated
  using (exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.owner_id = (select auth.uid())
  ));
create policy "wishes: pemilik undangan moderasi" on public.wishes
  for update to authenticated
  using (exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.owner_id = (select auth.uid())
  ));

create policy "orders: pemilik atau admin baca" on public.orders
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));

-- Storage ---------------------------------------------------------------------
-- Unggahan lewat server (cek tipe asli + encode ulang + nama acak), jadi tidak ada policy
-- storage.objects untuk klien. photos publik (dipakai halaman undangan yang di-cache);
-- proofs privat, dibaca admin via signed URL.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('photos', 'photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('proofs', 'proofs', false, 5242880, array['image/jpeg', 'image/png', 'application/pdf']);
