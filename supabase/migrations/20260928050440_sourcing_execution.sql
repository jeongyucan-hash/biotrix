-- Bounded, admin-triggered real research. Existing records remain intact.
alter table public.sourcing_research_jobs
  add column if not exists result_json jsonb,
  add column if not exists provider_response_id text;
alter table public.sourcing_research_jobs alter column estimated_cost_usd drop not null;

create or replace function public.start_sourcing_research(p_mission_id uuid, p_instruction text)
returns public.sourcing_research_jobs language plpgsql set search_path = '' as $$
declare m public.sourcing_missions; j public.sourcing_research_jobs;
begin
  if not (select private.is_admin()) then raise exception 'admin_required'; end if;
  if not exists(select 1 from public.company_settings where key='ai.enabled' and value='true'::jsonb)
     or not exists(select 1 from public.company_settings where key='sourcing.research.enabled' and value='true'::jsonb)
    then raise exception 'research_disabled'; end if;
  if length(coalesce(p_instruction,''))>3000 then raise exception 'instruction_too_long'; end if;
  -- Serializes duplicate clicks and the small shared daily execution allowance.
  perform pg_advisory_xact_lock(9282026, 301);
  select * into m from public.sourcing_missions where id=p_mission_id for update;
  if not found then raise exception 'mission_not_found'; end if;
  if m.status in ('cancelled','completed') then raise exception 'mission_closed'; end if;
  update public.sourcing_research_jobs set status='failed',completed_at=now(),
    error_message='실행 응답이 제한 시간 안에 저장되지 않았습니다. 자동 재호출하지 않았습니다.'
    where status='running' and started_at<now()-interval '4 minutes';
  if exists(select 1 from public.sourcing_research_jobs where status='running')
    then raise exception 'research_already_running'; end if;
  if (select count(*) from public.sourcing_research_jobs where started_at>now()-interval '24 hours')>=10
    then raise exception 'daily_research_limit'; end if;
  if exists(select 1 from public.sourcing_research_jobs where started_at>now()-interval '30 seconds')
    then raise exception 'research_cooldown'; end if;
  insert into public.sourcing_research_jobs(mission_id,status,objective,candidate_target,model_name,started_by,started_at,estimated_cost_usd)
  values(m.id,'running',left(concat_ws(E'\n',m.title,m.brief,'추가 지시: '||p_instruction),12000),5,
    'openai/gpt-5.4-mini',auth.uid(),now(),null) returning * into j;
  update public.sourcing_missions set status='researching',updated_at=now() where id=m.id;
  return j;
end $$;

create or replace function public.finish_sourcing_research(
  p_job_id uuid, p_result jsonb, p_error text, p_usage jsonb, p_response_id text)
returns uuid language plpgsql set search_path = '' as $$
declare j public.sourcing_research_jobs; c jsonb; saved integer:=0;
begin
  if not (select private.is_admin()) then raise exception 'admin_required'; end if;
  select * into j from public.sourcing_research_jobs where id=p_job_id for update;
  if not found then raise exception 'job_not_found'; end if;
  if j.status<>'running' then return j.id; end if; -- idempotent delivery
  if p_error is null then
    if p_result is null or jsonb_typeof(p_result->'candidates') is distinct from 'array'
       or jsonb_typeof(p_result->'sources') is distinct from 'array'
       or jsonb_array_length(p_result->'sources')<1 or jsonb_array_length(p_result->'candidates')>5
      then raise exception 'invalid_research_result'; end if;
    for c in select value from jsonb_array_elements(p_result->'candidates') loop
      if coalesce(c->>'source_url','') !~ '^https?://' or not exists(
        select 1 from jsonb_array_elements(p_result->'sources') s where s->>'url'=c->>'source_url')
        then raise exception 'candidate_source_missing'; end if;
      -- Keep operator-reviewed records; repeat investigations cannot overwrite them.
      if not exists(select 1 from public.sourcing_candidates where mission_id=j.mission_id and source_url=c->>'source_url') then
        insert into public.sourcing_candidates(mission_id,candidate_type,name,source_url,product_summary,
          settlement_terms,evidence_status,status,supply_risk,notes)
        values(j.mission_id,'supplier',c->>'name',c->>'source_url',c->>'summary',c->>'terms',
          'source_claim','researching','unknown',concat_ws(E'\n','AI 공개자료 조사: 추가 검증 필요',c->>'unknowns','Research job: '||j.id));
        saved:=saved+1;
      end if;
    end loop;
    insert into public.documents(id,title,category,content,tags,created_by)
    values(j.id,'공급처 조사 · '||to_char(now() at time zone 'Asia/Seoul','YYYY-MM-DD HH24:MI:SS')||' KST',
      'supplier-research',concat_ws(E'\n\n',j.objective,p_result->>'summary',p_result->>'limitations',jsonb_pretty(p_result)),
      array['sourcing','AI','source_claim'],auth.uid()) on conflict(id) do nothing;
  end if;
  update public.sourcing_research_jobs set
    status=case when p_error is null then 'completed' else 'failed' end,
    result_json=p_result,error_message=left(p_error,1000),completed_at=now(),candidates_created=saved,
    sources_found=coalesce(jsonb_array_length(p_result->'sources'),0),
    calls_used=coalesce((p_usage->>'requests')::integer,0),
    input_tokens=coalesce((p_usage->>'input_tokens')::bigint,0),
    output_tokens=coalesce((p_usage->>'output_tokens')::bigint,0),
    provider_response_id=p_response_id,estimated_cost_usd=null where id=j.id;
  return j.id;
end $$;

revoke all on function public.start_sourcing_research(uuid,text) from public, anon;
revoke all on function public.finish_sourcing_research(uuid,jsonb,text,jsonb,text) from public, anon;
grant execute on function public.start_sourcing_research(uuid,text) to authenticated;
grant execute on function public.finish_sourcing_research(uuid,jsonb,text,jsonb,text) to authenticated;
