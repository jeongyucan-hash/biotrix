"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";
import { requestResearch, parseResearch, researchConfiguration, researchError } from '../../lib/sourcing/research.mjs';
import {quickMission} from '../../lib/sourcing/intake.mjs';
import {gatewayCredentials} from '../../lib/ai/gateway-auth';

export async function quickResearch(previousState,formData){
  let missionId;
  try {
    const {supabase,user}=await getAdmin();
    let mission;
    try { mission=quickMission(formData.get('request')); }
    catch(error) { return {error:error.message}; }
    if(!researchConfiguration(await gatewayCredentials()).configured) return {error:'AI 연결 설정이 필요합니다. 요청을 다시 입력하지 말고 관리자에게 알려 주세요.'};
    missionId=String(formData.get('request_id') || '');
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(missionId)) return {error:'화면을 새로고침한 후 다시 시도해 주세요.'};
    const inserted=await supabase.from('sourcing_missions').insert({...mission,id:missionId,created_by:user.id});
    if(inserted.error && inserted.error.code!=='23505') return {error:'요청 저장에 실패했습니다. 입력 내용은 그대로 두고 다시 시도해 주세요.'};
    const saved=await supabase.from('sourcing_missions').select('id,brief,created_by').eq('id',missionId).single();
    if(saved.error || saved.data.created_by!==user.id || saved.data.brief!==mission.brief) return {error:'이 요청은 이미 저장됐습니다. 새 요청을 시작하거나 아래 기존 요청을 확인해 주세요.'};
    const existing=await supabase.from('sourcing_research_jobs').select('id').eq('mission_id',missionId).limit(1);
    if(existing.error) return {error:'실행 기록을 확인하지 못해 중복 호출을 중단했습니다.',missionId};
    if(existing.data.length) return {message:'이미 실행한 요청입니다. 아래 결과를 확인해 주세요. 재실행은 해당 요청에서 선택할 수 있습니다.',missionId};
    const runForm=new FormData(); runForm.set('mission_id',missionId); runForm.set('instruction','');
    const result=await runResearch({},runForm);
    revalidatePath('/sourcing');
    return {...result,missionId};
  } catch { return {error:'요청 처리에 실패했습니다. 아래 저장된 요청을 확인해 주세요.',missionId}; }
}

async function getAdmin(){
  const supabase=await createClient();
  const { data:{ user } }=await supabase.auth.getUser();
  if(!user) throw new Error("authentication_required");

  const { data:admin }=await supabase
    .from("admin_users")
    .select("role,active")
    .eq("auth_user_id",user.id)
    .maybeSingle();

  if(!admin?.active) throw new Error("admin_required");
  return { supabase,user,admin };
}

