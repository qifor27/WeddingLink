-- Minggu 5: pembayaran manual, log audit admin, masa aktif.

-- Satu pesanan terbuka per undangan (pesanan baru dibuat setelah yang lama ditolak).
create unique index orders_open_invitation_uidx on public.orders (invitation_id)
  where status in ('pending', 'waiting_confirmation');

-- confirmed_by/confirmed_at dipakai untuk konfirmasi maupun penolakan (= admin yang memeriksa).
comment on column public.orders.confirmed_by is 'Admin yang mengonfirmasi atau menolak';

-- Log audit perubahan status pesanan. Ditulis trigger (atomik dengan perubahannya),
-- hanya bisa dibaca admin 2FA, tidak bisa diubah klien.
create table public.audit_logs (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id),
  actor_id uuid references public.users (id),
  from_status public.order_status,
  to_status public.order_status not null,
  reason text,
  created_at timestamptz not null default now()
);
create index audit_logs_order_id_idx on public.audit_logs (order_id);

alter table public.audit_logs enable row level security;
revoke all on public.audit_logs from anon, authenticated;
grant all on public.audit_logs to service_role;
grant select on public.audit_logs to authenticated;
create policy "audit_logs: admin baca" on public.audit_logs
  for select to authenticated
  using ((select private.is_admin()));

create function private.audit_order_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_logs (order_id, actor_id, from_status, to_status, reason)
  values (
    new.id,
    case when new.status in ('paid', 'rejected') then new.confirmed_by else new.user_id end,
    case when tg_op = 'UPDATE' then old.status end,
    new.status,
    new.reject_reason
  );
  return new;
end;
$$;
revoke execute on function private.audit_order_status() from public;

create trigger orders_audit_insert
  after insert on public.orders
  for each row execute function private.audit_order_status();
create trigger orders_audit_status
  after update of status on public.orders
  for each row when (old.status is distinct from new.status)
  execute function private.audit_order_status();
