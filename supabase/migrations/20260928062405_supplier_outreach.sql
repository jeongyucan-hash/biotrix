create table public.supplier_outreach (
 id uuid primary key default gen_random_uuid(),
 candidate_id uuid not null unique references public.sourcing_candidates(id),
 recipient text not null check(length(recipient) between 3 and 254 and recipient !~ '[\r\n]'),
 subject text not null check(length(trim(subject)) between 1 and 160),
 body text not null check(length(trim(body)) between 1 and 10000),
 status text not null default 'draft' check(status in ('draft','sending','accepted','failed','unknown')),
 version integer not null default 1 check(version>0),
 provider_id text,
 error text,
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(status<>'accepted' or provider_id is not null)
);
create table public.supplier_quotes (
 id uuid primary key default gen_random_uuid(),
 outreach_id uuid not null references public.supplier_outreach(id),
 data jsonb not null check(jsonb_typeof(data)='object'),
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 check(length(trim(coalesce(data->>'reply','')))>0 and length(trim(coalesce(data->>'evidence','')))>0 and length(trim(coalesce(data->>'spec','')))>0)
);
create index supplier_quotes_outreach_date on public.supplier_quotes(outreach_id,created_at desc);
alter table public.supplier_outreach enable row level security;
alter table public.supplier_quotes enable row level security;
revoke all on public.supplier_outreach,public.supplier_quotes from anon,authenticated;
grant select,insert,update on public.supplier_outreach to authenticated;
grant select,insert on public.supplier_quotes to authenticated;
create policy "admins read outreach" on public.supplier_outreach for select to authenticated using((select private.is_admin()));
create policy "owner creates outreach" on public.supplier_outreach for insert to authenticated with check((select private.is_owner()) and created_by=(select auth.uid()) and status='draft');
create policy "owner updates outreach" on public.supplier_outreach for update to authenticated using((select private.is_owner())) with check((select private.is_owner()));
create policy "admins read quotes" on public.supplier_quotes for select to authenticated using((select private.is_admin()));
create policy "owner records quotes" on public.supplier_quotes for insert to authenticated with check((select private.is_owner()) and created_by=(select auth.uid()));