function num(value){
  if(value===null || value===undefined || String(value).trim()==='') return null;
  const n=Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function runResearch(previousState,formData){
  let supabase, job, response, called=false;
  try {
    ({supabase}=await getAdmin());
    const credentials=await gatewayCredentials();
    if(!researchConfiguration(credentials).configured) throw new Error('missing_auth');
    const missionId=String(formData.get('mission_id') || '');
    const instruction=String(formData.get('instruction') || '').trim();
    const started=await supabase.rpc('start_sourcing_research',{p_mission_id:missionId,p_instruction:instruction});
    if(started.error) {
      const messages={research_disabled:'AI 실행이 꺼져 있습니다. 운영 설정에서 소싱 조사를 활성화해야 합니다.',
        research_already_running:'다른 조사가 실행 중입니다. 완료 후 다시 실행해 주세요.',
        daily_research_limit:'24시간 조사 한도(10회)에 도달했습니다.',research_cooldown:'연속 실행을 방지했습니다. 30초 후 다시 실행해 주세요.',
        mission_closed:'완료 또는 취소된 미션은 실행할 수 없습니다.'};
      return {error:messages[started.error.message] || '조사 시작을 저장하지 못했습니다. 설정과 권한을 확인해 주세요.'};
    }
    job=started.data;
    called=true;
    response=await requestResearch(job.objective,{env:credentials});
    const result=parseResearch(response);
    const finished=await supabase.rpc('finish_sourcing_research',{
      p_job_id:job.id,p_result:result,p_error:null,p_response_id:response.id || null,
      p_usage:{...response.usage,requests:1},
    });
    if(finished.error) throw new Error('result_save_failed');
    const saved=await supabase.from('sourcing_research_jobs').select('status').eq('id',job.id).single();
    if(saved.error || saved.data?.status!=='completed') throw new Error('result_save_failed');
    revalidatePath('/sourcing');revalidatePath('/knowledge');
    return {message:`조사를 완료했습니다. 출처 ${result.sources.length}개를 저장했습니다. 후보와 미확인 조건을 아래에서 검토해 주세요.`};
  } catch(error) {
    const message=researchError(error);
    if(job && supabase){
      const failed=await supabase.rpc('finish_sourcing_research',{
        p_job_id:job.id,p_result:null,p_error:message,p_response_id:response?.id || null,
        p_usage:{...response?.usage,requests:called ? 1 : 0},
      });
      revalidatePath('/sourcing');
      if(failed.error) return {error:`${message} 실패 기록도 저장되지 않았습니다. 작업 ID: ${job.id}`};
    }
    return {error:message};
  }
}

export async function createMission(formData){
  const { supabase,user }=await getAdmin();

  const title=String(formData.get("title") || "").trim();
  const brief=String(formData.get("brief") || "").trim();
  const category=String(formData.get("category") || "").trim();
  const targetCustomer=String(formData.get("target_customer") || "").trim();
  const channels=String(formData.get("target_channels") || "")
    .split(",").map((x)=>x.trim()).filter(Boolean);

  if(!title || !brief) return;

  await supabase.from("sourcing_missions").insert({
    title,
    category:category || null,
    brief,
    target_customer:targetCustomer || null,
    target_channels:channels,
    target_retail_price:num(formData.get("target_retail_price")),
    target_gross_margin_pct:num(formData.get("target_gross_margin_pct")),
    max_initial_cash:num(formData.get("max_initial_cash")),
    created_by:user.id,
  });

  revalidatePath("/sourcing");
}

export async function addCandidate(formData){
  const { supabase }=await getAdmin();

  const missionId=String(formData.get("mission_id") || "");
  const name=String(formData.get("name") || "").trim();
  if(!missionId || !name) return;

  const purchasePrice=num(formData.get("purchase_price"));
  const targetRetail=num(formData.get("target_retail_price"));

  const margin=(purchasePrice!==null && targetRetail!==null && targetRetail>0)
    ? ((targetRetail-purchasePrice)/targetRetail)*100
    : null;

  await supabase.from("sourcing_candidates").insert({
    mission_id:missionId,
    candidate_type:String(formData.get("candidate_type") || "product"),
    name,
    source_name:String(formData.get("source_name") || "").trim() || null,
    source_url:String(formData.get("source_url") || "").trim() || null,
    category:String(formData.get("category") || "").trim() || null,
    product_summary:String(formData.get("product_summary") || "").trim() || null,
    purchase_price:purchasePrice,
    moq:num(formData.get("moq")),
    lead_time_days:num(formData.get("lead_time_days")),
    settlement_terms:String(formData.get("settlement_terms") || "").trim() || null,
    supplier_name:String(formData.get("supplier_name") || "").trim() || null,
    supplier_contact:String(formData.get("supplier_contact") || "").trim() || null,
    target_retail_price:targetRetail,
    estimated_gross_margin_pct:margin,
    supply_risk:String(formData.get("supply_risk") || "unknown"),
    evidence_status:String(formData.get("evidence_status") || "unverified"),
    notes:String(formData.get("notes") || "").trim() || null,
  });

  revalidatePath("/sourcing");
}

export async function updateCandidateStatus(formData){
  const { supabase }=await getAdmin();

  const id=String(formData.get("id") || "");
  const status=String(formData.get("status") || "");
  const allowed=["discovered","researching","screening","shortlisted","rejected","promoted"];
  if(!id || !allowed.includes(status)) return;

  await supabase
    .from("sourcing_candidates")
    .update({status,updated_at:new Date().toISOString()})
    .eq("id",id);

  revalidatePath("/sourcing");
}

export async function promoteCandidate(formData){
  const { supabase }=await getAdmin();
  const id=String(formData.get("candidate_id") || "");
  if(!id) return;

  await supabase.rpc("promote_sourcing_candidate",{p_candidate_id:id});

  revalidatePath("/sourcing");
  revalidatePath("/founder-room");
}


export async function prepareResearchJob(formData){
  const { supabase }=await getAdmin();
  const missionId=String(formData.get("mission_id") || "");
  if(!missionId) return;

  await supabase.rpc("prepare_sourcing_research_job",{p_mission_id:missionId});

  revalidatePath("/sourcing");
}
