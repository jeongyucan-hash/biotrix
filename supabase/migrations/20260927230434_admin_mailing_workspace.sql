create table public.mailing_drafts (
  id uuid primary key default gen_random_uuid(),
  subject text not null check (char_length(subject) between 1 and 160),
  preview_text text not null default '' check (char_length(preview_text) <= 200),
  body text not null check (char_length(body) between 1 and 20000),
  audience text not null default 'consented_customers' check (audience = 'consented_customers'),
  status text not null default 'draft' check (status = 'draft'),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index mailing_drafts_created_at_idx on public.mailing_drafts (created_at desc);
alter table public.mailing_drafts enable row level security;

create policy "owner reads mailing drafts" on public.mailing_drafts
  for select to authenticated using ((select private.is_owner()));
create policy "owner creates mailing drafts" on public.mailing_drafts
  for insert to authenticated with check (
    (select private.is_owner()) and created_by = (select auth.uid())
  );
create policy "owner updates mailing drafts" on public.mailing_drafts
  for update to authenticated using ((select private.is_owner()))
  with check ((select private.is_owner()) and status = 'draft');

grant select, insert, update on public.mailing_drafts to authenticated;

create policy "owner records admin audit" on public.audit_logs
  for insert to authenticated with check (
    (select private.is_owner()) and admin_user_id = (select auth.uid())
  );
grant insert on public.audit_logs to authenticated;
grant usage on sequence public.audit_logs_id_seq to authenticated;
