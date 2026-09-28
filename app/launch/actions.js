'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '../../lib/supabase/server';
import { validatePlan, prerequisites, amount } from '../../lib/launch/model.mjs';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function admin(){
 const db=await createClient(); const {data:{user}}=await db.auth.getUser();
 if(!user)throw new Error('로그인이 필요합니다.');
 const {data}=await db.from('admin_users').select('active').eq('auth_user_id',user.id).maybeSingle();
 if(!data?.active)throw new Error('관리자 권한이 필요합니다.');return {db,user};
}
export async function savePlan(form){
 try{
 const {db,user}=await admin(); const data=validatePlan(form);const id=String(form.get('id')||'');
 if(!uuid.test(id))return {ok:false,message:'상품 식별자가 올바르지 않습니다. 새로고침해 주세요.'};
 const version=Number(form.get('version'));
 if(!Number.isInteger(version)||version<0) return {ok:false,message:'저장 버전이 올바르지 않습니다.'};
 const query=version===0 ? db.from('launch_plans').insert({id,data,created_by:user.id}) : db.from('launch_plans').update({data,version:version+1,updated_at:new Date().toISOString()}).eq('id',id).eq('version',version);
 const result=await query.select('id').maybeSingle();
 if(result.error||!result.data)return {ok:false,message:result.error?.code==='23505'||!result.error ? '다른 화면에서 변경되었거나 이미 저장됐습니다. 새로고침 후 확인해 주세요.' : '저장하지 못했습니다. 입력값과 연결 상태를 확인해 주세요.'};
 revalidatePath('/launch');return {ok:true,message:'상품 준비 내용을 저장했습니다. 쿠팡에는 아직 전송되지 않았습니다.'};
 }catch(e){return {ok:false,message:e.message};}
}
export async function savePrerequisite(form){
 try{
 const {db,user}=await admin();const key=String(form.get('key'));const status=String(form.get('status'));const evidence=String(form.get('evidence')||'').trim().slice(0,2000);
 if(!prerequisites.some(([k])=>k===key)||!['unknown','pending','ready'].includes(status))return {ok:false,message:'입력값을 확인해 주세요.'};
 if(status==='ready'&&!evidence)return {ok:false,message:'완료 확인 근거와 날짜를 입력해 주세요.'};
 const {error}=await db.from('launch_prerequisites').upsert({key,status,evidence,updated_by:user.id,updated_at:new Date().toISOString()});
 if(error)return {ok:false,message:'상태를 저장하지 못했습니다.'};revalidatePath('/launch');return {ok:true,message:'확인 상태를 저장했습니다.'};
 }catch(e){return {ok:false,message:e.message};}
}
export async function saveReview(form){
 try{
 const {db,user}=await admin();const plan_id=String(form.get('plan_id'));const id=String(form.get('id'));const period=String(form.get('period')||'').trim().slice(0,200);
 const facts=String(form.get('facts')||'').trim().slice(0,2000);const action=String(form.get('action')||'').trim().slice(0,2000);
 const hypothesis=String(form.get('hypothesis')||'').trim().slice(0,2000);
 const orders=amount(form.get('orders'));
 if(!uuid.test(plan_id)||!uuid.test(id)||!period||!facts||!action||orders===null||!Number.isInteger(orders))return {ok:false,message:'기간·주문수·관측 사실·다음 행동을 입력해 주세요.'};
 const {error}=await db.from('launch_reviews').insert({id,plan_id,period,orders,facts,hypothesis,action,created_by:user.id});
 if(error)return {ok:false,message:error.code==='23505'?'이미 기록된 피드백입니다. 새로고침해 주세요.':'피드백을 저장하지 못했습니다.'};
 revalidatePath('/launch');return {ok:true,message:'피드백을 기록했습니다.'};
 }catch(e){return {ok:false,message:e.message};}
}
