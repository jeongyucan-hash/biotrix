'use server';
import {revalidatePath} from 'next/cache';
import {createClient} from '../../../lib/supabase/server';
import {draftFor,validateDraft,validateQuote,mailReady,dispatch} from '../../../lib/sourcing/outreach.mjs';
import {safeUrl} from '../../../lib/launch/model.mjs';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function owner(){const db=await createClient();const {data:{user}}=await db.auth.getUser();if(!user)throw new Error('로그인이 필요합니다.');const {data}=await db.from('admin_users').select('role,active').eq('auth_user_id',user.id).maybeSingle();if(!data?.active||data.role!=='owner')throw new Error('대표 계정에서 처리해 주세요.');return {db,user};}
function versioned(form){const id=String(form.get('id')||''),version=Number(form.get('version'));if(!uuid.test(id)||!Number.isInteger(version)||version<1)throw new Error('새로고침 후 다시 시도해 주세요.');return {id,version};}
function refresh(){revalidatePath('/sourcing/outreach');}
export async function prepareOutreach(form){try{
 const {db,user}=await owner();const id=String(form.get('candidate_id')||'');if(!uuid.test(id))throw new Error('공급처를 선택해 주세요.');
 const {data:c,error}=await db.from('sourcing_candidates').select('*').eq('id',id).single();if(error||!c)throw new Error('공급처를 불러오지 못했습니다.');
 const draft=draftFor(c);if(!draft.recipient)throw new Error('공급처 이메일을 먼저 확인해 주세요. 현재 연락처에서 이메일을 찾을 수 없습니다.');
 const saved=await db.from('supplier_outreach').insert({...draft,candidate_id:id,created_by:user.id});if(saved.error)throw new Error(saved.error.code==='23505'?'이미 문의 초안이 있습니다. 아래에서 확인해 주세요.':'초안을 저장하지 못했습니다.');refresh();return {ok:true,message:'문의 초안을 만들었습니다. 아직 발송되지 않았습니다.'};
}catch(e){return {ok:false,message:e.message};}}
export async function saveOutreach(form){try{
 const {db}=await owner();const {id,version}=versioned(form),data=validateDraft(form);
 const {data:saved,error}=await db.from('supplier_outreach').update({...data,version:version+1,status:'draft',error:null,updated_at:new Date().toISOString()}).eq('id',id).eq('version',version).in('status',['draft','failed']).select('id').maybeSingle();
 if(error||!saved)throw new Error('다른 화면에서 변경됐거나 이미 발송 처리 중입니다. 새로고침해 주세요.');refresh();return {ok:true,message:'초안을 저장했습니다. 발송은 별도 버튼으로 실행합니다.'};
}catch(e){return {ok:false,message:e.message};}}
export async function sendOutreach(form){try{
 const {db}=await owner();const {id,version}=versioned(form);
 if(!mailReady())throw new Error('회사 메일 발신 연결이 필요합니다. 초안은 저장되어 있습니다.');
 if(form.get('approve')!=='on')throw new Error('받는 사람과 저장된 내용을 확인하고 발송에 체크해 주세요.');
 const {data:row,error}=await db.from('supplier_outreach').update({status:'sending',updated_at:new Date().toISOString()}).eq('id',id).eq('version',version).eq('status','draft').select('*').maybeSingle();
 if(error||!row)throw new Error('이미 처리됐거나 변경된 문의입니다. 새로고침해 주세요.');
 const result=await dispatch(row);
 const saved=await db.from('supplier_outreach').update({...result,updated_at:new Date().toISOString()}).eq('id',id).eq('version',version).eq('status','sending').select('id').maybeSingle();
 refresh();if(saved.error||!saved.data)return {ok:false,message:'발송 결과 저장에 실패했습니다. 중복 발송하지 말고 관리자에게 접수 여부를 확인해 주세요.'};
 return {ok:result.status==='accepted',message:result.status==='accepted'?'발송 서비스가 접수했습니다. 실제 배달과 회신은 아직 확인되지 않았습니다.':result.error};
}catch(e){return {ok:false,message:e.message};}}
export async function saveQuote(form){try{
 const {db,user}=await owner();const id=String(form.get('quote_id')||''),outreach_id=String(form.get('outreach_id')||'');if(!uuid.test(id)||!uuid.test(outreach_id))throw new Error('새로고침 후 다시 입력해 주세요.');
 const data=validateQuote(form);const {error}=await db.from('supplier_quotes').insert({id,outreach_id,data,created_by:user.id});
 if(error)throw new Error(error.code==='23505'?'이미 저장된 회신입니다. 새로고침 후 확인해 주세요.':'견적을 저장하지 못했습니다.');refresh();return {ok:true,message:'견적 회신을 기록했습니다. 상품 선정·주문은 아직 실행되지 않았습니다.'};
}catch(e){return {ok:false,message:e.message};}}
export async function useQuote(form){try{
 const {db,user}=await owner();const id=String(form.get('quote_id')||'');if(!uuid.test(id))throw new Error('견적을 선택해 주세요.');
 const {data:q}=await db.from('supplier_quotes').select('*').eq('id',id).single();if(!q)throw new Error('견적을 불러오지 못했습니다.');
 const {data:o}=await db.from('supplier_outreach').select('candidate_id').eq('id',q.outreach_id).single();
 const {data:c}=await db.from('sourcing_candidates').select('name,source_url').eq('id',o?.candidate_id).single();if(!c||!safeUrl(c.source_url))throw new Error('공급처 출처 링크를 먼저 확인해 주세요.');
 const d=q.data;const data={name:d.spec,supplier:c.name,source_url:c.source_url,spec:d.spec,purchase:d.purchase,shipping:d.shipping,price:null,customer_shipping:null,fee:null,discount:null,ad:null,claims:null,checks:{channel:false,images:false,spec:false,stock:false,returns:false,listing:false,order:false},decision:'review',evidence:`견적 ${q.id} / 유효일 ${d.valid_until||'미확인'}\n${d.evidence}\n${d.terms||''}\n${d.reply}`.slice(0,2000),next_action:'견적 유효기간·거래조건을 검토하고 판매가·플랫폼 비용·클레임 비용 입력'};
 const {error}=await db.from('launch_plans').insert({id:q.id,data,created_by:user.id});if(error&&error.code!=='23505')throw new Error('판매 준비로 가져오지 못했습니다.');revalidatePath('/launch');return {ok:true,message:error?'이미 가져온 견적입니다. 첫 판매 준비에서 확인하세요.':'공급처·규격·견적을 첫 판매 준비로 가져왔습니다. 거래조건은 아직 미확인 상태입니다.'};
}catch(e){return {ok:false,message:e.message};}}
