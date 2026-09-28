alter table public.chatgpt_work_results add column if not exists knowledge_document_id uuid references public.documents(id);

create or replace function public.save_hq_work_result(p_work_item_id uuid, p_result_id uuid, p_text text)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare w public.chatgpt_work_items; r public.chatgpt_work_results;
begin
  if auth.uid() is null or not private.is_admin() then raise exception 'admin_required'; end if;
  if p_result_id is null or p_text is null or length(trim(p_text)) = 0 or length(p_text)>50000 then raise exception 'invalid_result'; end if;
  select * into w from public.chatgpt_work_items where id=p_work_item_id for update;
  if not found then raise exception 'work_not_found'; end if;
  select * into r from public.chatgpt_work_results where id=p_result_id;
  if found then
    if r.work_item_id<>p_work_item_id or r.result_text<>trim(p_text) then raise exception 'result_conflict'; end if;
    return r.id;
  end if;
  if w.status in ('accepted','archived','cancelled') then raise exception 'work_closed'; end if;
  insert into public.chatgpt_work_results(id,work_item_id,result_text) values(p_result_id,p_work_item_id,trim(p_text));
  update public.chatgpt_work_items set status='result_ready',updated_at=now() where id=p_work_item_id;
  return p_result_id;
end; $$;

create or replace function public.accept_hq_work_result(p_result_id uuid)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare r public.chatgpt_work_results; w public.chatgpt_work_items; wid uuid; doc_id uuid;
begin
  if auth.uid() is null or not private.is_admin() then raise exception 'admin_required'; end if;
  select work_item_id into wid from public.chatgpt_work_results where id=p_result_id;
  if not found then raise exception 'result_not_found'; end if;
  select * into w from public.chatgpt_work_items where id=wid for update;
  if not found then raise exception 'work_not_found'; end if;
  select * into r from public.chatgpt_work_results where id=p_result_id for update;
  if r.accepted and r.knowledge_document_id is not null then return r.knowledge_document_id; end if;
  if w.status in ('archived','cancelled') then raise exception 'work_closed'; end if;
  if exists(select 1 from public.chatgpt_work_results where work_item_id=wid and accepted and id<>p_result_id) then raise exception 'another_result_accepted'; end if;
  insert into public.documents(title,category,content,tags,created_by)
    values('AI Work · '||w.title,'ai-'||w.department,r.result_text,array['chatgpt','accepted','work-queue'],auth.uid()) returning id into doc_id;
  update public.chatgpt_work_results set accepted=true,knowledge_document_id=doc_id where id=p_result_id;
  update public.chatgpt_work_items set status='accepted',updated_at=now() where id=wid;
  return doc_id;
end; $$;

create or replace function public.set_hq_work_status(p_id uuid,p_status text)
returns void language plpgsql security invoker set search_path = '' as $$
declare w public.chatgpt_work_items;
begin
  if auth.uid() is null or not private.is_admin() then raise exception 'admin_required'; end if;
  if p_status is null or p_status not in ('prepared','in_progress','archived','cancelled') then raise exception 'invalid_status'; end if;
  select * into w from public.chatgpt_work_items where id=p_id for update;
  if not found then raise exception 'work_not_found'; end if;
  if w.status='accepted' and p_status<>'archived' then raise exception 'accepted_work_locked'; end if;
  update public.chatgpt_work_items set status=p_status,updated_at=now() where id=p_id;
end; $$;
revoke all on function public.save_hq_work_result(uuid,uuid,text) from public,anon;
revoke all on function public.accept_hq_work_result(uuid) from public,anon;
revoke all on function public.set_hq_work_status(uuid,text) from public,anon;
grant execute on function public.save_hq_work_result(uuid,uuid,text) to authenticated;
grant execute on function public.accept_hq_work_result(uuid) to authenticated;
grant execute on function public.set_hq_work_status(uuid,text) to authenticated;
