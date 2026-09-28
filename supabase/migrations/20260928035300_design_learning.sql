-- Website design learning loop. Admin-entered aggregate observations only; no visitor identity.
create table if not exists public.design_learning_observations (
  id uuid primary key default gen_random_uuid(),
  page text not null check (page ~ '^/[a-z0-9/-]{0,100}$'),
  variant text not null check (variant ~ '^[a-z0-9_-]{1,50}$'),
  impressions integer not null check (impressions >= 0 and impressions <= 1000000),
  actions integer not null check (actions >= 0 and actions <= impressions),
  source text not null check (length(source) between 3 and 200),
  note text not null default '' check (length(note) <= 1000),
  recorded_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  check (impressions > 0)
);
create index if not exists design_learning_page_date_idx on public.design_learning_observations(page,created_at desc);
create table if not exists public.design_learning_models (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  algorithm text not null default 'beta_binomial_v1',
  observations_count integer not null,
  total_impressions integer not null,
  result jsonb not null,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists design_learning_models_page_date_idx on public.design_learning_models(page,created_at desc);
alter table public.design_learning_observations enable row level security;
alter table public.design_learning_models enable row level security;
revoke all on public.design_learning_observations, public.design_learning_models from anon,authenticated;
grant select,insert on public.design_learning_observations, public.design_learning_models to authenticated;
create policy "active admins read observations" on public.design_learning_observations for select to authenticated using (exists(select 1 from public.admin_users a where a.auth_user_id=(select auth.uid()) and a.active));
create policy "active admins insert observations" on public.design_learning_observations for insert to authenticated with check (recorded_by=(select auth.uid()) and exists(select 1 from public.admin_users a where a.auth_user_id=(select auth.uid()) and a.active));
create policy "active admins read models" on public.design_learning_models for select to authenticated using (exists(select 1 from public.admin_users a where a.auth_user_id=(select auth.uid()) and a.active));
create policy "active admins insert models" on public.design_learning_models for insert to authenticated with check (created_by=(select auth.uid()) and exists(select 1 from public.admin_users a where a.auth_user_id=(select auth.uid()) and a.active));
