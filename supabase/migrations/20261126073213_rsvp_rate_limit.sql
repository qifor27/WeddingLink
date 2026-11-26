-- Rate limit RSVP (PRD F6): hash IP pengirim (HMAC, bukan IP mentah — UU PDP).
alter table public.wishes add column ip_hash text;

create index wishes_ip_hash_created_at_idx on public.wishes (ip_hash, created_at desc);

-- Pasangan tidak perlu melihat ip_hash: ganti SELECT tabel dengan SELECT per kolom.
revoke select on public.wishes from authenticated;
grant select (id, invitation_id, guest_id, name, attendance, pax, message, is_hidden, created_at)
  on public.wishes to authenticated;
