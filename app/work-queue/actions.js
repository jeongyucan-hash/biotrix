'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '../../lib/supabase/server';
async function getAdmin(){
  const db=await createClient();
  const {data:{user}}=await db.auth.getUser();
  if(!user) return null;
  const {data:admin}=await db.from('admin_users').select('active').eq('auth_user_id',user.id).maybeSingle();
  return admin?.active ? db : null;
}
function refresh(){for(const path of ['/work-queue','/tasks','/sites','/design','/admin','/knowledge']) revalidatePath(path);}
async function run(name,args,message){
  const db=await getAdmin();
  if(!db) return {ok:false,message:'로그인한 운영자만 처리할 수 있습니다.'};
  const {error}=await db.rpc(name,args);
  if(error) return {ok:false,message:'저장하지 못했습니다. 업무 상태와 입력 내용을 확인한 뒤 다시 시도해주세요.'};
  refresh(); return {ok:true,message};
}
export async function createWorkItem(form){
  const title=String(form.get('title')||'').trim();
  const objective=String(form.get('objective')||'').trim();
  if(!title || title.length>200 || !objective || objective.length>20000) return {ok:false,message:'업무명과 요청 내용을 확인해주세요.'};
  return run('prepare_chatgpt_work_item',{
    p_department:String(form.get('department')||'founder'),p_title:title,p_objective:objective,
    p_priority:String(form.get('priority')||'medium'),p_opportunity_id:String(form.get('opportunity_id')||'')||null,
    p_sourcing_mission_id:String(form.get('sourcing_mission_id')||'')||null,
  },'업무가 접수됐습니다.');
}
export async function saveWorkResult(form){
  return run('save_hq_work_result',{p_work_item_id:String(form.get('work_item_id')||''),p_result_id:String(form.get('result_id')||''),p_text:String(form.get('result_text')||'').trim()},'결과와 검수 대기 상태를 함께 저장했습니다.');
}
export async function acceptWorkResult(form){
  return run('accept_hq_work_result',{p_result_id:String(form.get('result_id')||'')},'결과를 채택하고 지식에 저장했습니다. 운영 배포 완료와는 별도입니다.');
}
export async function setWorkStatus(form){
  return run('set_hq_work_status',{p_id:String(form.get('id')||''),p_status:String(form.get('status')||'')},'업무 상태를 변경했습니다.');
}
