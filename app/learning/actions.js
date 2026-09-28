'use server';
import {revalidatePath} from 'next/cache';
import {createClient} from '../../lib/supabase/server';
import {evaluateVariants} from '../../lib/learning/model.mjs';
import {auditBrand} from '../../lib/learning/brandAudit.mjs';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import manifest from '../../lib/design/manifest.json';
async function admin(){const db=await createClient();const {data:{user}}=await db.auth.getUser();if(!user)return null;const {data:a}=await db.from('admin_users').select('active').eq('auth_user_id',user.id).maybeSingle();return a?.active?{db,user}:null;}
export async function recordObservation(form){
 const ctx=await admin();if(!ctx)return {ok:false,message:'운영자 로그인 후 이용해 주세요.'};
 const page=String(form.get('page')||'').trim(),variant=String(form.get('variant')||'').trim(),source=String(form.get('source')||'').trim(),note=String(form.get('note')||'').trim(),impressions=Number(form.get('impressions')),actions=Number(form.get('actions'));
 if(!/^\/[a-z0-9/-]{0,100}$/.test(page)||!(/^[a-z0-9_-]{1,50}$/.test(variant))||!Number.isSafeInteger(impressions)||impressions<1||impressions>1000000||!Number.isSafeInteger(actions)||actions<0||actions>impressions||source.length<3||source.length>200||note.length>1000)return {ok:false,message:'경로·시안·노출·행동 수·출처를 확인해 주세요.'};
 const {error}=await ctx.db.from('design_learning_observations').insert({page,variant,impressions,actions,source,note,recorded_by:ctx.user.id});
 if(error)return {ok:false,message:'관측값을 저장하지 못했습니다.'};revalidatePath('/learning');return {ok:true,message:'출처와 함께 저장했습니다.'};
}
export async function runEvaluation(form){
 const ctx=await admin();if(!ctx)return {ok:false,message:'운영자 로그인 후 이용해 주세요.'};
 const page=String(form.get('page')||'').trim();if(!/^\/[a-z0-9/-]{0,100}$/.test(page))return {ok:false,message:'경로를 확인해 주세요.'};
 const {data,error}=await ctx.db.from('design_learning_observations').select('id,page,variant,impressions,actions,source,created_at').eq('page',page).order('created_at',{ascending:true}).limit(1000);
 if(error)return {ok:false,message:'관측값을 불러오지 못했습니다.'};if(!data?.length)return {ok:false,message:'실제 관측값을 먼저 입력해 주세요.'};
 const result=evaluateVariants(data);const {error:saveError}=await ctx.db.from('design_learning_models').insert({page,observations_count:result.observationsCount,total_impressions:result.totalImpressions,result:{...result,observationIds:data.map(r=>r.id)},created_by:ctx.user.id});
 if(saveError)return {ok:false,message:'평가 결과를 저장하지 못했습니다.'};revalidatePath('/learning');return {ok:true,message:result.recommendation?'평가를 저장했습니다. 운영 반영은 디자인실에서 검수합니다.':'표본이 부족해 추천 없이 평가 이력만 저장했습니다.'};
}
export async function runBrandAudit(){
 const ctx=await admin();if(!ctx)return {ok:false,message:'운영자 로그인 후 이용해 주세요.'};
 const assets=Object.fromEntries(await Promise.all(manifest.files.map(async f=>[f.name,await readFile(join(process.cwd(),'design-assets',f.name)).catch(()=>null)])));
 const result=auditBrand({manifest,assets});
 const {error}=await ctx.db.from('brand_review_runs').insert({master_version:result.masterVersion,status:result.status,report:result,created_by:ctx.user.id});
 if(error)return {ok:false,message:'자체 점검 결과를 저장하지 못했습니다.'};
 revalidatePath('/learning');return {ok:true,message:result.status==='pass'?`${result.assetsChecked}개 파일 기준 자체 점검을 기록했습니다.`:`${result.issues.length}개 점검 항목이 발견되었습니다. 아래 이력을 확인해 주세요.`};
}
