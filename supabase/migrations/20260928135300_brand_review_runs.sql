create table if not exists public.brand_review_runs (
 id uuid primary key default gen_random_uuid(),
 master_version text not null,
 status text not null check(status in ('pass','review','fail')),
 report jsonb not null,
 created_by uuid not null default auth.uid(),
 created_at timestamptz not null default now()
);
create index if not exists brand_review_runs_created_idx on public.brand_review_runs(created_at desc);
alter table public.brand_review_runs enable row level security;
revoke all on public.brand_review_runs from anon,authenticated;
grant select,insert on public.brand_review_runs to authenticated;
create policy "active admins read brand reviews" on public.brand_review_runs for select to authenticated using (exists(select 1 from public.admin_users a where a.auth_user_id=(select auth.uid()) and a.active));
create policy "active admins record brand reviews" on public.brand_review_runs for insert to authenticated with check (created_by=(select auth.uid()) and exists(select 1 from public.admin_users a where a.auth_user_id=(select auth.uid()) and a.active));
