create table public.launch_plans (
 id uuid primary key default gen_random_uuid(),
 data jsonb not null check (jsonb_typeof(data)='object'),
 version integer not null default 1 check(version>0),
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table public.launch_prerequisites (
 key text primary key check(key in ('permit','wing','supplier')),
 status text not null default 'unknown' check(status in ('unknown','pending','ready')),
 evidence text not null default '',
 updated_by uuid references auth.users(id),
 updated_at timestamptz not null default now(),
 constraint completion_evidence check(status<>'ready' or length(trim(evidence))>0)
);
create table public.launch_reviews (
 id uuid primary key default gen_random_uuid(),
 plan_id uuid not null references public.launch_plans(id),
 period text not null check(length(trim(period))>0),
 orders integer not null check(orders>=0),
 facts text not null check(length(trim(facts))>0),
 hypothesis text not null default '',
 action text not null check(length(trim(action))>0),
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now()
);
create index launch_reviews_plan_date on public.launch_reviews(plan_id,created_at desc);
alter table public.launch_plans enable row level security;
alter table public.launch_prerequisites enable row level security;
alter table public.launch_reviews enable row level security;
revoke all on public.launch_plans,public.launch_prerequisites,public.launch_reviews from anon,authenticated;
grant select,insert,update on public.launch_plans,public.launch_prerequisites to authenticated;
grant select,insert on public.launch_reviews to authenticated;
create policy "admins read launch plans" on public.launch_plans for select to authenticated using ((select private.is_admin()));
create policy "admins add launch plans" on public.launch_plans for insert to authenticated with check ((select private.is_admin()) and created_by=(select auth.uid()));
create policy "admins edit launch plans" on public.launch_plans for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admins manage launch prerequisites" on public.launch_prerequisites for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()) and updated_by=(select auth.uid()));
create policy "admins read launch reviews" on public.launch_reviews for select to authenticated using ((select private.is_admin()));
create policy "admins add launch reviews" on public.launch_reviews for insert to authenticated with check ((select private.is_admin()) and created_by=(select auth.uid()));
