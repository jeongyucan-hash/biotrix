-- Persist token-based estimated cost and its missing-price explanation on every execution.
alter table public.sourcing_research_jobs add column if not exists cost_reason text;
update public.sourcing_research_jobs set cost_reason='historical_pricing_not_recorded'
  where estimated_cost_usd is null and completed_at is not null and cost_reason is null;

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
    provider_response_id=p_response_id,
    model_name=left(coalesce(nullif(p_usage->>'model',''),j.model_name),200),
    estimated_cost_usd=case
      when length(p_usage->>'estimated_cost_usd')<=30 and p_usage->>'estimated_cost_usd' ~ '^(0|[0-9]+)(\.[0-9]+)?$'
        then (p_usage->>'estimated_cost_usd')::numeric else null end,
    cost_reason=case
      when length(p_usage->>'estimated_cost_usd')<=30 and p_usage->>'estimated_cost_usd' ~ '^(0|[0-9]+)(\.[0-9]+)?$' then null
      else left(coalesce(nullif(p_usage->>'cost_reason',''),'pricing_unavailable'),100) end
    where id=j.id;
  return j.id;
end $$;
