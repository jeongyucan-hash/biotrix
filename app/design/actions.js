'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '../../lib/supabase/server';
import { DESIGN_PREFIX, validateDecision, validateRequest } from '../../lib/design/validation.mjs';
import manifest from '../../lib/design/manifest.json';
async function adminContext() {
  const db=await createClient();
  const {data:{user}}=await db.auth.getUser();
  if(!user) return null;
  const {data:admin}=await db.from('admin_users').select('active').eq('auth_user_id',user.id).maybeSingle();
  return admin?.active ? {db,user} : null;
}
export async function recordDesignDecision(previous,form) {
  const fields=validateDecision(form);
  if(!fields) return {ok:false,message:'제목, 결정 내용과 근거를 입력하고 글자 수를 확인해 주세요.'};
  const ctx=await adminContext();
  if(!ctx) return {ok:false,message:'로그인한 운영자만 결정을 기록할 수 있습니다.'};
  const {error}=await ctx.db.from('decisions').insert({...fields,title:`${DESIGN_PREFIX} ${fields.title}`,context:`마스터 DM-${manifest.version}\n${fields.context}`,decided_by:ctx.user.id});
  if(error) return {ok:false,message:'결정을 저장하지 못했습니다. 입력 내용을 유지한 채 다시 시도해 주세요.'};
  revalidatePath('/design');revalidatePath('/knowledge');
  return {ok:true,message:'결정과 근거를 기록했습니다. 이 기록만으로 마스터나 운영 사이트가 변경되지는 않습니다.'};
}
export async function requestDesignWork(previous,form) {
  const fields=validateRequest(form);
  if(!fields) return {ok:false,message:'업무명, 요청 내용, 완료 기준과 우선순위를 확인해 주세요.'};
  const ctx=await adminContext();
  if(!ctx) return {ok:false,message:'로그인한 운영자만 업무를 접수할 수 있습니다.'};
  const [settings,decisions]=await Promise.all([
    ctx.db.from('company_settings').select('value').eq('key','design.department').maybeSingle(),
    ctx.db.from('decisions').select('id,title,decision,rationale').like('title',`${DESIGN_PREFIX}%`).eq('status','active').order('decided_at',{ascending:false}).limit(20)
  ]);
  if(settings.error || decisions.error || !settings.data) return {ok:false,message:'HQ 디자인 기준을 불러오지 못해 접수를 중단했습니다. 다시 시도해 주세요.'};
  const objective=`담당: 홈페이지 디자인실 (website_design / marketing)\n기준: DM-${manifest.version}\nHQ: /design\n\n요청\n${fields.objective}\n\n완료 기준\n${fields.criteria}\n\nHQ 디자인 기준\n${JSON.stringify(settings.data.value)}\n\n최근 결정\n${JSON.stringify(decisions.data)}\n\n실행 규칙\nHQ의 결정과 마스터를 먼저 확인하고, 변경 이유·변경 파일·검수 근거·배포 결과를 기록하세요. 생성 무드 이미지를 실제 상품으로 표시하지 마세요. AI 파일은 PDF 기반 호환본이며 네이티브 AI로 표시하지 마세요. 수행하지 않은 작업이나 자동 실행을 완료로 보고하지 마세요.`;
  const {data:id,error}=await ctx.db.rpc('prepare_chatgpt_work_item',{p_department:'marketing',p_title:`${DESIGN_PREFIX} ${fields.title}`,p_objective:objective,p_priority:fields.priority,p_opportunity_id:null,p_sourcing_mission_id:null});
  if(error || !id) return {ok:false,message:'업무를 접수하지 못했습니다. 다시 시도해 주세요.'};
  revalidatePath('/design');revalidatePath('/work-queue');
  return {ok:true,id,message:'디자인실 업무로 접수했습니다. HQ 기준과 최근 결정을 실행 요청에 함께 담았습니다.'};
}
